import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../service/auth.service'; // تأكد من المسار الصحيح

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  currentLang: 'ar' | 'en' = 'ar';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const savedLang = localStorage.getItem('lang') as 'ar' | 'en';
    if (savedLang) this.currentLang = savedLang;
  }

  onLogin(): void {
    if (!this.email || !this.password) return;

    const body = { email: this.email, password: this.password };

    this.authService.login(body).subscribe({
      next: (res: any) => {
        // استخراج بيانات المستخدم والتوكن بأمان من الـ API
        const user = res?.data?.user || res?.user;
        const token = res?.token || res?.data?.token;

        if (user) {
          // 1. حفظ البيانات في localstorage وتحديث الـ BehaviorSubject
          this.authService.saveUser(user, token);

          // 2. التوجيه للصفحة الرئيسية دون الحاجة لعمل Refresh
          this.router.navigate(['/home']);
        }
      },
      error: (err: any) => {
        console.error('Login error:', err);
        this.errorMessage = err.error?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة';
      }
    });
  }
}