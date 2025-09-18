import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import config from '../../../config';
import {take} from 'rxjs/operators';
import Swal from 'sweetalert2';
import {RouterLink, } from '@angular/router';

interface Dog {
  id: number;
  name: string;
  callName: string;
  gender: string;
  status: string;
  statusBreeding: string;
  statusSale: string;
  profileImage: string;
}

interface DogResponse {
  page: number;
  limit: number;
  total: number;
  data: Dog[];
}

@Component({
  selector: 'app-view-dogs',
  imports: [CommonModule, FormsModule, RouterLink, ],
  templateUrl: './view-dogs.component.html',
  styleUrl: './view-dogs.component.css'
})
export class ViewDogsComponent {
  dogs: Dog[] = [];
  loading = false;

  // Search and Filter
  searchName = '';
  filterStatus = '';
  filterStatusBreeding = '';
  filterStatusSale = '';
  filterGender = '';

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalRecords = 0;
  totalPages = 0;

  // Math for template
  Math = Math;

  // API base URL
  private profileImageBaseUrl = 'http://localhost:3030/uploads/dogs/profile/';

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.loadDogs();
  }

  loadDogs() {
    this.loading = true;

    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', this.pageSize.toString());

    if (this.searchName) {
      params = params.set('dog_Name', this.searchName);
    }
    if (this.filterStatus) {
      params = params.set('dog_Status', this.filterStatus);
    }
    if (this.filterStatusBreeding) {
      params = params.set('dog_StatusBreeding', this.filterStatusBreeding);
    }
    if (this.filterStatusSale) {
      params = params.set('dog_StatusSale', this.filterStatusSale);
    }
    if (this.filterGender) {
      params = params.set('dog_Gender', this.filterGender);
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http
      .get<DogResponse>(`${config.apiServer}/api/v1/dogs/getDogs`, {params, headers})
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.dogs = response.data.map(dog => ({
            ...dog,
            profileImage: dog.profileImage
              ? `${this.profileImageBaseUrl}${dog.profileImage}`
              : `${this.profileImageBaseUrl}default.jpg`
          }));
          this.totalRecords = response.total;
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
          this.loading = false;
        },
        error: (err) => {
          console.error('Load Dogs Error:', {
            status: err.status,
            statusText: err.statusText,
            message: err.message,
            error: err.error?.error || err.error || 'Unknown error',
            url: err.url
          });

          let errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูลสุนัข';
          if (err.status === 400) {
            errorMessage = err.error?.error || 'ข้อมูลที่ส่งไม่ถูกต้อง';
          } else if (err.status === 404) {
            errorMessage = err.error?.error || 'ไม่พบข้อมูล';
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
          this.loading = false;
          this.dogs = [];
          this.totalRecords = 0;
          this.totalPages = 0;
        }
      });
  }

  disableDog(Id: number) {
    Swal.fire({
      title: 'ยืนยันการปิดการใช้งาน?',
      text: 'คุณต้องการปิดการใช้งานสุนัขนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDisableDog(Id);
      }
    });
  }

  private performDisableDog(Id: number) {
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
        .patch(`${config.apiServer}/api/v1/dogs/disableDog/${Id}`, {}, {headers})
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            console.log('Disable Dog Success:', res);
            Swal.fire({
              title: 'สำเร็จ',
              text: res.message || 'ปิดการใช้งานสำเร็จ',
              icon: 'success',
              confirmButtonText: 'ตกลง'
            });
            this.loadDogs();
          },
          error: (err) => {
            console.error('Disable Dog Error:', err);

            Swal.fire({
              title: 'ข้อผิดพลาด',
              text: 'ไม่สามารถปิดการใช้งานได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
              icon: 'error',
              confirmButtonText: 'ตกลง'
            });
          }
        });
    } catch (err) {
      console.error('Disable Dog Client Error:', err);
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }

  searchDogs() {
    this.currentPage = 1;
    this.loadDogs();
  }

  changePageSize() {
    this.currentPage = 1;
    this.pageSize = Number(this.pageSize);
    this.loadDogs();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadDogs();
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
        return 'พ่อพันธุ์';
      case '2':
        return 'พ่อพันธุ์นอกฟาร์ม';
      case '3':
        return 'แม่พันธุ์';
      case '4':
        return 'ประกวด';
      case '5':
        return 'ลูกสุนัข';
      case '6':
        return 'เสียชีวิต';
      default:
        return status;
    }
  }

  getBreedingStatusText(status: string): string {
    switch (status) {
      case '1':
        return 'พร้อมผสม';
      case '2':
        return 'ไม่พร้อมผสม';
      case '3':
        return 'รอผลการผสม';
      case '4':
        return 'ท้อง';
      case '5':
        return 'พักฟื้น';
      default:
        return status;
    }
  }

  getSaleStatusText(status: string): string {
    switch (status) {
      case '1':
        return 'พร้อมขาย';
      case '2':
        return 'ไม่ขาย';
      case '3':
        return 'จอง';
      case '4':
        return 'จำหน่ายแล้ว';
      default:
        return status;
    }
  }

  getGenderText(gender: string): string {
    switch (gender) {
      case 'M':
        return 'ตัวผู้';
      case 'F':
        return 'ตัวเมีย';
      default:
        return gender;
    }
  }
}
