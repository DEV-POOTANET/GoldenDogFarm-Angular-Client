import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink , RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  constructor(private http: HttpClient, private router: Router) { }
  name: string = '';

  ngOnInit() {
    this.name = localStorage.getItem('name')!;
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
