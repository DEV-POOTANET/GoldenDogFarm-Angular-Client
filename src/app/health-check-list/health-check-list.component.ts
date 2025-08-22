import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import config from '../../config';
import { MyModalComponent } from '../my-modal/my-modal.component';
import { take } from 'rxjs/operators';
import Swal from 'sweetalert2';

interface HealthCheck {
  id: number;
  name: string;
  description: string;
  status: string;
}

interface HealthCheckResponse {
  data: HealthCheck[];
}

@Component({
  selector: 'app-health-check-list',
  imports: [MyModalComponent, CommonModule, FormsModule],
  templateUrl: './health-check-list.component.html',
  styleUrl: './health-check-list.component.css'
})
export class HealthCheckListComponent implements OnInit {
  HealthChecks: HealthCheck[] = [];
  loading = false;
  formHealthCheck: Partial<HealthCheck & { id?: number }> = {
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
    return !!(this.formHealthCheck.id && this.formHealthCheck.id > 0);
  }

  get modalTitle(): string {
    return this.isEditMode ? 'แก้ไขข้อมูลรายการตรวจสุขภาพ' : 'เพิ่มข้อมูลรายการตรวจสุขภาพ';
  }

  get modalIcon(): string {
    return this.isEditMode ? 'fa-solid fa-stethoscope' : 'fa-solid fa-stethoscope';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'บันทึก' : 'เพิ่ม';
  }

  onSubmit(form: NgForm) {
    Swal.fire({
      title: this.isEditMode ? 'ยืนยันการแก้ไข?' : 'ยืนยันการเพิ่มรายการตรวจสุขภาพ?',
      text: this.isEditMode
        ? 'คุณต้องการบันทึกการแก้ไขข้อมูลรายการตรวจสุขภาพนี้หรือไม่?'
        : 'คุณต้องการเพิ่มรายการตรวจสุขภาพใหม่นี้หรือไม่?',
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
        name: this.formHealthCheck.name,
        description: this.formHealthCheck.description,
        status: this.formHealthCheck.status,
        id: this.formHealthCheck.id
      };

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const request$ = this.isEditMode
        ? this.http.put(`${config.apiServer}/api/v1/healthCheckList/edit_hcl/${this.formHealthCheck.id}`, payload, { headers })
        : this.http.post(`${config.apiServer}/api/v1/healthCheckList/add_hcl`, payload, { headers });

      request$.pipe(take(1)).subscribe({
        next: (res: any) => {
          console.log(this.isEditMode ? 'Edit Health Check Success:' : 'Add Health Check Success:', res);
          Swal.fire({
            title: 'สำเร็จ',
            text: res.message || (this.isEditMode ? 'แก้ไขข้อมูลรายการตรวจสุขภาพสำเร็จ' : 'เพิ่มข้อมูลรายการตรวจสุขภาพสำเร็จ'),
            icon: 'success',
            confirmButtonText: 'ตกลง'
          });
          this.loadData();
          this.resetForm();
          this.closeModal();
        },
        error: (err) => {
          console.error(this.isEditMode ? 'Edit Health Check Error:' : 'Add Health Check Error:', err);
          Swal.fire({
            title: 'ข้อผิดพลาด',
            text: 'ไม่สามารถบันทึกข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
            icon: 'error',
            confirmButtonText: 'ตกลง'
          });
        }
      });
    } catch (err) {
      console.error('Save Health Check Client Error:', err);
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }

  private closeModal() {
    const modalElement = document.getElementById('modalHealthCheckList');
    if (modalElement) {
      const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  resetForm() {
    this.formHealthCheck = {
      id: 0,
      name: '',
      description: '',
      status: '1'
    };
  }

  editHealthCheck(healthCheck: HealthCheck) {
    this.formHealthCheck = {
      id: healthCheck.id,
      name: healthCheck.name,
      description: healthCheck.description,
      status: healthCheck.status
    };
  }

  disableHealthCheck(id: number) {
    Swal.fire({
      title: 'ยืนยันการปิดการใช้งาน?',
      text: 'คุณต้องการปิดการใช้งานรายการตรวจสุขภาพนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDisableHealthCheck(id);
      }
    });
  }

  private performDisableHealthCheck(id: number) {
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
        .patch(`${config.apiServer}/api/v1/healthCheckList/disable_hcl/${id}`, {}, { headers })
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            console.log('Disable Health Check Success:', res);
            Swal.fire({
              title: 'สำเร็จ',
              text: res.message || 'ปิดการใช้งานสำเร็จ',
              icon: 'success',
              confirmButtonText: 'ตกลง'
            });
            this.loadData();
          },
          error: (err) => {
            console.error('Disable Health Check Error:', err);
            Swal.fire({
              title: 'ข้อผิดพลาด',
              text: 'ไม่สามารถปิดการใช้งานได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
              icon: 'error',
              confirmButtonText: 'ตกลง'
            });
          }
        });
    } catch (err) {
      console.error('Disable Health Check Client Error:', err);
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

    this.http.get<HealthCheckResponse>(`${config.apiServer}/api/v1/healthCheckList/get_hcl`, { headers }).subscribe({
      next: (response) => {
        this.HealthChecks = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading Health Check:', error);
        this.loading = false;
        this.HealthChecks = [];
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
