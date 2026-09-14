import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  
  user: any = null;
  profileSuccessMessage: string = '';
  passwordSuccessMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: [''],
      city: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });

    this.loadUserData();
  }

  loadUserData(): void {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
      const fullName = this.user.name || `${this.user.fname || ''} ${this.user.lname || ''}`.trim();

      this.profileForm.patchValue({
        name: fullName,
        email: this.user.email || '',
        phone: this.user.phone || '',
        city: this.user.city || ''
      });
    }
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;

    const updatedData = {
      ...this.user,
      name: this.profileForm.get('name')?.value,
      phone: this.profileForm.get('phone')?.value,
      city: this.profileForm.get('city')?.value
    };

    const nameParts = updatedData.name.trim().split(' ');
    updatedData.fname = nameParts[0] || '';
    updatedData.lname = nameParts.slice(1).join(' ') || '';

    // حفظ محلي فوري
    localStorage.setItem('user', JSON.stringify(updatedData));
    this.user = updatedData;
    this.profileSuccessMessage = 'تم حفظ التغييرات بنجاح!';
    setTimeout(() => this.profileSuccessMessage = '', 3000);

    // إرسال للباك إند في حال وجود API
    this.authService.updateProfile(updatedData).subscribe({
      next: () => {},
      error: (err: any) => console.log('Backend sync skipped/failed:', err)
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.errorMessage = 'كلمة المرور الجديدة غير متطابقة';
      return;
    }

    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.passwordSuccessMessage = 'تم تحديث كلمة المرور بنجاح!';
        this.passwordForm.reset();
        this.errorMessage = '';
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'حدث خطأ أثناء تغيير كلمة المرور';
      }
    });
  }
}