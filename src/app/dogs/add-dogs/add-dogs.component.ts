import {Component} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FormsModule, NgForm} from '@angular/forms';
import {CommonModule} from '@angular/common';
import Swal from 'sweetalert2';
import config from '../../../config';
import {take} from 'rxjs/operators';

interface Color {
  id: number;
  name: string;
}

interface Breeding {
  id: number;
  notes: string;
}

interface DogDad {
  id: number;
  name: string;
}

interface DogMom {
  id: number;
  name: string;
}

@Component({
  selector: 'app-add-dogs',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-dogs.component.html',
  styleUrl: './add-dogs.component.css'
})
export class AddDogsComponent {
  colors: Color[] = [];
  Breeding: Breeding[] = [];
  DogDad: DogDad[] = [];
  DogMom: DogMom[] = [];

  formDog: any = {
    dog_Microchip:'',
    dog_RegNo:'',
    dog_Name: '',
    dog_CallName:'',
    dog_Gender: '',
    color_ID: '',
    dog_Status: '5',
    dog_StatusBreeding: '2',
    dog_StatusSale: '2',
    dog_StatusDel: '1',
    dog_Owner:'',
    dog_Breeder:'',
    dog_K9Url:'',
    dog_Price: '',
    dog_Birthday: '',
    breeding_ID:'',
    dog_Dad:'',
    dog_Mom:''
  };
  ngOnInit() {
    this.loadColors();
    this.loadBreeding();
    this.loadDogDad();
    this.loadDogMom();
  }

  loadColors() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});
    this.http.get<{data: Color[]}>(`${config.apiServer}/api/v1/colors/getColor`, {headers})
      .pipe(take(1))
      .subscribe({
        next: (res) => this.colors = res.data,
        error: (err) => console.error('Error load colors', err)
      });
  }

  loadBreeding() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});
    this.http.get<{data: Breeding[]}>(`${config.apiServer}/api/v1/breedings/getBreedings?status=2`, {headers})
      .pipe(take(1))
      .subscribe({
        next: (res) => this.Breeding = res.data,
        error: (err) => console.error('Error load Breeding', err)
      });
  }

  loadDogDad() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});
    this.http.get<{data: DogDad[]}>(`${config.apiServer}/api/v1/dogs/getDogs?dog_Gender=M`, {headers})
      .pipe(take(1))
      .subscribe({
        next: (res) => this.DogDad = res.data,
        error: (err) => console.error('Error load dog Dad', err)
      });
  }

  loadDogMom() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});
    this.http.get<{data: DogMom[]}>(`${config.apiServer}/api/v1/dogs/getDogs?dog_Gender=F`, {headers})
      .pipe(take(1))
      .subscribe({
        next: (res) => this.DogMom = res.data,
        error: (err) => console.error('Error load dog Mom', err)
      });
  }

  // เก็บไฟล์
  profileFile: File | null = null;
  pedigreeFile: File | null = null;
  pedigreeImgFile: File | null = null;
  showFiles: File[] = [];

  profileFilePreview: string | null = null;
  pedigreeImgFilePreview: string | null = null;
  showFilesPreview: string[] = [];

  constructor(private http: HttpClient) {}

  onFileChange(event: any, type: string) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    switch (type) {
      case 'profile':
        this.profileFile = files[0];
        this.profileFilePreview = URL.createObjectURL(files[0]);
        break;

      case 'pedigree':
        this.pedigreeFile = files[0];
        break;

      case 'pedigreeImg':
        this.pedigreeImgFile = files[0];
        this.pedigreeImgFilePreview = URL.createObjectURL(files[0]);
        break;

      case 'show':
        this.showFiles = Array.from(files);
        this.showFilesPreview = this.showFiles.map(f => URL.createObjectURL(f));
        break;
    }
  }
  removeFile(type: string, index?: number) {
    switch (type) {
      case 'profile':
        this.profileFile = null;
        this.profileFilePreview = null;
        break;

      case 'pedigree':
        this.pedigreeFile = null;

        break;

      case 'pedigreeImg':
        this.pedigreeImgFile = null;
        this.pedigreeImgFilePreview = null;
        break;

      case 'show':
        if (index !== undefined) {
          this.showFiles.splice(index, 1);
          this.showFilesPreview.splice(index, 1);
        } else {
          this.showFiles = [];
          this.showFilesPreview = [];
        }
        break;
    }
  }


  onSubmit(form: NgForm) {
    if (form.invalid) {
      Swal.fire('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    Swal.fire({
      title: 'ยืนยันการเพิ่มสุนัข?',
      text: 'คุณต้องการบันทึกข้อมูลสุนัขใหม่หรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    }).then(result => {
      if (result.isConfirmed) {
        this.saveDog();
      }
    });
  }

  saveDog() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const formData = new FormData();
    for (const key in this.formDog) {
      formData.append(key, this.formDog[key]);
    }

    if (this.profileFile) formData.append('profile', this.profileFile);
    if (this.pedigreeFile) formData.append('pedigree', this.pedigreeFile);
    if (this.pedigreeImgFile) formData.append('pedigreeImg', this.pedigreeImgFile);
    if (this.showFiles.length > 0) {
      this.showFiles.forEach(f => formData.append('show', f));
    }

    this.http
      .post(`${config.apiServer}/api/v1/dogs/addDog`, formData, {headers})
      .subscribe({
        next: (res: any) => {
          Swal.fire('สำเร็จ', 'เพิ่มข้อมูลสุนัขเรียบร้อย', 'success');
          this.resetForm();
        },
        error: (err) => {
          console.error('Add Dog Error:', err);
          Swal.fire('ข้อผิดพลาด', err.error?.message || 'ไม่สามารถเพิ่มข้อมูลได้', 'error');
        }
      });
  }

  resetForm() {
    this.formDog = {
      dog_Microchip:'',
      dog_RegNo:'',
      dog_Name: '',
      dog_CallName:'',
      dog_Gender: '',
      color_ID: '',
      dog_Status: '5',
      dog_StatusBreeding: '2',
      dog_StatusSale: '2',
      dog_StatusDel: '1',
      dog_Owner:'',
      dog_Breeder:'',
      dog_K9Url:'',
      dog_Price: '',
      dog_Birthday: '',
      breeding_ID:'',
      dog_Dad:'',
      dog_Mom:''
    };
    this.profileFile = null;
    this.profileFilePreview = null;

    this.pedigreeFile = null;

    this.pedigreeImgFile = null;
    this.pedigreeImgFilePreview = null;

    this.showFiles = [];
    this.showFilesPreview = [];
  }
}
