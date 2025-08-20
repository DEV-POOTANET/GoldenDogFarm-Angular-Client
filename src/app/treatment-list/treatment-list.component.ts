import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import config from '../../config';
import {MyModalComponent} from '../my-modal/my-modal.component';
import {take} from 'rxjs/operators';
import Swal from 'sweetalert2'

interface Treatment {
  id: number;
  name: string;
  description: string;
  status: string;
}

interface TreatmentResponse {
  data: Treatment[];
}

@Component({
  selector: 'app-treatment-list',
  imports: [MyModalComponent, CommonModule, FormsModule],
  templateUrl: './treatment-list.component.html',
  styleUrl: './treatment-list.component.css'
})
export class TreatmentListComponent {
  Treatments: Treatment[] = [];

  loading = false;

  formTreatment: Partial<Treatment & { id?: number }> = {
    id: 0,
    name: '',
    description: '',
    status: '1'
  };


  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.loadData();
  }

  get isEditMode(): boolean {
    return !!(this.formTreatment.id && this.formTreatment.id > 0);
  }

  get modalTitle(): string {
    return this.isEditMode ? 'แก้ไขข้อมูลรายการรักษา' : 'เพิ่มข้อมูลรายการรักษา';
  }

  get modalIcon(): string {
    return this.isEditMode ? 'fa-solid fa-virus' : 'fa-solid fa-virus';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'บันทึก' : 'เพิ่ม';
  }

  onSubmit(form: NgForm) {
    Swal.fire({
      title: this.isEditMode ? 'ยืนยันการแก้ไข?' : 'ยืนยันการเพิ่มรายการรักษา?',
      text: this.isEditMode
        ? 'คุณต้องการบันทึกการแก้ไขรายการรักษานี้หรือไม่?'
        : 'คุณต้องการเพิ่มรายการรักษาใหม่นี้หรือไม่?',
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
        name: this.formTreatment.name,
        description: this.formTreatment.description,
        status: this.formTreatment.status,
        id: this.formTreatment.id
      };

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const request$ = this.isEditMode
        ? this.http.put(`${config.apiServer}/api/v1/treatmentList/editTreatment/${this.formTreatment.id}`, payload, {headers})
        : this.http.post(`${config.apiServer}/api/v1/treatmentList/addTreatment`, payload, {headers});

      request$.pipe(take(1)).subscribe({
        next: (res: any) => {
          console.log(this.isEditMode ? 'Edit Treatment Success:' : 'Add Treatment Success:', res);
          Swal.fire({
            title: 'สำเร็จ',
            text: res.message || (this.isEditMode ? 'แก้ไขรายการรักษาสำเร็จ' : 'เพิ่มรายการรักษาสำเร็จ'),
            icon: 'success',
            confirmButtonText: 'ตกลง'
          });
          this.loadData();
          this.resetForm();
          this.closeModal();
        },
        error: (err) => {
          console.error(this.isEditMode ? 'Edit Treatment Error:' : 'Add Treatment Error:', err);

          Swal.fire({
            title: 'ข้อผิดพลาด',
            text: 'ไม่สามารถบันทึกข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
            icon: 'error',
            confirmButtonText: 'ตกลง'
          });
        }
      });
    } catch (err) {
      console.error('Save Treatment Client Error:', err);
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
    const modalElement = document.getElementById('modalTreatment');
    if (modalElement) {
      // ใช้ data-bs-dismiss attribute
      const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  resetForm() {
    this.formTreatment = {
      id: 0,
      name: '',
      description: '',
      status: '1'
    };
  }


  editTreatment(Treatment: Treatment) {
    this.formTreatment = {
      id: Treatment.id,
      name: Treatment.name,
      description: Treatment.description,
      status: Treatment.status
    };
  }


  disableTreatment(Id: number) {
    Swal.fire({
      title: 'ยืนยันการปิดการใช้งาน?',
      text: 'คุณต้องการปิดการใช้งานรายการรักษานี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDisableTreatment(Id);
      }
    });
  }

  private performDisableTreatment(Id: number) {
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
        .patch(`${config.apiServer}/api/v1/treatmentList/disableTreatment/${Id}`, {}, {headers})
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            console.log('Disable Treatment Success:', res);
            Swal.fire({
              title: 'สำเร็จ',
              text: res.message || 'ปิดการใช้งานสำเร็จ',
              icon: 'success',
              confirmButtonText: 'ตกลง'
            });
            this.loadData();
          },
          error: (err) => {
            console.error('Disable Treatment Error:', err);

            Swal.fire({
              title: 'ข้อผิดพลาด',
              text: 'ไม่สามารถปิดการใช้งานได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
              icon: 'error',
              confirmButtonText: 'ตกลง'
            });
          }
        });
    } catch (err) {
      console.error('Disable Treatment Client Error:', err);
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

    this.http.get<TreatmentResponse>(`${config.apiServer}/api/v1/treatmentList/getTreatment`, {
      headers
    }).subscribe({
      next: (response) => {
        this.Treatments = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading Treatment:', error);
        this.loading = false;
        this.Treatments = [];
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
