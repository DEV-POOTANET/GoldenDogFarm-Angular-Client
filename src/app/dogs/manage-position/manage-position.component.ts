import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MyModalComponent } from '../../my-modal/my-modal.component';
import { take } from 'rxjs/operators';
import Swal from 'sweetalert2';
import config from '../../../config';

interface Dog {
  dog_ID: number;
  name: string;
}

interface DogPosition {
  id: number;
  dogId: number;
  positionId: number;
  year: number;
  status: string;
  dogName: string;
  positionName: string;
}

interface DogPositionResponse {
  data: DogPosition[];
}

interface Position {
  id: number;
  name: string;
}

@Component({
  selector: 'app-manage-position',
  standalone: true,
  imports: [CommonModule, FormsModule, MyModalComponent],
  templateUrl: './manage-position.component.html',
  styleUrls: ['./manage-position.component.css']
})
export class ManagePositionComponent implements OnInit {
  dogId: string | null = null;
  dog: Dog | null = null;
  dogPositions: DogPosition[] = [];
  positions: Position[] = [];
  loading = false;
  formPosition: Partial<DogPosition & { id?: number }> = {
    id: 0,
    dogId: 0,
    positionId: 0,
    year: new Date().getFullYear(),
    status: '1'
  };

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.dogId = this.route.snapshot.paramMap.get('id');
    if (this.dogId) {
      this.formPosition.dogId = parseInt(this.dogId, 10);
      this.loadDogData();
      this.loadPositions();
      this.loadAllPositions();
    }
  }

  get isEditMode(): boolean {
    return !!(this.formPosition.id && this.formPosition.id > 0);
  }

  get modalTitle(): string {
    return this.isEditMode ? 'แก้ไขข้อมูลตำแหน่ง' : 'เพิ่มข้อมูลตำแหน่ง';
  }

  get modalIcon(): string {
    return this.isEditMode ? 'fa-solid fa-award' : 'fa-solid fa-award';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'บันทึก' : 'เพิ่ม';
  }

  loadDogData() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<Dog>(`${config.apiServer}/api/v1/dogs/getDog/${this.dogId}`, { headers })
      .pipe(take(1))
      .subscribe({
        next: (dog) => {
          this.dog = dog;
        },
        error: (error) => {
          console.error('Error loading dog data:', error);
          Swal.fire({
            title: 'ข้อผิดพลาด',
            text: 'ไม่สามารถดึงข้อมูลสุนัขได้',
            icon: 'error',
            confirmButtonText: 'ตกลง'
          });
        }
      });
  }

  loadAllPositions() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<{ data: Position[] }>(`${config.apiServer}/api/v1/position/getPosition`, { headers })
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.positions = response.data;
        },
        error: (error) => {
          console.error('Error loading positions:', error);
          Swal.fire({
            title: 'ข้อผิดพลาด',
            text: 'ไม่สามารถดึงข้อมูลตำแหน่งทั้งหมดได้',
            icon: 'error',
            confirmButtonText: 'ตกลง'
          });
        }
      });
  }

  loadPositions() {
    this.loading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<DogPositionResponse>(`${config.apiServer}/api/v1/dogPositions/byDog/${this.dogId}`, { headers })
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.dogPositions = response.data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading dog positions:', error);
          this.loading = false;
          this.dogPositions = [];
          Swal.fire({
            title: 'ข้อผิดพลาด',
            text: 'ไม่สามารถดึงข้อมูลตำแหน่งได้',
            icon: 'error',
            confirmButtonText: 'ตกลง'
          });
        }
      });
  }

  onSubmit(form: NgForm) {
    Swal.fire({
      title: this.isEditMode ? 'ยืนยันการแก้ไข?' : 'ยืนยันการเพิ่มตำแหน่ง?',
      text: this.isEditMode
        ? 'คุณต้องการบันทึกการแก้ไขข้อมูลตำแหน่งนี้หรือไม่?'
        : 'คุณต้องการเพิ่มตำแหน่งใหม่นี้หรือไม่?',
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
        dogId: this.formPosition.dogId,
        positionId: this.formPosition.positionId,
        year: this.formPosition.year
      };

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const request$ = this.isEditMode
        ? this.http.put(`${config.apiServer}/api/v1/dogPositions/edit/${this.formPosition.id}`, payload, { headers })
        : this.http.post(`${config.apiServer}/api/v1/dogPositions/add`, payload, { headers });

      request$.pipe(take(1)).subscribe({
        next: (res: any) => {
          console.log(this.isEditMode ? 'Edit Position Success:' : 'Add Position Success:', res);
          Swal.fire({
            title: 'สำเร็จ',
            text: res.message || (this.isEditMode ? 'แก้ไขข้อมูลตำแหน่งสำเร็จ' : 'เพิ่มข้อมูลตำแหน่งสำเร็จ'),
            icon: 'success',
            confirmButtonText: 'ตกลง'
          });
          this.loadPositions();
          this.resetForm();
          this.closeModal();
        },
        error: (err) => {
          console.error(this.isEditMode ? 'Edit Position Error:' : 'Add Position Error:', err);
          Swal.fire({
            title: 'ข้อผิดพลาด',
            text: 'ไม่สามารถบันทึกข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
            icon: 'error',
            confirmButtonText: 'ตกลง'
          });
        }
      });
    } catch (err) {
      console.error('Save Position Client Error:', err);
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }

  private closeModal() {
    const modalElement = document.getElementById('modalPosition');
    if (modalElement) {
      const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  resetForm() {
    this.formPosition = {
      id: 0,
      dogId: this.dogId ? parseInt(this.dogId, 10) : 0,
      positionId: 0,
      year: new Date().getFullYear(),
      status: '1'
    };
  }

  editPosition(position: DogPosition) {
    this.formPosition = {
      id: position.id,
      dogId: position.dogId,
      positionId: position.positionId,
      year: position.year,
      status: position.status
    };
  }

  disablePosition(id: number) {
    Swal.fire({
      title: 'ยืนยันการปิดการใช้งาน?',
      text: 'คุณต้องการปิดการใช้งานตำแหน่งนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDisablePosition(id);
      }
    });
  }

  private performDisablePosition(id: number) {
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
        .patch(`${config.apiServer}/api/v1/dogPositions/disable/${id}`, {}, { headers })
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            console.log('Disable Position Success:', res);
            Swal.fire({
              title: 'สำเร็จ',
              text: res.message || 'ปิดการใช้งานสำเร็จ',
              icon: 'success',
              confirmButtonText: 'ตกลง'
            });
            this.loadPositions();
          },
          error: (err) => {
            console.error('Disable Position Error:', err);
            Swal.fire({
              title: 'ข้อผิดพลาด',
              text: 'ไม่สามารถปิดการใช้งานได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
              icon: 'error',
              confirmButtonText: 'ตกลง'
            });
          }
        });
    } catch (err) {
      console.error('Disable Position Client Error:', err);
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
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
