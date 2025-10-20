import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import config from '../../config';
import {MyModalComponent} from '../my-modal/my-modal.component';
import {take} from 'rxjs/operators';
import Swal from 'sweetalert2';

interface Vaccine {
  id: number;
  name: string;
  vaccine_Description: string;
  vaccine_Status: string;
}

interface Dog {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

interface Vet {
  id: number;
  name: string;
}

interface Dose {
  dS_ID: number;
  vR_ID?: number;
  vet_ID?: number;
  dS_Number?: number;
  dS_ScheduledDate: string;
  dS_ActualDate?: string;
  dS_Notes?: string;
  dS_Status: string;
  vet_Name?: string;
}

interface Vaccination {
  vR_ID: number;
  vaccine_ID: number;
  dog_ID: number;
  user_ID: number;
  vR_Status: string;
  vaccine_Name: string;
  dog_Name: string;
  user_Name: string;
  doses: Dose[];
}

interface VaccinationResponse {
  page: number;
  limit: number;
  total: number;
  data: Vaccination[];
}

interface VaccinesResponse {
  data: Vaccine[];
}

interface DogsResponse {
  data: Dog[];
}

interface UsersResponse {
  data: User[];
}

interface VetsResponse {
  data: Vet[];
}

@Component({
  selector: 'app-vaccinations',
  imports: [MyModalComponent, CommonModule, FormsModule],
  templateUrl: './vaccinations.component.html',
  styleUrl: './vaccinations.component.css'
})
export class VaccinationsComponent implements OnInit {
  vaccinations: Vaccination[] = [];
  vaccines: Vaccine[] = [];
  dogs: Dog[] = [];
  users: User[] = [];
  vets: Vet[] = [];
  loading = false;


  searchDogName = '';
  searchStatus = '';


  currentPage = 1;
  pageSize: number = 5;
  totalRecords = 0;
  totalPages = 0;


  Math = Math;

  formVaccination: Partial<Vaccination & { id?: number }> = {
    id: 0,
    vaccine_ID: 0,
    dog_ID: 0,
    user_ID: 0,
    vR_Status: '1',
    doses: []
  };

  isDoseEditMode = false;
  currentVRID = 0;
  newDose: Partial<Dose> = {
    vet_ID: 0,
    dS_Number: 0,
    dS_ScheduledDate: '',
    dS_ActualDate: '',
    dS_Notes: '',
    dS_Status: '1'
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDropdowns();
    this.loadVaccinations();
  }

  loadDropdowns() {
    this.loadVaccines();
    this.loadDogs();
    this.loadUsers();
    this.loadVets();
  }

  loadVaccines() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<VaccinesResponse>(`${config.apiServer}/api/v1/vaccines/getVaccine`, {headers}).subscribe({
      next: (response) => {
        this.vaccines = response.data;
      },
      error: (error) => {
        console.error('Error loading vaccines:', error);
      }
    });
  }

  loadDogs() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<DogsResponse>(`${config.apiServer}/api/v1/dogs/getDogs`, {headers}).subscribe({
      next: (response) => {
        this.dogs = response.data;
      },
      error: (error) => {
        console.error('Error loading dogs:', error);
      }
    });
  }

  loadUsers() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<UsersResponse>(`${config.apiServer}/api/v1/users/getUserAll`, {headers}).subscribe({
      next: (response) => {
        this.users = response.data;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  loadVets() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<VetsResponse>(`${config.apiServer}/api/v1/vets/getVet`, {headers}).subscribe({
      next: (response) => {
        this.vets = response.data;
        console.log(this.vets);
      },
      error: (error) => {
        console.error('Error loading vets:', error);
      }
    });
  }

  get isEditMode(): boolean {
    return !!(this.formVaccination.id && this.formVaccination.id > 0);
  }

  get modalTitle(): string {
    return this.isEditMode ? 'แก้ไขข้อมูลการฉีดวัคซีน' : 'เพิ่มข้อมูลการฉีดวัคซีน';
  }

  get modalIcon(): string {
    return this.isEditMode ? 'fa-solid fa-syringe' : 'fa-solid fa-syringe';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'บันทึก' : 'เพิ่ม';
  }

  get doseModalTitle(): string {
    return this.isDoseEditMode ? 'แก้ไขโดสการฉีดวัคซีน' : 'เพิ่มโดสการฉีดวัคซีน';
  }

  get doseModalIcon(): string {
    return 'fa-solid fa-syringe';
  }

  get doseSubmitButtonText(): string {
    return this.isDoseEditMode ? 'บันทึก' : 'เพิ่ม';
  }


  openAddDoseModal(vrId: number) {
    this.currentVRID = vrId;
    this.isDoseEditMode = false;
    this.resetDoseForm();
  }


  resetDoseForm() {
    this.newDose = {
      vet_ID: 0,
      dS_Number: 0,
      dS_ScheduledDate: '',
      dS_ActualDate: '',
      dS_Notes: '',
      dS_Status: '1'
    };
  }

  editDose(dose: Dose) {
    this.currentVRID = dose.vR_ID!;
    this.newDose = { ...dose };
    this.isDoseEditMode = true;
  }


  disableDose(dsId: number) {
    Swal.fire({
      title: 'ยืนยันการปิดการใช้งาน?',
      text: 'คุณต้องการปิดการใช้งานโดสนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDisableDose(dsId);
      }
    });
  }

  private performDisableDose(dsId: number) {
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
        .patch(`${config.apiServer}/api/v1/vaccinations/disableDose/${dsId}`, {}, {headers})
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            Swal.fire({
              title: 'สำเร็จ',
              text: res.message || 'ปิดการใช้งานโดสสำเร็จ',
              icon: 'success',
              confirmButtonText: 'ตกลง'
            });
            this.loadVaccinations();
          },
          error: (err) => {
            let errorMessage = 'เกิดข้อผิดพลาดในการปิดการใช้งาน';
            if (err.status === 400) {
              errorMessage = err.error?.error || 'รหัสโดสไม่ถูกต้อง';
            } else if (err.status === 404) {
              errorMessage = err.error?.error || 'ไม่พบโดส';
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
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: `เกิดข้อผิดพลาด: ${err || 'ไม่สามารถปิดการใช้งานโดสได้'}`,
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }


  onSubmit(form: NgForm) {
    Swal.fire({
      title: this.isEditMode ? 'ยืนยันการแก้ไข?' : 'ยืนยันการเพิ่มการฉีดวัคซีน?',
      text: this.isEditMode
        ? 'คุณต้องการบันทึกการแก้ไขการฉีดวัคซีนนี้หรือไม่?'
        : 'คุณต้องการเพิ่มการฉีดวัคซีนใหม่นี้หรือไม่?',
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

  onSubmitDose(form: NgForm) {
    Swal.fire({
      title: this.isDoseEditMode ? 'ยืนยันการแก้ไข?' : 'ยืนยันการเพิ่มโดส?',
      text: this.isDoseEditMode
        ? 'คุณต้องการบันทึกการแก้ไขโดสนี้หรือไม่?'
        : 'คุณต้องการเพิ่มโดสใหม่นี้หรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        if (form.valid) {
          this.saveDose();
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

  saveDose() {
    try {
      const payload = {
        vR_ID: this.currentVRID,
        vet_ID: this.newDose.vet_ID,
        dS_Number: this.newDose.dS_Number,
        dS_ScheduledDate: this.newDose.dS_ScheduledDate,
        dS_ActualDate: this.newDose.dS_ActualDate,
        dS_Notes: this.newDose.dS_Notes,
        dS_Status: this.newDose.dS_Status
      };

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      if (this.isDoseEditMode) {
        this.http
          .patch(`${config.apiServer}/api/v1/vaccinations/editDose/${this.newDose.dS_ID}`, payload, {headers})
          .pipe(take(1))
          .subscribe({
            next: (res: any) => {
              Swal.fire({
                title: 'สำเร็จ',
                text: res.message || 'แก้ไขโดสสำเร็จ',
                icon: 'success',
                confirmButtonText: 'ตกลง'
              });
              this.loadVaccinations();
              this.resetDoseForm();
              this.closeDoseModal();
            },
            error: (err) => {
              let errorMessage = 'เกิดข้อผิดพลาดในการแก้ไข';
              if (err.status === 400) {
                errorMessage = err.error?.error || 'ข้อมูลที่ส่งไม่ถูกต้อง';
              } else if (err.status === 404) {
                errorMessage = err.error?.error || 'ไม่พบโดส';
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
          .post(`${config.apiServer}/api/v1/vaccinations/addDose`, payload, {headers})
          .pipe(take(1))
          .subscribe({
            next: (res: any) => {
              Swal.fire({
                title: 'สำเร็จ',
                text: res.message || 'เพิ่มโดสสำเร็จ',
                icon: 'success',
                confirmButtonText: 'ตกลง'
              });
              this.loadVaccinations();
              this.resetDoseForm();
              this.closeDoseModal();
            },
            error: (err) => {
              let errorMessage = 'เกิดข้อผิดพลาดในการเพิ่มโดส';
              if (err.status === 400) {
                errorMessage = err.error?.error || 'ข้อมูลที่ส่งไม่ถูกต้อง';
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
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: `เกิดข้อผิดพลาด: ${err || 'ไม่สามารถบันทึกข้อมูลได้'}`,
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }

  save() {
    try {
      const payload = {
        vaccine_ID: this.formVaccination.vaccine_ID,
        dog_ID: this.formVaccination.dog_ID,
        user_ID: this.formVaccination.user_ID,
        status: this.formVaccination.vR_Status,
        id: this.formVaccination.id
      };

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      if (this.isEditMode) {
        this.http
          .patch(`${config.apiServer}/api/v1/vaccinations/editVaccinationRecord/${this.formVaccination.id}`, payload, {headers})
          .pipe(take(1))
          .subscribe({
            next: (res: any) => {
              console.log('Edit Vaccination Success:', res);
              Swal.fire({
                title: 'สำเร็จ',
                text: res.message || 'แก้ไขการฉีดวัคซีนสำเร็จ',
                icon: 'success',
                confirmButtonText: 'ตกลง'
              });
              this.loadVaccinations();
              this.resetForm();
              this.closeModal();
            },
            error: (err) => {
              console.error('Edit Vaccination Error:', {
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
                errorMessage = err.error?.error || 'ไม่พบการฉีดวัคซีน';
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
          .post(`${config.apiServer}/api/v1/vaccinations/addVaccinationRecord`, payload, {headers})
          .pipe(take(1))
          .subscribe({
            next: (res: any) => {
              console.log('Add Vaccination Success:', res);
              Swal.fire({
                title: 'สำเร็จ',
                text: res.message || 'เพิ่มการฉีดวัคซีนสำเร็จ',
                icon: 'success',
                confirmButtonText: 'ตกลง'
              });
              this.loadVaccinations();
              this.resetForm();
              this.closeModal();
            },
            error: (err) => {
              console.error('Add Vaccination Error:', {
                status: err.status,
                statusText: err.statusText,
                message: err.message,
                error: err.error?.error || err.error || 'Unknown error',
                url: err.url
              });

              let errorMessage = 'เกิดข้อผิดพลาดในการเพิ่มการฉีดวัคซีน';
              if (err.status === 400) {
                errorMessage = err.error?.error || 'ข้อมูลที่ส่งไม่ถูกต้อง';
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
      console.error('Save Vaccination Client Error:', err);
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: `เกิดข้อผิดพลาด: ${err || 'ไม่สามารถบันทึกข้อมูลได้'}`,
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }

  private closeModal() {
    const modalElement = document.getElementById('modalAddVaccination');
    if (modalElement) {
      const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  private closeDoseModal() {
    const modalElement = document.getElementById('modalAddDose');
    if (modalElement) {
      const closeButton = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  resetForm() {
    this.formVaccination = {
      id: 0,
      vaccine_ID: 0,
      dog_ID: 0,
      user_ID: 0,
      vR_Status: '1',
      doses: []
    };
    this.newDose = {
      dS_Number: 0,
      dS_ScheduledDate: '',
      dS_ActualDate: '',
      dS_Notes: '',
      dS_Status: '1'
    };
  }

  editVaccination(vaccination: Vaccination) {
    this.formVaccination = {
      id: vaccination.vR_ID,
      vaccine_ID: vaccination.vaccine_ID,
      dog_ID: vaccination.dog_ID,
      user_ID: vaccination.user_ID,
      vR_Status: vaccination.vR_Status,
      doses: [...vaccination.doses]
    };
  }

  addDose() {
    if (this.newDose.dS_Number && this.newDose.dS_ScheduledDate) {
      this.formVaccination.doses = this.formVaccination.doses || [];
      this.formVaccination.doses.push({
        ...this.newDose,
        dS_Status: this.newDose.dS_Status || '1'
      } as Dose);
      this.newDose = {
        dS_Number: 0,
        dS_ScheduledDate: '',
        dS_ActualDate: '',
        dS_Notes: '',
        dS_Status: '1'
      };
    } else {
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: 'กรุณากรอกข้อมูลโดสให้ครบถ้วน',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }

  removeDose(index: number) {
    this.formVaccination?.doses?.splice(index, 1);
  }


  disableVaccination(vaccinationId: number) {
    Swal.fire({
      title: 'ยืนยันการปิดการใช้งาน?',
      text: 'คุณต้องการปิดการใช้งานการฉีดวัคซีนนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDisableVaccination(vaccinationId);
      }
    });
  }

  private performDisableVaccination(vaccinationId: number) {
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
        .patch(`${config.apiServer}/api/v1/vaccinations/disableVaccinationRecord/${vaccinationId}`, {}, {headers})
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            console.log('Disable Vaccination Success:', res);
            Swal.fire({
              title: 'สำเร็จ',
              text: res.message || 'ปิดการใช้งานการฉีดวัคซีนสำเร็จ',
              icon: 'success',
              confirmButtonText: 'ตกลง'
            });
            this.loadVaccinations();
          },
          error: (err) => {
            console.error('Disable Vaccination Error:', {
              status: err.status,
              statusText: err.statusText,
              message: err.message,
              error: err.error?.error || err.error || 'Unknown error',
              url: err.url
            });

            let errorMessage = 'เกิดข้อผิดพลาดในการปิดการใช้งาน';
            if (err.status === 400) {
              errorMessage = err.error?.error || 'รหัสการฉีดวัคซีนไม่ถูกต้อง';
            } else if (err.status === 404) {
              errorMessage = err.error?.error || 'ไม่พบการฉีดวัคซีน';
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
      console.error('Disable Vaccination Client Error:', err);
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: `เกิดข้อผิดพลาด: ${err || 'ไม่สามารถปิดการใช้งานการฉีดวัคซีนได้'}`,
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }

  loadVaccinations() {
    this.loading = true;

    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', this.pageSize.toString());

    if (this.searchDogName) {
      params = params.set('dog_Name', this.searchDogName);
    }

    if (this.searchStatus) {
      params = params.set('vR_Status', this.searchStatus);
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<VaccinationResponse>(`${config.apiServer}/api/v1/vaccinations/getVaccinationRecords`, {
      params,
      headers
    }).subscribe({
      next: (response) => {
        this.vaccinations = response.data;
        this.totalRecords = response.total;
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        this.loading = false;

        console.log('Total Records:', this.totalRecords);
        console.log('Page Size:', this.pageSize);
        console.log('Total Pages:', this.totalPages);
      },
      error: (error) => {
        console.error('Error loading vaccinations:', error);
        this.loading = false;
        this.vaccinations = [];
        this.totalRecords = 0;
        this.totalPages = 0;
      }
    });
  }

  searchVaccinations() {
    this.currentPage = 1;
    this.loadVaccinations();
  }

  changePageSize() {
    this.currentPage = 1;
    this.pageSize = Number(this.pageSize);
    this.loadVaccinations();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadVaccinations();
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
        return 'อยู่ระหว่างการนัด';
      case '2':
        return 'สำเร็จ';
      case '3':
        return 'ยกเลิก';
      case '4':
        return 'ลบ';
      default:
        return status;
    }
  }

  getDoseStatusText(status: string): string {
    switch (status) {
      case '1':
        return 'นัดหมาย';
      case '2':
        return 'สำเร็จ';
      case '3':
        return 'ยกเลิก';
      case '4':
        return 'ลบ';
      default:
        return status;
    }
  }

  getActiveDose(vaccination: Vaccination) {
    // ถ้าไม่มี doses หรือ doses เป็น undefined
    if (!vaccination?.doses || vaccination.doses.length === 0) return null;

    // หาข้อมูลโดสที่สถานะ = 1
    return vaccination.doses.find((d: Dose) => d.dS_Status === '1') || null;
  }

  getDoseButtonClass(dose: Dose | null): string {
    if (!dose) return 'btn-secondary'; // ไม่มีข้อมูล => ปุ่มเทา

    const today = new Date();
    const scheduledDate = new Date(dose.dS_ScheduledDate);
    const diffDays = (scheduledDate.getTime() - today.getTime()) / (1000 * 3600 * 24);

    if (dose.dS_Status === '1') {
      if (diffDays < 0) return 'btn-danger'; // เลยกำหนด
      if (diffDays <= 3) return 'btn-warning'; // ใกล้ถึงกำหนด
    }

    return 'btn-success'; // ปกติ
  }


}
