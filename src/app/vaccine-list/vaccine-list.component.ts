import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import config from '../../config';
import { MyModalComponent } from '../my-modal/my-modal.component';
import { take } from 'rxjs/operators';
import Swal from 'sweetalert2';

interface Vaccine {
  id: number;
  name: string;
  description: string;
  status: string;
}

interface VaccineResponse {
  data: Vaccine[];
}

@Component({
  selector: 'app-vaccine-list',
  imports: [MyModalComponent, CommonModule, FormsModule],
  templateUrl: './vaccine-list.component.html',
  styleUrl: './vaccine-list.component.css'
})
export class VaccineListComponent implements OnInit{

  Vaccines: Vaccine[] = [];
  loading = false;
  formVaccine: Partial<Vaccine & { id?: number }> = {
    id: 0,
    name: '',
    description: '',
    status: '1'
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadData();
  }

  get isEditMode(): boolean {
    return !!(this.formVaccine.id && this.formVaccine.id > 0);
  }

  get modalTitle(): string {
    return this.isEditMode ? 'แก้ไขข้อมูลวัคซีน' : 'เพิ่มข้อมูลวัคซีน';
  }

  get modalIcon(): string {
    return this.isEditMode ? 'fa-solid fa-syringe' : 'fa-solid fa-syringe';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'บันทึก' : 'เพิ่ม';
  }

  onSubmit(form: NgForm) {
    Swal.fire({
      title: this.isEditMode ? 'ยืนยันการแก้ไข?' : 'ยืนยันการเพิ่มวัคซีน?',
      text: this.isEditMode
        ? 'คุณต้องการบันทึกการแก้ไขข้อมูลวัคซีนนี้หรือไม่?'
        : 'คุณต้องการเพิ่มวัคซีนใหม่นี้หรือไม่?',
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
        name: this.formVaccine.name,
        description: this.formVaccine.description,
        status: this.formVaccine.status,
        id: this.formVaccine.id
      };

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const request$ = this.isEditMode
        ? this.http.put(`${config.apiServer}/api/v1/vaccines/editVaccine/${this.formVaccine.id}`, payload, { headers })
        : this.http.post(`${config.apiServer}/api/v1/vaccines/addVaccine`, payload, { headers });

      request$.pipe(take(1)).subscribe({
        next: (res: any) => {
          console.log(this.isEditMode ? 'Edit Vaccine Success:' : 'Add Vaccine Success:', res);
          Swal.fire({
            title: 'สำเร็จ',
            text: res.message || (this.isEditMode ? 'แก้ไขข้อมูลวัคซีนสำเร็จ' : 'เพิ่มข้อมูลวัคซีนสำเร็จ'),
            icon: 'success',
            confirmButtonText: 'ตกลง'
          });
          this.loadData();
          this.resetForm();
          this.closeModal();
        },
        error: (err) => {
          console.error(this.isEditMode ? 'Edit Vaccine Error:' : 'Add Vaccine Error:', err);
          Swal.fire({
            title: 'ข้อผิดพลาด',
            text: 'ไม่สามารถบันทึกข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
            icon: 'error',
            confirmButtonText: 'ตกลง'
          });
        }
      });
    } catch (err) {
      console.error('Save Vaccine Client Error:', err);
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }

  private closeModal() {
    const modalElement = document.getElementById('modalVaccine');
    if (modalElement) {
      const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  resetForm() {
    this.formVaccine = {
      id: 0,
      name: '',
      description: '',
      status: '1'
    };
  }

  editVaccine(vaccine: Vaccine) {
    this.formVaccine = {
      id: vaccine.id,
      name: vaccine.name,
      description: vaccine.description,
      status: vaccine.status
    };
  }

  disableVaccine(id: number) {
    Swal.fire({
      title: 'ยืนยันการปิดการใช้งาน?',
      text: 'คุณต้องการปิดการใช้งานวัคซีนนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDisableVaccine(id);
      }
    });
  }

  private performDisableVaccine(id: number) {
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
        .patch(`${config.apiServer}/api/v1/vaccines/disableVaccine/${id}`, {}, { headers })
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            console.log('Disable Vaccine Success:', res);
            Swal.fire({
              title: 'สำเร็จ',
              text: res.message || 'ปิดการใช้งานสำเร็จ',
              icon: 'success',
              confirmButtonText: 'ตกลง'
            });
            this.loadData();
          },
          error: (err) => {
            console.error('Disable Vaccine Error:', err);
            Swal.fire({
              title: 'ข้อผิดพลาด',
              text: 'ไม่สามารถปิดการใช้งานได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
              icon: 'error',
              confirmButtonText: 'ตกลง'
            });
          }
        });
    } catch (err) {
      console.error('Disable Vaccine Client Error:', err);
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

    this.http.get<VaccineResponse>(`${config.apiServer}/api/v1/vaccines/getVaccine`, { headers }).subscribe({
      next: (response) => {
        this.Vaccines = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading Vaccine:', error);
        this.loading = false;
        this.Vaccines = [];
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
