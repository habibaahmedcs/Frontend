import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent implements OnInit {
  currentLang: string = 'ar';
  
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      this.currentLang = savedLang;
    }
  }

  onRegister(): void {
    // التاكد من ملء جميع الحقول المطلوبة
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.errorMessage = this.currentLang === 'ar' 
        ? 'يرجى إدخال جميع البيانات المطلوبة' 
        : 'Please fill in all required fields';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = this.currentLang === 'ar' 
        ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' 
        : 'Password must be at least 8 characters long';
      return;
    }

    const payload = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    };

    this.http.post('http://localhost:3000/api/v1/auth/signup', payload).subscribe({
      next: () => {
        // التحويل إلى صفحة تسجيل الدخول مباشرة بعد نجاح الإنشاء
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 
          (this.currentLang === 'ar' ? 'حدث خطأ أثناء إنشاء الحساب' : 'Error creating account');
      }
    });
  }
}