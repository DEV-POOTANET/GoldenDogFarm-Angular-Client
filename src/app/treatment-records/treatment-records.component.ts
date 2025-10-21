import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { take } from 'rxjs/operators';
import config from '../../config';
import { MyModalComponent } from '../my-modal/my-modal.component';
import Swal from 'sweetalert2';

// ==================== INTERFACES ====================
interface TreatmentRecord {
  id: number;
  tlId: number;
  tlName: string;
  dogId: number;
  dogName: string;
  vetId: number;
  vetName: string;
  userId: number;
  userName: string;
  startDate: string;
  endDate: string | null;
  status: string;
}

interface ListItem {
  id: number;
  name: string;
}

interface TreatmentRecordResponse {
  page: number;
  limit: number;
  total: number;
  data: any[];
}

// ==================== COMPONENT ====================
@Component({
  selector: 'app-treatment-records',
  standalone: true,
  imports: [MyModalComponent, CommonModule, FormsModule],
  templateUrl: './treatment-records.component.html',
  styleUrls: ['./treatment-records.component.css'],
  providers: [DatePipe]
})
export class TreatmentRecordsComponent implements OnInit {
  // Data Arrays
  treatmentRecords: TreatmentRecord[] = [];
  dogs: ListItem[] = [];
  treatmentLists: ListItem[] = [];
  vets: ListItem[] = [];
  users: ListItem[] = [];

  // Loading State
  loading = false;

  // Search Filters
  searchDogName = '';
  searchStatus = '';

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalRecords = 0;
  totalPages = 0;

  // Math for Template
  Math = Math;

  // Form Data
  formTreatmentRecord: Partial<TreatmentRecord & { id?: number }> = {
    id: 0,
    tlId: undefined,
    dogId: undefined,
    vetId: undefined,
    userId: undefined,
    startDate: '',
    endDate: '',
    status: '1'
  };

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe
  ) {}

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.loadDropdowns();
    this.loadTreatmentRecords();
  }

  // ==================== DROPDOWN LOADERS ====================
  private loadDropdowns(): void {
    this.loadDogs();
    this.loadTreatmentLists();
    this.loadVets();
    this.loadUsers();
  }

  loadDogs(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<{ data: ListItem[] }>(
      `${config.apiServer}/api/v1/dogs/getDogs?status=1`,
      { headers }
    ).subscribe({
      next: (res) => this.dogs = res.data,
      error: (err) => console.error('Error loading dogs:', err)
    });
  }

  loadTreatmentLists(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<{ data: ListItem[] }>(
      `${config.apiServer}/api/v1/treatmentList/getTreatment`,
      { headers }
    ).subscribe({
      next: (res) => this.treatmentLists = res.data,
      error: (err) => console.error('Error loading treatment lists:', err)
    });
  }

  loadVets(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<{ data: ListItem[] }>(
      `${config.apiServer}/api/v1/vets/getVet`,
      { headers }
    ).subscribe({
      next: (res) => this.vets = res.data,
      error: (err) => console.error('Error loading vets:', err)
    });
  }

  loadUsers(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<{ data: ListItem[] }>(
      `${config.apiServer}/api/v1/users/getUserAll`,
      { headers }
    ).subscribe({
      next: (res) => this.users = res.data,
      error: (err) => console.error('Error loading users:', err)
    });
  }

  // ==================== GETTERS ====================
  get isEditMode(): boolean {
    return !!(this.formTreatmentRecord.id && this.formTreatmentRecord.id > 0);
  }

  get modalTitle(): string {
    return this.isEditMode ? 'แก้ไขข้อมูลการรักษา' : 'เพิ่มข้อมูลการรักษา';
  }

  get modalIcon(): string {
    return this.isEditMode ? 'fa-solid fa-pen' : 'fa-solid fa-plus';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'บันทึก' : 'เพิ่ม';
  }

  // ==================== FORM METHODS ====================
  onSubmit(form: NgForm): void {
    Swal.fire({
      title: this.isEditMode ? 'ยืนยันการแก้ไข?' : 'ยืนยันการเพิ่มการรักษา?',
      text: this.isEditMode
        ? 'คุณต้องการบันทึกการแก้ไขการรักษานี้หรือไม่?'
        : 'คุณต้องการเพิ่มการรักษาใหม่นี้หรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed && form.valid) {
        this.save();
      } else if (result.isConfirmed) {
        Swal.fire({
          title: 'ข้อผิดพลาด',
          text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        });
      }
    });
  }

  save(): void {
    const payload = {
      tlId: this.formTreatmentRecord.tlId,
      dogId: this.formTreatmentRecord.dogId,
      vetId: this.formTreatmentRecord.vetId,
      userId: this.formTreatmentRecord.userId,
      startDate: this.formTreatmentRecord.startDate,
      endDate: this.formTreatmentRecord.endDate || null,
      status: this.formTreatmentRecord.status
    };

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const request$ = this.isEditMode
      ? this.http.put(
        `${config.apiServer}/api/v1/treatmentRecord/updateTreatmentRecord/${this.formTreatmentRecord.id}`,
        payload,
        { headers }
      )
      : this.http.post(
        `${config.apiServer}/api/v1/treatmentRecord/addTreatmentRecord`,
        payload,
        { headers }
      );

    request$.pipe(take(1)).subscribe({
      next: (res: any) => {
        Swal.fire({
          title: 'สำเร็จ',
          text: res.message || (this.isEditMode ? 'แก้ไขสำเร็จ' : 'เพิ่มสำเร็จ'),
          icon: 'success',
          confirmButtonText: 'ตกลง'
        });
        this.loadTreatmentRecords();
        this.resetForm();
        this.closeModal();
      },
      error: this.handleError.bind(this)
    });
  }

  private closeModal() {
    const modalElement = document.getElementById('modalAddTreatmentRecord');
    if (modalElement) {
      const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  resetForm(): void {
    this.formTreatmentRecord = {
      id: 0,
      tlId: undefined,
      dogId: undefined,
      vetId: undefined,
      userId: undefined,
      startDate: '',
      endDate: '',
      status: '1'
    };
  }

  editTreatmentRecord(treatment: TreatmentRecord): void {
    this.formTreatmentRecord = { ...treatment };
  }

  // ==================== DISABLE METHODS ====================
  disableTreatmentRecord(id: number): void {
    Swal.fire({
      title: 'ยืนยันการปิดการใช้งาน?',
      text: 'คุณต้องการปิดการใช้งานการรักษานี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDisableTreatmentRecord(id);
      }
    });
  }

  private performDisableTreatmentRecord(id: number): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http
      .patch(`${config.apiServer}/api/v1/treatmentRecord/disableTreatmentRecord/${id}`, {}, { headers })
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          Swal.fire({
            title: 'สำเร็จ',
            text: res.message || 'ปิดการใช้งานสำเร็จ',
            icon: 'success',
            confirmButtonText: 'ตกลง'
          });
          this.loadTreatmentRecords();
        },
        error: this.handleError.bind(this)
      });
  }

  // ==================== DATA LOADING ====================
  loadTreatmentRecords(): void {
    this.loading = true;

    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', this.pageSize.toString());

    if (this.searchDogName) params = params.set('dogName', this.searchDogName);
    if (this.searchStatus) params = params.set('status', this.searchStatus);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<TreatmentRecordResponse>(
      `${config.apiServer}/api/v1/treatmentRecord/getTreatmentRecords`,
      { params, headers }
    ).subscribe({
      next: (response) => {
        // map nested objects to flat structure
        this.treatmentRecords = response.data.map(item => ({
          id: item.id,
          tlId: item.treatmentList.id,
          tlName: item.treatmentList.name,
          dogId: item.dog.id,
          dogName: item.dog.name,
          vetId: item.vet.id,
          vetName: item.vet.name,
          userId: item.user.id,
          userName: item.user.name,
          startDate: item.startDate,
          endDate: item.endDate,
          status: item.status
        }));
        this.totalRecords = response.total;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading treatment records:', error);
        this.loading = false;
        this.treatmentRecords = [];
        this.totalRecords = 0;
        this.totalPages = 0;
      }
    });
  }

  // ==================== SEARCH & PAGINATION ====================
  searchTreatmentRecords(): void {
    this.currentPage = 1;
    this.loadTreatmentRecords();
  }

  changePageSize(): void {
    this.currentPage = 1;
    this.pageSize = Number(this.pageSize);
    this.loadTreatmentRecords();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTreatmentRecords();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // ==================== HELPERS ====================
  private handleError(err: any): void {
    console.error('Error:', {
      status: err.status,
      statusText: err.statusText,
      message: err.message,
      error: err.error?.error || err.error || 'Unknown error',
      url: err.url
    });

    let errorMessage = 'เกิดข้อผิดพลาด';
    switch (err.status) {
      case 400: errorMessage = err.error?.error || 'ข้อมูลที่ส่งไม่ถูกต้อง'; break;
      case 404: errorMessage = err.error?.error || 'ไม่พบข้อมูล'; break;
      case 401: errorMessage = 'ไม่ได้รับอนุญาต กรุณา login ใหม่'; break;
      case 500: errorMessage = err.error?.error || 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์'; break;
      case 0: errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์'; break;
    }

    Swal.fire({
      title: 'ข้อผิดพลาด',
      text: errorMessage,
      icon: 'error',
      confirmButtonText: 'ตกลง'
    });
  }

  getStatusText(status: string): string {
    return {
      '1': 'กำลังรักษา',
      '2': 'หายป่วย',
      '3': 'เสียชีวิต',
      '4': 'ลบ'
    }[status] || status;
  }
}
