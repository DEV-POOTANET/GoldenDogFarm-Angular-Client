import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import config from '../../config';
import {MyModalComponent} from '../my-modal/my-modal.component';
import {take} from 'rxjs/operators';
import Swal from 'sweetalert2'


interface Position {
  id: number;
  name: string;
  status: string;
}

interface PositionResponse {
  data: Position[];
}

@Component({
  selector: 'app-dog-positions',
  imports: [MyModalComponent, CommonModule, FormsModule],
  templateUrl: './dog-positions.component.html',
  styleUrl: './dog-positions.component.css'
})
export class DogPositionsComponent {
  Positions: Position[] = [];

  loading = false;

  formPosition: Partial<Position & { id?: number }> = {
    id: 0,
    name: '',
    status: '1'
  };


  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.loadData();
  }

  get isEditMode(): boolean {
    return !!(this.formPosition.id && this.formPosition.id > 0);
  }

  get modalTitle(): string {
    return this.isEditMode ? 'แก้ไขข้อมูลตำแหน่งสุนัข' : 'เพิ่มข้อมูลตำแหน่งสุนัข';
  }

  get modalIcon(): string {
    return this.isEditMode ? 'fa-solid fa-crown' : 'fa-solid fa-crown';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'บันทึก' : 'เพิ่ม';
  }

  onSubmit(form: NgForm) {
    Swal.fire({
      title: this.isEditMode ? 'ยืนยันการแก้ไข?' : 'ยืนยันการเพิ่มตำแหน่งสุนัข?',
      text: this.isEditMode
        ? 'คุณต้องการบันทึกการแก้ไขตำแหน่งสุนัขนี้หรือไม่?'
        : 'คุณต้องการเพิ่มตำแหน่งสุนัขใหม่นี้หรือไม่?',
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
        name: this.formPosition.name,
        status: this.formPosition.status,
        id: this.formPosition.id
      };

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const request$ = this.isEditMode
        ? this.http.put(`${config.apiServer}/api/v1/position/editPosition/${this.formPosition.id}`, payload, {headers})
        : this.http.post(`${config.apiServer}/api/v1/position/addPosition`, payload, {headers});

      request$.pipe(take(1)).subscribe({
        next: (res: any) => {
          console.log(this.isEditMode ? 'Edit Position Success:' : 'Add Position Success:', res);
          Swal.fire({
            title: 'สำเร็จ',
            text: res.message || (this.isEditMode ? 'แก้ไขตำแหน่งสุนัขสำเร็จ' : 'เพิ่มตำแหน่งสุนัขสำเร็จ'),
            icon: 'success',
            confirmButtonText: 'ตกลง'
          });
          this.loadData();
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
    // ปิด modal ด้วย Bootstrap 5
    const modalElement = document.getElementById('modalposition');
    if (modalElement) {
      // ใช้ data-bs-dismiss attribute
      const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  resetForm() {
    this.formPosition = {
      id: 0,
      name: '',
      status: '1'
    };
  }


  editPosition(Position: Position) {
    this.formPosition = {
      id: Position.id,
      name: Position.name,
      status: Position.status
    };
  }


  disablePosition(Id: number) {
    Swal.fire({
      title: 'ยืนยันการปิดการใช้งาน?',
      text: 'คุณต้องการปิดการใช้งานตำแหน่งสุนัขนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDisablePosition(Id);
      }
    });
  }

  private performDisablePosition(Id: number) {
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
        .patch(`${config.apiServer}/api/v1/position/disablePosition/${Id}`, {}, {headers})
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
            this.loadData();
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


  loadData() {
    this.loading = true;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<PositionResponse>(`${config.apiServer}/api/v1/position/getPosition`, {
      headers
    }).subscribe({
      next: (response) => {
        this.Positions = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading Position:', error);
        this.loading = false;
        this.Positions = [];
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
