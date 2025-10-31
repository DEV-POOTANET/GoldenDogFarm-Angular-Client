import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import config from '../../config';
import { MyModalComponent } from '../my-modal/my-modal.component';
import { take } from 'rxjs/operators';
import Swal from 'sweetalert2';

interface Dog {
  id: number;
  name: string;
}

interface BreedingAttempt {
  id: number;
  breedId: number; // ID การผสมพันธุ์ (Breeding ID)
  father: { id: number; name: string }; // พ่อสุนัขสำหรับแสดงผล
  date: string; // วันที่พยายามผสม
  notes?: string;
  typeBreed: string; // ประเภทการผสม
  status: string;
}

interface Breeding {
  id: number;
  mother: { id: number; name: string };
  mother_ID?: number;
  dueDate: string;
  actualBirthDate?: string;
  notes?: string;
  puppyCount?: number;
  status: string;
  attempts: BreedingAttempt[];
}

interface BreedingResponse {
  page?: number;
  limit?: number;
  total: number;
  data: Breeding[];
}

// ขยาย Interface เพื่อรองรับ ID ของพ่อสุนัข (father_ID) และ ID การผสม (breed_ID)
// ซึ่งใช้ในฟอร์มและ payload แต่ไม่มีใน API response object (BreedingAttempt) โดยตรง
type AttemptForm = Partial<BreedingAttempt & {
  id?: number;
  breed_ID: number;
  father_ID: number;
}>;


@Component({
  selector: 'app-breeding',
  imports: [MyModalComponent, CommonModule, FormsModule],
  templateUrl: './breeding.component.html',
  styleUrl: './breeding.component.css'
})
export class BreedingComponent implements OnInit {
  /* ---------- DATA ---------- */
  breedings: Breeding[] = [];
  mothers: Dog[] = [];      // แม่สุนัข (female)
  fathers: Dog[] = [];      // พ่อสุนัข (male)

  /* ---------- FILTERS ---------- */
  // searchMotherName = '';
  searchStatus = '';
  searchYear: number | '' = '';
  searchMonth: number | '' = '';
  months = Array.from({ length: 12 }, (_, i) => i + 1);

  /* ---------- PAGINATION ---------- */
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;
  loading = false;

  /* ---------- FORMS ---------- */
  formBreeding: Partial<Breeding & { id?: number }> = {
    id: 0,
    mother_ID: 0,
    dueDate: '',
    actualBirthDate: '',
    notes: '',
    puppyCount: 0,
    status: '1',
    attempts: []
  };


  formAttempt: AttemptForm = {
    id: 0,
    breed_ID: 0,
    father_ID: 0,
    date: '',
    notes: '',
    typeBreed: '',
    status: '1'
  };

  currentBreedingIdForAttempt = 0;   // ใช้ตอนเปิด modal เพิ่ม attempt

  Math = Math;

  constructor(private http: HttpClient) {}

  /* ---------- LIFECYCLE ---------- */
  ngOnInit() {
    this.loadDropdowns();
    this.loadBreedings();
  }

  /* ---------- DROPDOWNS ---------- */
  loadDropdowns() {
    this.loadMothers();
    this.loadFathers();
  }

  loadMothers() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<{ data: Dog[] }>(`${config.apiServer}/api/v1/dogs/getDogs?dog_Gender=F&dog_StatusBreeding=1`, { headers })
      .subscribe({
        next: r => this.mothers = r.data,
        error: err => console.error('loadMothers error', err)
      });
  }

  loadFathers() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<{ data: Dog[] }>(`${config.apiServer}/api/v1/dogs/getDogs?dog_Gender=M&dog_StatusBreeding=1`, { headers })
      .subscribe({
        next: r => this.fathers = r.data,
        error: err => console.error('loadFathers error', err)
      });
  }

  /* ---------- API CALLS ---------- */
  loadBreedings() {
    this.loading = true;
    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', this.pageSize.toString());

    // if (this.searchMotherName) params = params.set('mother_Name', this.searchMotherName);
    if (this.searchStatus)      params = params.set('status', this.searchStatus);
    if (this.searchYear)        params = params.set('year', this.searchYear.toString());
    if (this.searchMonth)       params = params.set('month', this.searchMonth.toString());

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<BreedingResponse>(`${config.apiServer}/api/v1/breedings/getBreedings`, { params, headers })
      .subscribe({
        next: res => {
          this.breedings = res.data;
          this.totalRecords = res.total;
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
          this.loading = false;
        },
        error: err => {
          console.error(err);
          this.loading = false;
          Swal.fire('ผิดพลาด', 'ไม่สามารถดึงข้อมูลได้', 'error');
        }
      });
  }

  /* ---------- FILTER / PAGINATION ---------- */
  searchBreedings() {
    this.currentPage = 1;
    this.loadBreedings();
  }
  changePageSize() {
    this.currentPage = 1;
    this.pageSize = Number(this.pageSize);
    this.loadBreedings();
  }
  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) {
      this.currentPage = p;
      this.loadBreedings();
    }
  }
  getPageNumbers(): number[] {
    const max = 5;
    let start = Math.max(1, this.currentPage - Math.floor(max / 2));
    let end = Math.min(this.totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  /* ---------- MODAL BREEDING ---------- */
  get isEditBreeding(): boolean { return !!this.formBreeding.id; }
  get breedingModalTitle(): string { return this.isEditBreeding ? 'แก้ไขการผสมพันธุ์' : 'เพิ่มการผสมพันธุ์'; }
  get breedingModalIcon(): string { return 'fa-solid fa-heart'; }
  get breedingSubmitText(): string { return this.isEditBreeding ? 'บันทึก' : 'เพิ่ม'; }

  resetForm() {
    this.formBreeding = {
      id: 0, mother_ID: 0, dueDate: '', actualBirthDate: '',
      notes: '', puppyCount: 0, status: '1', attempts: []
    };
  }

  editBreeding(b: Breeding) {
    this.formBreeding = {
      id: b.id,
      mother_ID: b.mother.id,
      dueDate: b.dueDate,
      actualBirthDate: b.actualBirthDate,
      notes: b.notes,
      puppyCount: b.puppyCount,
      status: b.status,
      attempts: [...b.attempts]
    };
  }

  onSubmitBreeding(f: NgForm) {
    Swal.fire({
      title: this.isEditBreeding ? 'ยืนยันการแก้ไข?' : 'ยืนยันการเพิ่ม?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    }).then(r => {
      if (r.isConfirmed && f.valid) this.saveBreeding();
    });
  }

  private saveBreeding() {
    const payload = {
      mother_ID: this.formBreeding.mother_ID,
      dueDate: this.formBreeding.dueDate,
      actualBirthDate: this.formBreeding.actualBirthDate,
      notes: this.formBreeding.notes,
      puppyCount: this.formBreeding.puppyCount,
      status: this.formBreeding.status
    };

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const url = this.isEditBreeding
      ? `${config.apiServer}/api/v1/breedings/editBreeding/${this.formBreeding.id}`
      : `${config.apiServer}/api/v1/breedings/addBreeding`;

    const req = this.isEditBreeding
      ? this.http.put(url, payload, { headers })
      : this.http.post(url, payload, { headers });

    req.pipe(take(1)).subscribe({
      next: () => {
        Swal.fire('สำเร็จ', this.isEditBreeding ? 'แก้ไขเรียบร้อย' : 'เพิ่มเรียบร้อย', 'success');
        this.loadBreedings();
        this.closeModal('modalAddBreeding');
        this.resetForm();
      },
      error: err => this.handleError(err, 'บันทึกการผสมพันธุ์')
    });
  }

  /* ---------- DISABLE BREEDING ---------- */
  disableBreeding(id: number) {
    Swal.fire({
      title: 'ยืนยันการปิดใช้งาน?',
      text: 'การผสมพันธุ์นี้จะถูกซ่อน',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    }).then(r => {
      if (r.isConfirmed) this.performDisableBreeding(id);
    });
  }

  private performDisableBreeding(id: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.patch(`${config.apiServer}/api/v1/breedings/disableBreeding/${id}`, {}, { headers })
      .pipe(take(1))
      .subscribe({
        next: () => {
          Swal.fire('สำเร็จ', 'ปิดการใช้งานเรียบร้อย', 'success');
          this.loadBreedings();
        },
        error: err => this.handleError(err, 'ปิดการใช้งาน')
      });
  }

  /* ---------- MODAL ATTEMPT ---------- */
  get attemptModalTitle(): string { return this.formAttempt.id ? 'แก้ไขการพยายามผสม' : 'เพิ่มการพยายามผสม'; }
  get attemptModalIcon(): string { return 'fa-solid fa-heart'; }
  get attemptSubmitText(): string { return this.formAttempt.id ? 'บันทึก' : 'เพิ่ม'; }

  openAddAttemptModal(breedId: number) {
    this.currentBreedingIdForAttempt = breedId;
    this.resetAttemptForm();
  }

  resetAttemptForm() {
    this.formAttempt = {
      id: 0,
      breed_ID: this.currentBreedingIdForAttempt,
      father_ID: 0,
      date: '',
      notes: '',
      typeBreed: '',
      status: '1'
    };
  }

  editAttempt(a: BreedingAttempt) {
    this.currentBreedingIdForAttempt = a.breedId;

    this.formAttempt = {
      id: a.id,
      breed_ID: a.breedId,
      father_ID: a.father.id,
      date: a.date,
      notes: a.notes,
      typeBreed: a.typeBreed,
      status: a.status
    };
  }

  onSubmitAttempt(f: NgForm) {
    Swal.fire({
      title: this.formAttempt.id ? 'ยืนยันการแก้ไข?' : 'ยืนยันการเพิ่ม?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    }).then(r => {
      if (r.isConfirmed && f.valid) this.saveAttempt();
    });
  }

  private saveAttempt() {
    const payload = {
      breed_ID: this.currentBreedingIdForAttempt,
      father_ID: this.formAttempt.father_ID,
      attempt_Date: this.formAttempt.date,
      attempt_Notes: this.formAttempt.notes,
      attempt_TypeBreed: this.formAttempt.typeBreed,
      attempt_Status: this.formAttempt.status
    };
   console.log(payload);
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const url = this.formAttempt.id
      ? `${config.apiServer}/api/v1/breedingAttempts/editBreedingAttempt/${this.formAttempt.id}`
      : `${config.apiServer}/api/v1/breedingAttempts/addBreedingAttempt`;

    const req = this.formAttempt.id
      ? this.http.put(url, payload, { headers })
      : this.http.post(url, payload, { headers });

    req.pipe(take(1)).subscribe({
      next: () => {
        Swal.fire('สำเร็จ', this.formAttempt.id ? 'แก้ไขเรียบร้อย' : 'เพิ่มเรียบร้อย', 'success');
        this.loadBreedings();
        this.closeModal('modalAddAttempt');
        this.resetAttemptForm();
      },
      error: err => this.handleError(err, 'บันทึกการพยายามผสม')
    });
  }

  /* ---------- DISABLE ATTEMPT ---------- */
  disableAttempt(id: number) {
    Swal.fire({
      title: 'ยืนยันการปิดใช้งาน?',
      text: 'การพยายามผสมนี้จะถูกซ่อน',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    }).then(r => {
      if (r.isConfirmed) this.performDisableAttempt(id);
    });
  }

  private performDisableAttempt(id: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.patch(`${config.apiServer}/api/v1/breedingAttempts/disableBreedingAttempt/${id}`, {}, { headers })
      .pipe(take(1))
      .subscribe({
        next: () => {
          Swal.fire('สำเร็จ', 'ปิดการใช้งานเรียบร้อย', 'success');
          this.loadBreedings();
        },
        error: err => this.handleError(err, 'ปิดการใช้งาน')
      });
  }

  /* ---------- HELPERS ---------- */
  private closeModal(modalId: string) {
    const el = document.getElementById(modalId);
    if (el) {
      const btn = el.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
      if (btn) btn.click();
    }
  }

  private handleError(err: any, action: string) {
    let msg = 'เกิดข้อผิดพลาด';
    if (err.status === 400) msg = err.error?.error || 'ข้อมูลไม่ถูกต้อง';
    else if (err.status === 404) msg = err.error?.error || 'ไม่พบข้อมูล';
    else if (err.status === 401) msg = 'กรุณา login ใหม่';
    else if (err.status === 0) msg = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์';
    Swal.fire('ผิดพลาด', `${action}: ${msg}`, 'error');
  }

  /* ---------- TEXT MAPPING ---------- */
  getBreedingStatusText(s: string): string {
    const map: Record<string, string> = {
      '1': 'กำลังดำเนินการ',
      '2': 'สำเร็จ',
      '3': 'ไม่สำเร็จ',
      '4': 'ปิดใช้งาน'
    };
    return map[s] || s;
  }

  getAttemptStatusText(s: string): string {
    const map: Record<string, string> = {
      '1': 'กำลังดำเนินการ',
      '2': 'สำเร็จ',
      '3': 'ไม่สำเร็จ',
    };
    return map[s] || s;
  }

  getAttemptTypeText(t: string): string {
    const map: Record<string, string> = {
      '1': 'ผสมเทียม',
      '2': 'ธรรมชาติ',
    };
    return map[t] || t;
  }
}
