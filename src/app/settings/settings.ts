import { Component, OnInit, inject } from '@angular/core';
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
  savingProfile = false;
  savingPassword = false;

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
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });

    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      if (user) {
        this.patchProfile(user);
      }
    });

    this.authService.fetchProfile().subscribe({
      next: (res) => {
        const updatedUser = res?.data?.user;
        if (updatedUser) {
          this.user = updatedUser;
          this.patchProfile(updatedUser);
        }
      },
      error: () => this.loadUserData()
    });
  }

  loadUserData(): void {
    this.user = this.authService.getUserData();
    if (this.user) {
      this.patchProfile(this.user);
    }
  }

  private patchProfile(user: any): void {
    const fullName = user.name || `${user.firstName || user.fname || ''} ${user.lastName || user.lname || ''}`.trim();
    this.profileForm.patchValue({
      name: fullName,
      email: user.email || '',
      phone: user.phone || '',
      city: user.city || ''
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.errorMessage = 'يرجى إدخال الاسم بالكامل';
      return;
    }
    this.errorMessage = '';
    this.profileSuccessMessage = '';
    this.savingProfile = true;

    const rawName = this.profileForm.get('name')?.value || '';
    const nameParts = rawName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const formData = new FormData();
    formData.append('name', rawName);
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('phone', this.profileForm.get('phone')?.value || '');
    formData.append('city', this.profileForm.get('city')?.value || '');

    this.authService.updateProfile(formData).subscribe({
      next: (res) => {
        this.savingProfile = false;
        const updatedUser = res?.data?.user;
        if (updatedUser) {
          this.user = updatedUser;
          this.patchProfile(updatedUser);
        }
        this.profileSuccessMessage = 'تم حفظ التغييرات بنجاح!';
        setTimeout(() => this.profileSuccessMessage = '', 3000);
      },
      error: (err: any) => {
        this.savingProfile = false;
        this.errorMessage = err?.error?.message || 'فشل التحديث في قاعدة البيانات';
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.errorMessage = 'كلمة المرور الجديدة غير متطابقة';
      return;
    }

    this.savingPassword = true;
    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.savingPassword = false;
        this.passwordSuccessMessage = 'تم تحديث كلمة المرور بنجاح!';
        this.passwordForm.reset();
        this.errorMessage = '';
        setTimeout(() => this.passwordSuccessMessage = '', 3000);
      },
      error: (err: any) => {
        this.savingPassword = false;
        this.errorMessage = err?.error?.message || 'حدث خطأ أثناء تغيير كلمة المرور';
      }
    });
  }
}
