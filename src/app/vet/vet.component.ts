import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import config from '../../config';
import {MyModalComponent} from '../my-modal/my-modal.component';
import {take} from 'rxjs/operators';
import Swal from 'sweetalert2'

interface Vet {
  id: number;
  name: string;
  phone: string;
  clinicId: number | null;
  clinic_Name: string;
  status: string;
}

interface Clinic {
  id: number;
  name: string;
  status: string;
}

interface VetResponse {
  data: Vet[];
}

@Component({
  selector: 'app-vet',
  imports: [MyModalComponent, CommonModule, FormsModule],
  templateUrl: './vet.component.html',
  styleUrl: './vet.component.css'
})
export class VetComponent {

  Vets: Vet[] = [];
  Clinics: Clinic[] = [];

  loading = false;

  formVet: Partial<Vet & { id?: number }> = {
    id: 0,
    name: '',
    phone: '',
    clinicId:0,
    clinic_Name: '',
    status: '1'
  };


  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.loadData();
    this.loadClinics();
  }

  get isEditMode(): boolean {
    return !!(this.formVet.id && this.formVet.id > 0);
  }

  get modalTitle(): string {
    return this.isEditMode ? 'แก้ไขข้อมูลสัตวแพทย์' : 'เพิ่มข้อมูลสัตวแพทย์';
  }

  get modalIcon(): string {
    return this.isEditMode ? 'fa-solid fa-user-doctor' : 'fa-solid fa-user-doctor';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'บันทึก' : 'เพิ่ม';
  }

  loadClinics() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<{ data: Clinic[] }>(`${config.apiServer}/api/v1/clinics/getClinic`, { headers })
      .pipe(take(1))
      .subscribe({
        next: res => {
          this.Clinics = res.data;
        },
        error: err => {
          console.error('Error loading clinics:', err);
        }
      });
  }

  onSubmit(form: NgForm) {
    Swal.fire({
      title: this.isEditMode ? 'ยืนยันการแก้ไข?' : 'ยืนยันการเพิ่มสัตวแพทย์?',
      text: this.isEditMode
        ? 'คุณต้องการบันทึกการแก้ไขสัตวแพทย์นี้หรือไม่?'
        : 'คุณต้องการเพิ่มสัตวแพทย์ใหม่นี้หรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        if (form.valid) {
          this.save();
        } else {
          Swal.fire({
            title: 'ข้อผิดพลาด',
            text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
            icon: 'error',
            confirmButtonText: 'ตกลง'
          });
        }
      }
    });
  }

  save() {
    try {
      if (!this.formVet.clinicId) {
        this.formVet.clinicId = null;
      }


      const payload = {
        name: this.formVet.name,
        phone: this.formVet.phone,
        clinicId: this.formVet.clinicId,
        status: this.formVet.status,
        id: this.formVet.id
      };

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const request$ = this.isEditMode
        ? this.http.put(`${config.apiServer}/api/v1/Vets/editVet/${this.formVet.id}`, payload, {headers})
        : this.http.post(`${config.apiServer}/api/v1/Vets/addVet`, payload, {headers});

      request$.pipe(take(1)).subscribe({
        next: (res: any) => {
          console.log(this.isEditMode ? 'Edit Vet Success:' : 'Add Vet Success:', res);
          Swal.fire({
            title: 'สำเร็จ',
            text: res.message || (this.isEditMode ? 'แก้ไขสัตวแพทย์สำเร็จ' : 'เพิ่มสัตวแพทย์สำเร็จ'),
            icon: 'success',
            confirmButtonText: 'ตกลง'
          });
          this.loadData();
          this.resetForm();
          this.closeModal();
        },
        error: (err) => {
          console.error(this.isEditMode ? 'Edit Vet Error:' : 'Add Vet Error:', err);

          Swal.fire({
            title: 'ข้อผิดพลาด',
            text: 'ไม่สามารถบันทึกข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
            icon: 'error',
            confirmButtonText: 'ตกลง'
          });
        }
      });
    } catch (err) {
      console.error('Save Vet Client Error:', err);
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }

  private closeModal() {
    // ปิด modal ด้วย Bootstrap 5
    const modalElement = document.getElementById('modalVet');
    if (modalElement) {
      // ใช้ data-bs-dismiss attribute
      const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  resetForm() {
    this.formVet = {
      id: 0,
      name: '',
      phone: '',
      clinicId: 0,
      clinic_Name: '',
      status: '1'
    };
  }


  editVet(Vet: Vet) {
    this.formVet = {
      id: Vet.id,
      name: Vet.name,
      phone: Vet.phone,
      clinicId: Vet.clinicId,
      status: Vet.status
    };
  }


  disableVet(Id: number) {
    Swal.fire({
      title: 'ยืนยันการปิดการใช้งาน?',
      text: 'คุณต้องการปิดการใช้งานสัตวแพทย์นี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDisableVet(Id);
      }
    });
  }

  private performDisableVet(Id: number) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('ไม่พบ token การยืนยันตัวตน');
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      this.http
        .patch(`${config.apiServer}/api/v1/Vets/disableVet/${Id}`, {}, {headers})
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            console.log('Disable Vet Success:', res);
            Swal.fire({
              title: 'สำเร็จ',
              text: res.message || 'ปิดการใช้งานสำเร็จ',
              icon: 'success',
              confirmButtonText: 'ตกลง'
            });
            this.loadData();
          },
          error: (err) => {
            console.error('Disable Vet Error:', err);

            Swal.fire({
              title: 'ข้อผิดพลาด',
              text: 'ไม่สามารถปิดการใช้งานได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
              icon: 'error',
              confirmButtonText: 'ตกลง'
            });
          }
        });
    } catch (err) {
      console.error('Disable Vet Client Error:', err);
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }


  loadData() {
    this.loading = true;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<VetResponse>(`${config.apiServer}/api/v1/Vets/getVet`, {
      headers
    }).subscribe({
      next: (response) => {
        this.Vets = response.data;
        this.loading = false;
        console.log(this.Vets);
      },
      error: (error) => {
        console.error('Error loading Vet:', error);
        this.loading = false;
        this.Vets = [];
      }
    });
  }


  getStatusText(status: string): string {
    switch (status) {
      case '1':
        return 'ใช้งานได้';
      case '2':
        return 'ปิดใช้งาน';
      default:
        return status;
    }
  }
}
