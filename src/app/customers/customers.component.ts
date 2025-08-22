import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import config from '../../config';
import {MyModalComponent} from '../my-modal/my-modal.component';
import {take} from 'rxjs/operators';
import Swal from 'sweetalert2'

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  facebook: string;
  status: string;
}

interface CustomerResponse {
  page: number;
  limit: number;
  total: number;
  data: Customer[];
}

@Component({
  selector: 'app-customers',
  imports: [MyModalComponent, CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  loading = false;

  // Search and Filter
  searchName = '';
  searchPhone = '';
  searchFacebook = '';

  // Pagination
  currentPage = 1;
  pageSize: number = 5;
  totalRecords = 0;
  totalPages = 0;

  // Math for template
  Math = Math;

  formCustomer: Partial<Customer & { id?: number }> = {
    id: 0,
    name: '',
    phone: '',
    email: '',
    facebook: '',
    status: '1'
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCustomers();
  }

  get isEditMode(): boolean {
    return !!(this.formCustomer.id && this.formCustomer.id > 0);
  }

  get modalTitle(): string {
    return this.isEditMode ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มข้อมูลลูกค้า';
  }

  get modalIcon(): string {
    return this.isEditMode ? 'fa-solid fa-user-pen' : 'fa-solid fa-user-plus';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'บันทึก' : 'เพิ่ม';
  }

  onSubmit(form: NgForm) {
    Swal.fire({
      title: this.isEditMode ? 'ยืนยันการแก้ไข?' : 'ยืนยันการเพิ่มลูกค้า?',
      text: this.isEditMode
        ? 'คุณต้องการบันทึกการแก้ไขลูกค้านี้หรือไม่?'
        : 'คุณต้องการเพิ่มลูกค้าใหม่นี้หรือไม่?',
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
        name: this.formCustomer.name,
        phone: this.formCustomer.phone,
        email: this.formCustomer.email,
        facebook: this.formCustomer.facebook,
        status: this.formCustomer.status,
        id: this.formCustomer.id
      };

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      if (this.isEditMode) {
        this.http
          .put(`${config.apiServer}/api/v1/customers/editCustomer/${this.formCustomer.id}`, payload, {headers})
          .pipe(take(1))
          .subscribe({
            next: (res: any) => {
              console.log('Edit Customer Success:', res);
              Swal.fire({
                title: 'สำเร็จ',
                text: res.message || 'แก้ไขลูกค้าสำเร็จ',
                icon: 'success',
                confirmButtonText: 'ตกลง'
              });
              this.loadCustomers();
              this.resetForm();
              this.closeModal();
            },
            error: (err) => {
              console.error('Edit Customer Error:', {
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
                errorMessage = err.error?.error || 'ไม่พบลูกค้า';
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
          .post(`${config.apiServer}/api/v1/customers/addCustomer`, payload, {headers})
          .pipe(take(1))
          .subscribe({
            next: (res: any) => {
              console.log('Add Customer Success:', res);
              Swal.fire({
                title: 'สำเร็จ',
                text: res.message || 'เพิ่มลูกค้าสำเร็จ',
                icon: 'success',
                confirmButtonText: 'ตกลง'
              });
              this.loadCustomers();
              this.resetForm();
              this.closeModal();
            },
            error: (err) => {
              console.error('Add Customer Error:', {
                status: err.status,
                statusText: err.statusText,
                message: err.message,
                error: err.error?.error || err.error || 'Unknown error',
                url: err.url
              });

              let errorMessage = 'เกิดข้อผิดพลาดในการเพิ่มลูกค้า';
              if (err.status === 400) {
                errorMessage = err.error?.error || 'ข้อมูลที่ส่งไม่ถูกต้อง';
              } else if (err.status === 404) {
                errorMessage = err.error?.error || 'ไม่พบลูกค้า';
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
      console.error('Save Customer Client Error:', err);
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: `เกิดข้อผิดพลาด: ${err || 'ไม่สามารถบันทึกข้อมูลได้'}`,
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }

  private closeModal() {
    const modalElement = document.getElementById('modalAddCustomer');
    if (modalElement) {
      const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  resetForm() {
    this.formCustomer = {
      id: 0,
      name: '',
      phone: '',
      email:'',
      facebook: '',
      status: '1'
    };
  }

  editCustomer(customer: Customer) {
    this.formCustomer = {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      facebook: customer.facebook,
      status: customer.status
    };
  }

  disableCustomer(customerId: number) {
    Swal.fire({
      title: 'ยืนยันการปิดการใช้งาน?',
      text: 'คุณต้องการปิดการใช้งานลูกค้านี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDisableCustomer(customerId);
      }
    });
  }

  private performDisableCustomer(customerId: number) {
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
        .patch(`${config.apiServer}/api/v1/customers/disableCustomer/${customerId}`, {}, {headers})
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            console.log('Disable Customer Success:', res);
            Swal.fire({
              title: 'สำเร็จ',
              text: res.message || 'ปิดการใช้งานลูกค้าสำเร็จ',
              icon: 'success',
              confirmButtonText: 'ตกลง'
            });
            this.loadCustomers();
          },
          error: (err) => {
            console.error('Disable Customer Error:', {
              status: err.status,
              statusText: err.statusText,
              message: err.message,
              error: err.error?.error || err.error || 'Unknown error',
              url: err.url
            });

            let errorMessage = 'เกิดข้อผิดพลาดในการปิดการใช้งาน';
            if (err.status === 400) {
              errorMessage = err.error?.error || 'รหัสลูกค้าไม่ถูกต้อง';
            } else if (err.status === 404) {
              errorMessage = err.error?.error || 'ไม่พบลูกค้า';
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
      console.error('Disable Customer Client Error:', err);
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: `เกิดข้อผิดพลาด: ${err || 'ไม่สามารถปิดการใช้งานลูกค้าได้'}`,
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }

  loadCustomers() {
    this.loading = true;

    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', this.pageSize.toString());

    if (this.searchName) {
      params = params.set('name', this.searchName);
    }

    if (this.searchPhone) {
      params = params.set('phone', this.searchPhone);
    }

    if (this.searchFacebook) {
      params = params.set('facebook', this.searchFacebook);
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<CustomerResponse>(`${config.apiServer}/api/v1/customers/getCustomers`, {
      params,
      headers
    }).subscribe({
      next: (response) => {
        this.customers = response.data;
        this.totalRecords = response.total;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        this.loading = false;

        console.log('Total Records:', this.totalRecords);
        console.log('Page Size:', this.pageSize);
        console.log('Total Pages:', this.totalPages);
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.loading = false;
        this.customers = [];
        this.totalRecords = 0;
        this.totalPages = 0;
      }
    });
  }

  searchCustomers() {
    this.currentPage = 1;
    this.loadCustomers();
  }

  changePageSize() {
    this.currentPage = 1;
    this.pageSize = Number(this.pageSize);
    this.loadCustomers();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCustomers();
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
