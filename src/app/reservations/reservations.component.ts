import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { take } from 'rxjs/operators';
import config from '../../config';
import { MyModalComponent } from '../my-modal/my-modal.component';
import Swal from 'sweetalert2';

// ==================== INTERFACES ====================
interface Reservation {
  id: number;
  breedId: number | null;
  breedDueDate: string | null;
  dogId: number | null;
  dogName: string | null;
  cusId: number;
  cusName: string;
  userId: number;
  userName: string;
  date: string;
  deposit: number;
  status: string;
  cancelReason: string | null;
  depositStatus: string | null;
  cancelDate: string | null;
  notes: string | null;
}

interface ListItem {
  id: number;
  name: string;
}

interface ReservationResponse {
  page: number;
  limit: number;
  total: number;
  data: any[];
}

// ==================== COMPONENT ====================
@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [MyModalComponent, CommonModule, FormsModule],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css'],
  providers: [DatePipe]
})
export class ReservationsComponent implements OnInit {
  // Data Arrays
  reservations: Reservation[] = [];
  breedings: ListItem[] = [];
  dogs: ListItem[] = [];
  customers: ListItem[] = [];
  users: ListItem[] = [];

  // Loading State
  loading = false;

  // Search Filters
  searchCusName = '';
  searchStatus = '';
  searchDepositStatus = '';

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalRecords = 0;
  totalPages = 0;

  // Math for Template
  Math = Math;

  // Form Data
  formReservation: Partial<Reservation & { id?: number }> = {
    id: 0,
    breedId: null,
    dogId: null,
    cusId: undefined,
    userId: undefined,
    date: '',
    deposit: undefined,
    status: '1',
    cancelReason: null,
    depositStatus: null,
    cancelDate: null,
    notes: ''
  };

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe
  ) {}

  // ==================== LIFECYCLE ====================
  ngOnInit(): void {
    this.loadDropdowns();
    this.loadReservations();
  }

  // ==================== DROPDOWN LOADERS ====================
  private loadDropdowns(): void {
    this.loadBreedings();
    this.loadDogs();
    this.loadCustomers();
    this.loadUsers();
  }

  loadBreedings(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<{ data: ListItem[] }>(
      `${config.apiServer}/api/v1/breedings/getBreedings`,
      { headers }
    ).subscribe({
      next: (res) => {
        this.breedings = (res.data as any[]).map(b => ({
          id: b.id,
          name: b.mother?.name || '-'
        }));
      },
      error: (err) => console.error('Error loading breedings:', err)
    });
  }

  loadDogs(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<{ data: ListItem[] }>(
      `${config.apiServer}/api/v1/dogs/getDogs?dog_StatusSale=1`,
      { headers }
    ).subscribe({
      next: (res) => this.dogs = res.data,
      error: (err) => console.error('Error loading dogs:', err)
    });
  }

  loadCustomers(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<{ data: ListItem[] }>(
      `${config.apiServer}/api/v1/customers/getCustomers`,
      { headers }
    ).subscribe({
      next: (res) => this.customers = res.data,
      error: (err) => console.error('Error loading customers:', err)
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
    return !!(this.formReservation.id && this.formReservation.id > 0);
  }

  get modalTitle(): string {
    return this.isEditMode ? 'แก้ไขข้อมูลการจอง' : 'เพิ่มข้อมูลการจอง';
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
      title: this.isEditMode ? 'ยืนยันการแก้ไข?' : 'ยืนยันการเพิ่มการจอง?',
      text: this.isEditMode
        ? 'คุณต้องการบันทึกการแก้ไขการจองนี้หรือไม่?'
        : 'คุณต้องการเพิ่มการจองใหม่นี้หรือไม่?',
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
      breedId: this.formReservation.breedId || null,
      dogId: this.formReservation.dogId || null,
      cusId: this.formReservation.cusId,
      userId: this.formReservation.userId,
      date: this.formReservation.date,
      deposit: this.formReservation.deposit,
      status: this.formReservation.status,
      cancelReason: this.formReservation.cancelReason || null,
      depositStatus: this.formReservation.depositStatus || null,
      cancelDate: this.formReservation.cancelDate || null,
      notes: this.formReservation.notes || null
    };

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const request$ = this.isEditMode
      ? this.http.put(
        `${config.apiServer}/api/v1/reservation/updateReservation/${this.formReservation.id}`,
        payload,
        { headers }
      )
      : this.http.post(
        `${config.apiServer}/api/v1/reservation/addReservation`,
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
        this.loadReservations();
        this.resetForm();
        this.closeModal();
      },
      error: this.handleError.bind(this)
    });
  }

  private closeModal() {
    const modalElement = document.getElementById('modalAddReservation');
    if (modalElement) {
      const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  resetForm(): void {
    this.formReservation = {
      id: 0,
      breedId: null,
      dogId: null,
      cusId: undefined,
      userId: undefined,
      date: '',
      deposit: undefined,
      status: '1',
      cancelReason: null,
      depositStatus: null,
      cancelDate: null,
      notes: ''
    };
  }

  editReservation(reservation: Reservation): void {
    this.formReservation = { ...reservation };
  }

  // ==================== DISABLE METHODS ====================
  disableReservation(id: number): void {
    Swal.fire({
      title: 'ยืนยันการปิดการใช้งาน?',
      text: 'คุณต้องการปิดการใช้งานการจองนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDisableReservation(id);
      }
    });
  }

  private performDisableReservation(id: number): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http
      .patch(`${config.apiServer}/api/v1/reservation/disableReservation/${id}`, {}, { headers })
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          Swal.fire({
            title: 'สำเร็จ',
            text: res.message || 'ปิดการใช้งานสำเร็จ',
            icon: 'success',
            confirmButtonText: 'ตกลง'
          });
          this.loadReservations();
        },
        error: this.handleError.bind(this)
      });
  }

  // ==================== DATA LOADING ====================
  loadReservations(): void {
    this.loading = true;

    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', this.pageSize.toString());

    if (this.searchCusName) params = params.set('cusName', this.searchCusName);
    if (this.searchStatus) params = params.set('status', this.searchStatus);
    if (this.searchDepositStatus) params = params.set('depositStatus', this.searchDepositStatus);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<ReservationResponse>(
      `${config.apiServer}/api/v1/reservation/getReservations`,
      { params, headers }
    ).subscribe({
      next: (response) => {
        // map nested objects to flat structure
        this.reservations = response.data.map(item => ({
          id: item.id,
          breedId: item.breed?.id || null,
          breedDueDate: item.breed?.dueDate || null,
          dogId: item.dog?.id || null,
          dogName: item.dog?.name || null,
          cusId: item.customer.id,
          cusName: item.customer.name,
          userId: item.user.id,
          userName: item.user.name,
          date: item.date,
          deposit: item.deposit,
          status: item.status,
          cancelReason: item.cancelReason || null,
          depositStatus: item.depositStatus || null,
          cancelDate: item.cancelDate || null,
          notes: item.notes || ''
        }));
        this.totalRecords = response.total;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.loading = false;
        this.reservations = [];
        this.totalRecords = 0;
        this.totalPages = 0;
      }
    });
  }

  // ==================== SEARCH & PAGINATION ====================
  searchReservations(): void {
    this.currentPage = 1;
    this.loadReservations();
  }

  changePageSize(): void {
    this.currentPage = 1;
    this.pageSize = Number(this.pageSize);
    this.loadReservations();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadReservations();
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
      '1': 'จองแล้ว',
      '2': 'ถูกยกเลิก',
      '3': 'รอคืนมัดจำ',
      '4': 'จำหน่ายแล้ว'
    }[status] || status;
  }

  getCancelReasonText(reason: string | null): string {
    if (!reason) return '-';
    return {
      '1': 'ลูกค้าผิดเงื่อนไข',
      '2': 'ปัญหาจากฟาร์ม'
    }[reason] || reason;
  }

  getDepositStatusText(depositStatus: string | null): string {
    if (!depositStatus) return '-';
    return {
      '1': 'รอคืน',
      '2': 'คืนแล้ว',
      '3': 'ยึดเงินมัดจำ'
    }[depositStatus] || depositStatus;
  }

  generatePDF(id: number): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(
      `${config.apiServer}/api/v1/reservation/generatePDF/${id}`,
      { headers, responseType: 'blob' }
    ).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reservation_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        Swal.fire({
          title: 'สำเร็จ',
          text: 'ดาวน์โหลด PDF เรียบร้อย',
          icon: 'success',
          confirmButtonText: 'ตกลง'
        });
      },
      error: this.handleError.bind(this)
    });
  }
}
