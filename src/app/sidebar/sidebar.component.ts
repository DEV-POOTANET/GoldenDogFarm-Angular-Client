import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink , RouterModule,CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  constructor(private http: HttpClient, public  router: Router) { }
  name: string = '';
  role: string = '';
  ngOnInit() {
    this.name = localStorage.getItem('name')!;
    this.role = localStorage.getItem('role')!;

  }
  getRoleText(role: string): string {
    switch (role) {
      case 'A':
        return 'Admin';
      case 'S':
        return 'Staff';
      default:
        return role;
    }
  }

  async signout() {
    const button = await Swal.fire({
      title: 'ออกจากระบบ',
      text: 'คุณต้องการออกจากระบบ ใช่หรือไม่',
      icon: 'question',
      showCancelButton: true,
      showConfirmButton: true,
    });

    if (button.isConfirmed) {
      localStorage.removeItem('id');
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      localStorage.removeItem('role');

      location.reload();

      // navigate to login page
      this.router.navigate(['/']);
    }
  }

  navigateToHome() {
    // this.router.navigate(['/']); // หรือเส้นทางที่ต้องการ
  }
}
