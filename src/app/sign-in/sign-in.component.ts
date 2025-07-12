import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'
import config from '../../config';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';


interface DecodedToken {
  id: number;
  username: string;
  role: string;
  exp: number;
  iat: number;
}

@Component({
  selector: 'app-sign-in',
  imports: [FormsModule, CommonModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {
  token: string = '';
  email: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router) { }


  ngOnInit() {
    this.token = localStorage.getItem('token')! ?? '';
    if (this.token) {
      this.router.navigate(['/dashboard']);
    }
  }
  signIn() {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (this.email === '' || this.password === '') {
      Swal.fire({
        title: 'ตรวจสอบข้อมูล',
        text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        icon: 'warning',
      });
      return;
    }

    if (!emailRegex.test(this.email)) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'รูปแบบอีเมลไม่ถูกต้อง',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
      return;
    }

    const payload = {
      email: this.email,
      password: this.password,
    };
    try {
      this.http.post(config.apiServer + '/api/v1/auth/login', payload)
        .subscribe(
          (res: any) => {
            this.token = res.token;
            const decoded = jwtDecode<DecodedToken>(this.token);

            localStorage.setItem('token', this.token);
            localStorage.setItem('id', decoded.id.toString());
            localStorage.setItem('name', decoded.username);
            localStorage.setItem('role', decoded.role);

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'เข้าสู่ระบบสำเร็จ',
              showConfirmButton: false,
              timer: 500
            }).then(() => location.reload());
          },
          (err: any) => {
            Swal.fire({
              title: 'เข้าสู่ระบบไม่สำเร็จ',
              text: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
              icon: 'error',
            });
          }
        );
    } catch (e: any) {
      Swal.fire({
        title: 'error',
        text: e.message,
        icon: 'error',
      });
    }
  }
}
