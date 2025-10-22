import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import config from '../../../config';

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

interface ImageInfo {
  id: string;
  url: string;
}

@Component({
  selector: 'app-edit-dog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-dog.component.html',
  styleUrls: ['./edit-dog.component.css']
})
export class EditDogComponent implements OnInit {
  dogId: string | null = null;
  colors: Color[] = [];
  Breeding: Breeding[] = [];
  DogDad: DogDad[] = [];
  DogMom: DogMom[] = [];

  formDog: any = {
    dog_Microchip: '',
    dog_RegNo: '',
    dog_Name: '',
    dog_CallName: '',
    dog_Gender: '',
    color_ID: '',
    dog_Status: '',
    dog_StatusBreeding: '',
    dog_StatusSale: '',
    dog_StatusDel: '1',
    dog_Owner: '',
    dog_Breeder: '',
    dog_K9Url: '',
    dog_Price: '',
    dog_Birthday: '',
    breeding_ID: '',
    dog_Dad: '',
    dog_Mom: ''
  };

  // New files
  profileFile: File | null = null;
  pedigreeFile: File | null = null;
  pedigreeImgFile: File | null = null;
  showFiles: File[] = [];

  profileFilePreview: string | null = null;
  pedigreeImgFilePreview: string | null = null;
  showFilesPreview: string[] = [];

  // Existing files
  existingProfile: string | null = null;
  existingPedigree: string | null = null;
  existingPedigreeImg: string | null = null;
  existingShowImages: ImageInfo[] = [];

  // Delete flags
  deleteProfile = false;
  deletePedigree = false;
  deletePedigreeImg = false;
  deleteShowAll = false;
  deleteShowIds: string[] = [];

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.dogId = this.route.snapshot.paramMap.get('id');
    if (this.dogId) {
      this.loadDogData(this.dogId);
    }
    this.loadColors();
    this.loadBreeding();
    this.loadDogDad();
    this.loadDogMom();
  }

  loadDogData(dogId: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get(`${config.apiServer}/api/v1/dogs/getDog/${dogId}`, { headers })
      .subscribe({
        next: (res: any) => {
          const dogData = res.data || res;
          this.formDog = {
            dog_Microchip: dogData.microchip || '',
            dog_RegNo: dogData.regNo || '',
            dog_Name: dogData.name || '',
            dog_CallName: dogData.callName || '',
            dog_Gender: dogData.gender || '',
            color_ID: dogData.colorID || '',
            dog_Status: dogData.status || '',
            dog_StatusBreeding: dogData.statusBreeding || '',
            dog_StatusSale: dogData.statusSale || '',
            dog_StatusDel: dogData.statusDel || '1',
            dog_Owner: dogData.owner || '',
            dog_Breeder: dogData.breeder || '',
            dog_K9Url: dogData.k9Url || '',
            dog_Price: dogData.price || '',
            dog_Birthday: dogData.birthday || '',
            breeding_ID: dogData.breedingID || '',
            dog_Dad: dogData.dadID || '',
            dog_Mom: dogData.momID || ''
          };
          this.existingProfile = dogData.profileImage ? `${config.profileImage}/${dogData.profileImage}` : null;
          this.existingPedigree = dogData.pedigreePDF ? `${config.pedigreePDF}/${dogData.pedigreePDF}` : null;
          this.existingPedigreeImg = dogData.pedigreeImage ? `${config.pedigreeImage}/${dogData.pedigreeImage}` : null;
          this.existingShowImages = dogData.showImages.map((img: string) => ({
            id: img,
            url: `${config.showImages}/${img}`
          }));
        },
        error: (err) => {
          console.error('Error loading dog data', err);
          Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลสุนัขได้', 'error');
        }
      });
  }

  loadColors() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<{ data: Color[] }>(`${config.apiServer}/api/v1/colors/getColor`, { headers })
      .subscribe({
        next: (res) => this.colors = res.data,
        error: (err) => console.error('Error loading colors', err)
      });
  }

  loadBreeding() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<{ data: Breeding[] }>(`${config.apiServer}/api/v1/breedings/getBreedings?status=2`, { headers })
      .subscribe({
        next: (res) => this.Breeding = res.data,
        error: (err) => console.error('Error loading breeding', err)
      });
  }

  loadDogDad() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<{ data: DogDad[] }>(`${config.apiServer}/api/v1/dogs/getDogs?dog_Gender=M`, { headers })
      .subscribe({
        next: (res) => this.DogDad = res.data,
        error: (err) => console.error('Error loading dog Dad', err)
      });
  }

  loadDogMom() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get<{ data: DogMom[] }>(`${config.apiServer}/api/v1/dogs/getDogs?dog_Gender=F`, { headers })
      .subscribe({
        next: (res) => this.DogMom = res.data,
        error: (err) => console.error('Error loading dog Mom', err)
      });
  }

  onFileChange(event: any, type: string) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    switch (type) {
      case 'profile':
        this.profileFile = files[0];
        this.profileFilePreview = URL.createObjectURL(files[0]);
        this.deleteProfile = false;
        break;
      case 'pedigree':
        this.pedigreeFile = files[0];
        this.deletePedigree = false;
        break;
      case 'pedigreeImg':
        this.pedigreeImgFile = files[0];
        this.pedigreeImgFilePreview = URL.createObjectURL(files[0]);
        this.deletePedigreeImg = false;
        break;
      case 'show':
        const fileArray = Array.from(files) as File[];
        this.showFiles = fileArray.slice(0, 4 - this.existingShowImages.length);
        this.showFilesPreview = this.showFiles.map(f => URL.createObjectURL(f));
        this.deleteShowAll = false;
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

  toggleDelete(type: string) {
    switch (type) {
      case 'profile':
        this.deleteProfile = !this.deleteProfile;
        if (this.deleteProfile) this.existingProfile = null;
        break;
      case 'pedigree':
        this.deletePedigree = !this.deletePedigree;
        if (this.deletePedigree) this.existingPedigree = null;
        break;
      case 'pedigreeImg':
        this.deletePedigreeImg = !this.deletePedigreeImg;
        if (this.deletePedigreeImg) this.existingPedigreeImg = null;
        break;
      case 'showAll':
        this.deleteShowAll = !this.deleteShowAll;
        if (this.deleteShowAll) this.existingShowImages = [];
        break;
    }
  }

  removeExistingShow(index: number) {
    this.deleteShowIds.push(this.existingShowImages[index].id);
    this.existingShowImages.splice(index, 1);
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      Swal.fire('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    Swal.fire({
      title: 'ยืนยันการแก้ไขข้อมูลสุนัข?',
      text: 'คุณต้องการบันทึกการแก้ไขข้อมูลสุนัขหรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    }).then(result => {
      if (result.isConfirmed) {
        this.updateDog();
      }
    });
  }

  updateDog() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const formData = new FormData();
    for (const key in this.formDog) {
      if (this.formDog[key] !== '' && this.formDog[key] !== null) {
        formData.append(key, this.formDog[key]);
      }
    }

    if (this.deleteProfile) formData.append('delete_profile', 'true');
    if (this.deletePedigree) formData.append('delete_pedigree', 'true');
    if (this.deletePedigreeImg) formData.append('delete_pedigreeImg', 'true');
    if (this.deleteShowAll) formData.append('delete_show_all', 'true');
    if (this.deleteShowIds.length > 0) formData.append('delete_show_ids', this.deleteShowIds.join(','));

    if (this.profileFile) formData.append('profile', this.profileFile);
    if (this.pedigreeFile) formData.append('pedigree', this.pedigreeFile);
    if (this.pedigreeImgFile) formData.append('pedigreeImg', this.pedigreeImgFile);
    if (this.showFiles.length > 0) {
      this.showFiles.forEach(f => formData.append('show', f));
    }

    this.http
      .put(`${config.apiServer}/api/v1/dogs/editDog/${this.dogId}`, formData, { headers })
      .subscribe({
        next: (res: any) => {
          Swal.fire('สำเร็จ', 'แก้ไขข้อมูลสุนัขเรียบร้อย', 'success');
          this.router.navigate(['/view-dogs']);
        },
        error: (err) => {
          console.error('Edit Dog Error:', err);
          Swal.fire('ข้อผิดพลาด', err.error?.message || 'ไม่สามารถแก้ไขข้อมูลได้', 'error');
        }
      });
  }

  resetForm() {
    if (this.dogId) {
      this.loadDogData(this.dogId);
    }
    this.profileFile = null;
    this.pedigreeFile = null;
    this.pedigreeImgFile = null;
    this.showFiles = [];
    this.profileFilePreview = null;
    this.pedigreeImgFilePreview = null;
    this.showFilesPreview = [];
    this.deleteProfile = false;
    this.deletePedigree = false;
    this.deletePedigreeImg = false;
    this.deleteShowAll = false;
    this.deleteShowIds = [];
  }
}
