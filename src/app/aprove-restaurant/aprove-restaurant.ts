import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResService } from '../service/res-service';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-aprove-restaurant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aprove-restaurant.html',
  styleUrls: ['./aprove-restaurant.css']
})
export class AproveRestaurantComponent implements OnInit {
  private resService = inject(ResService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentLang: string = 'ar';
  selectedFile: File | null = null;
  loading: boolean = false;
  successMessage = '';
  errorMessage = '';

  restaurant = {
    name: '',
    type: 'restaurant',
    cuisine: 'مصري',
    customCuisine: '',
    location: '',
    phone: ''
  };

  ngOnInit(): void {
    this.currentLang = localStorage.getItem('siteLang') || 'ar';
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.authService.isLoggedIn()) {
      this.errorMessage = this.currentLang === 'ar' ? 'يجب تسجيل الدخول أولاً لإرسال الطلب' : 'Please log in first';
      this.router.navigate(['/login']);
      return;
    }

    if (!this.restaurant.name || !this.restaurant.location || !this.restaurant.phone || !this.selectedFile) {
      this.errorMessage = this.currentLang === 'ar' ? 'يرجى ملء كافة البيانات وإرفاق الصورة المطلوبة' : 'Please fill all fields and upload the image';
      return;
    }

    this.loading = true;
    const formData = new FormData();
    formData.append('name', this.restaurant.name);
    formData.append('type', this.restaurant.type);

    const finalCuisine = this.restaurant.cuisine === 'أخرى'
      ? this.restaurant.customCuisine
      : this.restaurant.cuisine;
    formData.append('cuisine', finalCuisine);
    formData.append('customCuisine', this.restaurant.customCuisine || '');
    formData.append('location', this.restaurant.location);
    formData.append('phone', this.restaurant.phone);
    formData.append('image', this.selectedFile);

    this.resService.addRestaurant(formData).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = this.currentLang === 'ar'
          ? 'تم إرسال طلب الانضمام بنجاح وهو قيد المراجعة الآن'
          : 'Registration request submitted successfully';
        this.authService.fetchProfile().subscribe({ error: () => undefined });
        setTimeout(() => this.router.navigate(['/vendor-dashboard']), 1200);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || (this.currentLang === 'ar'
          ? 'حدث خطأ أثناء تقديم الطلب، يرجى المحاولة لاحقاً'
          : 'Error submitting request');
      }
    });
  }
}
