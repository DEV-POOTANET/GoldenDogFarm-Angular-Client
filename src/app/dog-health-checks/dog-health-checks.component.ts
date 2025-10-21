import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { take } from 'rxjs/operators';
import config from '../../config';
import { MyModalComponent } from '../my-modal/my-modal.component';
import Swal from 'sweetalert2';

// ==================== INTERFACES ====================
interface DogHealthCheck {
  id: number;
  dogId: number;
  dogName: string;
  hclId: number;
  hclName: string;
  vetId: number;
  vetName: string;
  scheduledDate: string;
  actualDate: string | null;
  notes: string;
  status: string;
  result: string;
}

interface ListItem {
  id: number;
  name: string;
}

interface DogHealthCheckResponse {
  page: number;
  limit: number;
  total: number;
  data: any[];
}

// ==================== COMPONENT ====================
@Component({
  selector: 'app-dog-health-checks',
  standalone: true,
  imports: [MyModalComponent, CommonModule, FormsModule],
  templateUrl: './dog-health-checks.component.html',
  styleUrls: ['./dog-health-checks.component.css'],
  providers: [DatePipe]
})
export class DogHealthChecksComponent implements OnInit {
  // Data Arrays
  dogHealthChecks: DogHealthCheck[] = [];
  dogs: ListItem[] = [];
  healthCheckLists: ListItem[] = [];
  vets: ListItem[] = [];

  // Loading State
  loading = false;

  // Search Filters
  searchDogName = '';
  searchStatus = '';
  searchResult = '';

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalRecords = 0;
  totalPages = 0;

  // Math for Template
  Math = Math;

  // Form Data
  formDogHealthCheck: Partial<DogHealthCheck & { id?: number }> = {
    id: 0,
    dogId: undefined,
    hclId: undefined,
    vetId: undefined,
    scheduledDate: '',
    actualDate: '',
    notes: '',
    status: '1',
    result: '1'
  };

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe
  ) {}

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.loadDropdowns();
    this.loadDogHealthChecks();
  }

  // ==================== DROPDOWN LOADERS ====================
  private loadDropdowns(): void {
    this.loadDogs();
    this.loadHealthCheckLists();
    this.loadVets();
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

  loadHealthCheckLists(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<{ data: ListItem[] }>(
      `${config.apiServer}/api/v1/healthCheckList/get_hcl`,
      { headers }
    ).subscribe({
      next: (res) => this.healthCheckLists = res.data,
      error: (err) => console.error('Error loading health check lists:', err)
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

  // ==================== GETTERS ====================
  get isEditMode(): boolean {
    return !!(this.formDogHealthCheck.id && this.formDogHealthCheck.id > 0);
  }

  get modalTitle(): string {
    return this.isEditMode ? 'แก้ไขข้อมูลการตรวจสุขภาพ' : 'เพิ่มข้อมูลการตรวจสุขภาพ';
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
      title: this.isEditMode ? 'ยืนยันการแก้ไข?' : 'ยืนยันการเพิ่มการตรวจสุขภาพ?',
      text: this.isEditMode
        ? 'คุณต้องการบันทึกการแก้ไขการตรวจสุขภาพนี้หรือไม่?'
        : 'คุณต้องการเพิ่มการตรวจสุขภาพใหม่นี้หรือไม่?',
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
      dogId: this.formDogHealthCheck.dogId,
      hclId: this.formDogHealthCheck.hclId,
      vetId: this.formDogHealthCheck.vetId,
      scheduledDate: this.formDogHealthCheck.scheduledDate,
      actualDate: this.formDogHealthCheck.actualDate || null,
      notes: this.formDogHealthCheck.notes,
      status: this.formDogHealthCheck.status,
      result: this.formDogHealthCheck.result
    };

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const request$ = this.isEditMode
      ? this.http.put(
        `${config.apiServer}/api/v1/dogHealthCheck/updateDogHealthCheck/${this.formDogHealthCheck.id}`,
        payload,
        { headers }
      )
      : this.http.post(
        `${config.apiServer}/api/v1/dogHealthCheck/addDogHealthCheck`,
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
        this.loadDogHealthChecks();
        this.resetForm();
        this.closeModal();
      },
      error: this.handleError.bind(this)
    });
  }



  private closeModal() {
    const modalElement = document.getElementById('modalAddDogHealthCheck');
    if (modalElement) {
      const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }
  resetForm(): void {
    this.formDogHealthCheck = {
      id: 0,
      dogId: undefined,
      hclId: undefined,
      vetId: undefined,
      scheduledDate: '',
      actualDate: '',
      notes: '',
      status: '1',
      result: '1'
    };
  }

  editDogHealthCheck(healthCheck: DogHealthCheck): void {
    this.formDogHealthCheck = { ...healthCheck };
  }

  // ==================== DISABLE METHODS ====================
  disableDogHealthCheck(id: number): void {
    Swal.fire({
      title: 'ยืนยันการปิดการใช้งาน?',
      text: 'คุณต้องการปิดการใช้งานการตรวจสุขภาพนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDisableDogHealthCheck(id);
      }
    });
  }

  private performDisableDogHealthCheck(id: number): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http
      .patch(`${config.apiServer}/api/v1/dogHealthCheck/disableDogHealthCheck/${id}`, {}, { headers })
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          Swal.fire({
            title: 'สำเร็จ',
            text: res.message || 'ปิดการใช้งานสำเร็จ',
            icon: 'success',
            confirmButtonText: 'ตกลง'
          });
          this.loadDogHealthChecks();
        },
        error: this.handleError.bind(this)
      });
  }

  // ==================== DATA LOADING ====================
  loadDogHealthChecks(): void {
    this.loading = true;

    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', this.pageSize.toString());

    if (this.searchDogName) params = params.set('dogName', this.searchDogName);
    if (this.searchStatus) params = params.set('status', this.searchStatus);
    if (this.searchResult) params = params.set('result', this.searchResult);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<DogHealthCheckResponse>(
      `${config.apiServer}/api/v1/dogHealthCheck/getDogHealthChecks`,
      { params, headers }
    ).subscribe({
      next: (response) => {
        // map nested objects to flat structure
        this.dogHealthChecks = response.data.map(item => ({
          id: item.id,
          dogId: item.dog.id,
          dogName: item.dog.name,
          hclId: item.healthCheckList.id,
          hclName: item.healthCheckList.name,
          vetId: item.vet.id,
          vetName: item.vet.name,
          scheduledDate: item.scheduledDate,
          actualDate: item.actualDate,
          notes: item.notes || '',
          status: item.status,
          result: item.result
        }));
        this.totalRecords = response.total;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dog health checks:', error);
        this.loading = false;
        this.dogHealthChecks = [];
        this.totalRecords = 0;
        this.totalPages = 0;
      }
    });
  }

  // ==================== SEARCH & PAGINATION ====================
  searchDogHealthChecks(): void {
    this.currentPage = 1;
    this.loadDogHealthChecks();
  }

  changePageSize(): void {
    this.currentPage = 1;
    this.pageSize = Number(this.pageSize);
    this.loadDogHealthChecks();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadDogHealthChecks();
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
      '1': 'นัดหมาย',
      '2': 'สำเร็จ',
      '3': 'ยกเลิก',
      '4': 'ลบ'
    }[status] || status;
  }

  getResultText(result: string): string {
    return {
      '1': 'รอผล',
      '2': 'ปกติ',
      '3': 'ผิดปกติ'
    }[result] || result;
  }
}
