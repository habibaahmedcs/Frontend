import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-restaurant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aprove-restaurant.html',
  styleUrls: ['./aprove-restaurant.css']
})
export class AproveRestaurantComponent {
  currentLang: string = 'ar';
  
  restaurant = {
    name: '',
    type: 'restaurant',
    cuisine: 'مصري',
    customCuisine: '',
    location: '',
    phone: ''
  };

  selectedFile: File | null = null;

  constructor(private router: Router) {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      this.currentLang = savedLang;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    const finalCuisine = this.restaurant.cuisine === 'أخرى' 
      ? this.restaurant.customCuisine 
      : this.restaurant.cuisine;

    const formData = new FormData();
    formData.append('name', this.restaurant.name);
    formData.append('type', this.restaurant.type);
    formData.append('cuisine', finalCuisine);
    formData.append('location', this.restaurant.location);
    formData.append('phone', this.restaurant.phone);

    if (this.selectedFile) {
      formData.append('healthCertificate', this.selectedFile);
    }

    alert(this.currentLang === 'ar' ? 'تم إرسال طلبك بنجاح وهو قيد المراجعة' : 'Request submitted successfully');
    this.router.navigate(['/home']);
  }
}