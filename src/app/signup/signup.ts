import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentLang: string = 'ar';
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  ngOnInit(): void {
    const savedLang = localStorage.getItem('lang') || localStorage.getItem('siteLang');
    if (savedLang) {
      this.currentLang = savedLang;
    }
  }

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

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

    this.authService.signup({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.successMessage = this.currentLang === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account created';
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message ||
          (this.currentLang === 'ar' ? 'حدث خطأ أثناء إنشاء الحساب' : 'Error creating account');
      }
    });
  }
}
