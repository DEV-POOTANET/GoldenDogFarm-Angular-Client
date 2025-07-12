import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import config from '../../config';
import {MyModalComponent} from '../my-modal/my-modal.component';
import {take} from 'rxjs/operators';
import Swal from 'sweetalert2'

interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  phone: string;
  role: string;
  status: string;
}

interface UserResponse {
  page: number;
  limit: number;
  total: number;
  data: User[];
}

@Component({
  selector: 'app-users',
  imports: [MyModalComponent, CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  users: User[] = [];
  loading = false;
  useridlocal = Number(localStorage.getItem('id'));

  // Search and Filter
  searchName = '';
  selectedRole = '';

  // Pagination
  currentPage = 1;
  pageSize: number = 5;
  totalRecords = 0;
  totalPages = 0;

  // Math for template
  Math = Math;

  formUser: Partial<User & { id?: number }> = {
    id: 0,
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'S',
    status: '1'
  };

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.loadUsers();
  }

  get isEditMode(): boolean {
    return !!(this.formUser.id && this.formUser.id > 0);
  }

  get modalTitle(): string {
    return this.isEditMode ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มข้อมูลผู้ใช้งาน';
  }

  get modalIcon(): string {
    return this.isEditMode ? 'fa-solid fa-user-pen' : 'fa-solid fa-user-plus';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'บันทึก' : 'เพิ่ม';
  }

  onSubmit(form: NgForm) {
    Swal.fire({
      title: this.isEditMode ? 'ยืนยันการแก้ไข?' : 'ยืนยันการเพิ่มผู้ใช้?',
      text: this.isEditMode
        ? 'คุณต้องการบันทึกการแก้ไขผู้ใช้นี้หรือไม่?'
        : 'คุณต้องการเพิ่มผู้ใช้ใหม่นี้หรือไม่?',
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
        name: this.formUser.name,
        email: this.formUser.email,
        password: this.formUser.password,
        phone: this.formUser.phone,
        role: this.formUser.role,
        status: this.formUser.status,
        id: this.formUser.id
      };

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      if (this.isEditMode) {
        this.http
          .put(`${config.apiServer}/api/v1/users/edit_user/${this.formUser.id}`, payload, {headers})
          .pipe(take(1))
          .subscribe({
            next: (res: any) => {
              console.log('Edit User Success:', res);
              Swal.fire({
                title: 'สำเร็จ',
                text: res.message || 'แก้ไขผู้ใช้งานสำเร็จ',
                icon: 'success',
                confirmButtonText: 'ตกลง'
              });
              this.loadUsers();
              this.resetForm();
              this.closeModal();
            },
            error: (err) => {
              console.error('Edit User Error:', {
                status: err.status,
                statusText: err.statusText,
                message: err.message,
                error: err.error?.error || err.error || 'Unknown error',
                url: err.url
              });

              let errorMessage = 'เกิดข้อผิดพลาดในการแก้ไข';
              if (err.status === 400) {
                errorMessage = err.error?.error || 'ข้อมูลที่ส่งไม่ถูกต้อง';
              } else if (err.status === 404) {
                errorMessage = err.error?.error || 'ไม่พบผู้ใช้';
              } else if (err.status === 401) {
                errorMessage = 'ไม่ได้รับอนุญาต กรุณา login ใหม่';
              } else if (err.status === 500) {
                errorMessage = err.error?.error || 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์';
              } else if (err.status === 0) {
                errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์';
              }

              Swal.fire({
                title: 'ข้อผิดพลาด',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'ตกลง'
              });
            }
          });
      } else {
        this.http
          .post(`${config.apiServer}/api/v1/users/addUser`, payload, {headers})
          .pipe(take(1))
          .subscribe({
            next: (res: any) => {
              console.log('Add User Success:', res);
              Swal.fire({
                title: 'สำเร็จ',
                text: res.message || 'เพิ่มผู้ใช้งานสำเร็จ',
                icon: 'success',
                confirmButtonText: 'ตกลง'
              });
              this.loadUsers();
              this.resetForm();
              this.closeModal();
            },
            error: (err) => {
              console.error('Add User Error:', {
                status: err.status,
                statusText: err.statusText,
                message: err.message,
                error: err.error?.error || err.error || 'Unknown error',
                url: err.url
              });

              let errorMessage = 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้';
              if (err.status === 400) {
                errorMessage = err.error?.error || 'ข้อมูลที่ส่งไม่ถูกต้อง';
              } else if (err.status === 404) {
                errorMessage = err.error?.error || 'ไม่พบผู้ใช้';
              } else if (err.status === 401) {
                errorMessage = 'ไม่ได้รับอนุญาต กรุณา login ใหม่';
              } else if (err.status === 500) {
                errorMessage = err.error?.error || 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์';
              } else if (err.status === 0) {
                errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์';
              }

              Swal.fire({
                title: 'ข้อผิดพลาด',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'ตกลง'
              });
            }
          });
      }
    } catch (err) {
      console.error('Save User Client Error:', err);
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: `เกิดข้อผิดพลาด: ${err || 'ไม่สามารถบันทึกข้อมูลได้'}`,
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }

  private closeModal() {
    // ปิด modal ด้วย Bootstrap 5
    const modalElement = document.getElementById('modalAddUser');
    if (modalElement) {
      // ใช้ data-bs-dismiss attribute
      const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }


  resetForm() {
    this.formUser = {
      id: 0,
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'S',
      status: '1'
    };
  }

  editUser(user: User) {
    this.formUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    };
  }

  disableUser(userId: number) {
    // แสดง confirm dialog ด้วย SweetAlert2
    Swal.fire({
      title: 'ยืนยันการปิดการใช้งาน?',
      text: 'คุณต้องการปิดการใช้งานผู้ใช้นี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDisableUser(userId);
      }
    });
  }

  private performDisableUser(userId: number) {
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
        .patch(`${config.apiServer}/api/v1/users/disable_user/${userId}`, {}, {headers})
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            console.log('Disable User Success:', res);
            Swal.fire({
              title: 'สำเร็จ',
              text: res.message || 'ปิดการใช้งานผู้ใช้สำเร็จ',
              icon: 'success',
              confirmButtonText: 'ตกลง'
            });
            this.loadUsers();
          },
          error: (err) => {
            console.error('Disable User Error:', {
              status: err.status,
              statusText: err.statusText,
              message: err.message,
              error: err.error?.error || err.error || 'Unknown error',
              url: err.url
            });

            let errorMessage = 'เกิดข้อผิดพลาดในการปิดการใช้งาน';
            if (err.status === 400) {
              errorMessage = err.error?.error || 'รหัสผู้ใช้ไม่ถูกต้อง';
            } else if (err.status === 404) {
              errorMessage = err.error?.error || 'ไม่พบผู้ใช้';
            } else if (err.status === 401) {
              errorMessage = 'ไม่ได้รับอนุญาต กรุณา login ใหม่';
            } else if (err.status === 500) {
              errorMessage = err.error?.error || 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์';
            } else if (err.status === 0) {
              errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์';
            }

            Swal.fire({
              title: 'ข้อผิดพลาด',
              text: errorMessage,
              icon: 'error',
              confirmButtonText: 'ตกลง'
            });
          }
        });
    } catch (err) {
      console.error('Disable User Client Error:', err);
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: `เกิดข้อผิดพลาด: ${err || 'ไม่สามารถปิดการใช้งานผู้ใช้ได้'}`,
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }


  loadUsers() {
    this.loading = true;

    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', this.pageSize.toString());

    if (this.searchName) {
      params = params.set('name', this.searchName);
    }

    if (this.selectedRole) {
      params = params.set('role', this.selectedRole);
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<UserResponse>(`${config.apiServer}/api/v1/users/getUserAll`, {
      params,
      headers
    }).subscribe({
      next: (response) => {
        this.users = response.data;
        this.totalRecords = response.total;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        this.loading = false;

        // Debug logging
        console.log('Total Records:', this.totalRecords);
        console.log('Page Size:', this.pageSize);
        console.log('Total Pages:', this.totalPages);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
        this.users = [];
        this.totalRecords = 0;
        this.totalPages = 0;
      }
    });
  }

  searchUsers() {
    this.currentPage = 1;
    this.loadUsers();
  }

  changePageSize() {
    this.currentPage = 1;
    this.pageSize = Number(this.pageSize); // แปลงเป็น number
    this.loadUsers();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
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

  getRoleText(role: string): string {
    switch (role) {
      case 'A':
        return 'ผู้ดูแลระบบ';
      case 'S':
        return 'พนักงาน';
      default:
        return role;
    }
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
