import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import config from '../../config';
import {MyModalComponent} from '../my-modal/my-modal.component';
import {take} from 'rxjs/operators';
import Swal from 'sweetalert2'

interface Clinic {
  id: number;
  name: string;
  address: string;
  phone: string;
  status: string;
}

interface ClinicResponse {
  data: Clinic[];
}

@Component({
  selector: 'app-clinic',
  imports: [MyModalComponent, CommonModule, FormsModule],
  templateUrl: './clinic.component.html',
  styleUrl: './clinic.component.css'
})
export class ClinicComponent {

  Clinics: Clinic[] = [];

  loading = false;

  formClinic: Partial<Clinic & { id?: number }> = {
    id: 0,
    name: '',
    address: '',
    phone: '',
    status: '1'
  };


  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.loadData();
  }

  get isEditMode(): boolean {
    return !!(this.formClinic.id && this.formClinic.id > 0);
  }

  get modalTitle(): string {
    return this.isEditMode ? 'แก้ไขข้อมูลคลินิก' : 'เพิ่มข้อมูลคลินิก';
  }

  get modalIcon(): string {
    return this.isEditMode ? 'fa-solid fa-hospital' : 'fa-solid fa-hospital';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'บันทึก' : 'เพิ่ม';
  }

  onSubmit(form: NgForm) {
    Swal.fire({
      title: this.isEditMode ? 'ยืนยันการแก้ไข?' : 'ยืนยันการเพิ่มคลินิก?',
      text: this.isEditMode
        ? 'คุณต้องการบันทึกการแก้ไขคลินิกนี้หรือไม่?'
        : 'คุณต้องการเพิ่มคลินิกใหม่นี้หรือไม่?',
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
      const payload = {
        name: this.formClinic.name,
        address: this.formClinic.address,
        phone: this.formClinic.phone,
        status: this.formClinic.status,
        id: this.formClinic.id
      };

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const request$ = this.isEditMode
        ? this.http.put(`${config.apiServer}/api/v1/Clinics/editClinic/${this.formClinic.id}`, payload, {headers})
        : this.http.post(`${config.apiServer}/api/v1/Clinics/addClinic`, payload, {headers});

      request$.pipe(take(1)).subscribe({
        next: (res: any) => {
          console.log(this.isEditMode ? 'Edit Clinic Success:' : 'Add Clinic Success:', res);
          Swal.fire({
            title: 'สำเร็จ',
            text: res.message || (this.isEditMode ? 'แก้ไขคลินิกสำเร็จ' : 'เพิ่มคลินิกสำเร็จ'),
            icon: 'success',
            confirmButtonText: 'ตกลง'
          });
          this.loadData();
          this.resetForm();
          this.closeModal();
        },
        error: (err) => {
          console.error(this.isEditMode ? 'Edit Clinic Error:' : 'Add Clinic Error:', err);

          Swal.fire({
            title: 'ข้อผิดพลาด',
            text: 'ไม่สามารถบันทึกข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
            icon: 'error',
            confirmButtonText: 'ตกลง'
          });
        }
      });
    } catch (err) {
      console.error('Save Clinic Client Error:', err);
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
    const modalElement = document.getElementById('modalClinic');
    if (modalElement) {
      // ใช้ data-bs-dismiss attribute
      const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  resetForm() {
    this.formClinic = {
      id: 0,
      name: '',
      address: '',
      phone: '',
      status: '1'
    };
  }


  editClinic(Clinic: Clinic) {
    this.formClinic = {
      id: Clinic.id,
      name: Clinic.name,
      address: Clinic.address,
      phone: Clinic.phone,
      status: Clinic.status
    };
  }


  disableClinic(Id: number) {
    Swal.fire({
      title: 'ยืนยันการปิดการใช้งาน?',
      text: 'คุณต้องการปิดการใช้งานคลินิกนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDisableClinic(Id);
      }
    });
  }

  private performDisableClinic(Id: number) {
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
        .patch(`${config.apiServer}/api/v1/Clinics/disableClinic/${Id}`, {}, {headers})
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            console.log('Disable Clinic Success:', res);
            Swal.fire({
              title: 'สำเร็จ',
              text: res.message || 'ปิดการใช้งานสำเร็จ',
              icon: 'success',
              confirmButtonText: 'ตกลง'
            });
            this.loadData();
          },
          error: (err) => {
            console.error('Disable Clinic Error:', err);

            Swal.fire({
              title: 'ข้อผิดพลาด',
              text: 'ไม่สามารถปิดการใช้งานได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
              icon: 'error',
              confirmButtonText: 'ตกลง'
            });
          }
        });
    } catch (err) {
      console.error('Disable Clinic Client Error:', err);
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

    this.http.get<ClinicResponse>(`${config.apiServer}/api/v1/Clinics/getClinic`, {
      headers
    }).subscribe({
      next: (response) => {
        this.Clinics = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading Clinic:', error);
        this.loading = false;
        this.Clinics = [];
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
