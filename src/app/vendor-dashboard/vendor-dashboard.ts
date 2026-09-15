import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './vendor-dashboard.html',
  styleUrls: ['./vendor-dashboard.css']
})
export class VendorDashboardComponent implements OnInit {
  apiUrl = 'http://localhost:5000/api/v1'; // استبدل بالرابط الخاص بالـ Backend لديك
  baseUrl = 'http://localhost:5000';

  restaurantForm!: FormGroup;
  fetchingData = true;
  savingBasic = false;
  savingMenu = false;
  savingGallery = false;
  deleting = false;

  restaurantId: string | null = null;
  restaurantStatus: string = '';
  isRejected = false;
  isAdminDeleted = false;
  isLocked = false;
  canPublish = true;

  successMessage = '';
  errorMessage = '';

  cuisineOptions: string[] = ['مصري', 'سوري', 'ياباني', 'إيطالي', 'مشويات', 'أكل بيتي', 'حلويات', 'برجر'];
  menuCategories: string[] = ['الأطباق الرئيسية'];
  newCategory = '';
  galleryKeep: string[] = [];

  currentCoverUrl = '';
  currentThumbUrl = '';

  selectedCoverFile: File | null = null;
  selectedThumbFile: File | null = null;
  selectedGalleryFiles: File[] = [];
  menuImageFiles: { [key: number]: File } = {};

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.initForm();
  }

  ngOnInit(): void {
    this.fetchVendorData();
  }

  initForm(): void {
    this.restaurantForm = this.fb.group({
      name: ['', Validators.required],
      cuisine: ['مصري', Validators.required],
      location: ['', Validators.required],
      phone: ['', Validators.required],
      workingHours: [''],
      description: [''],
      menuItems: this.fb.array([])
    });
  }

  get menuItems(): FormArray {
    return this.restaurantForm.get('menuItems') as FormArray;
  }

  fetchVendorData(): void {
    this.fetchingData = true;
    this.errorMessage = '';

    this.http.get<any>(`${this.apiUrl}/vendor/my-restaurant`)
      .pipe(
        finalize(() => {
          // يضمن عدم بقاء الشاشة معلقة في حالة التحميل مهما كانت النتيجة
          this.fetchingData = false;
        })
      )
      .subscribe({
        next: (res) => {
          const data = res?.data || res?.restaurant || res;

          if (data && (data._id || data.id)) {
            this.restaurantId = data._id || data.id;
            this.restaurantStatus = data.status || 'approved';
            this.isRejected = this.restaurantStatus === 'rejected';
            this.isAdminDeleted = this.restaurantStatus === 'deleted' || data.isDeleted === true;

            this.isLocked = this.isRejected || this.isAdminDeleted || this.restaurantStatus === 'pending';
            this.canPublish = !this.isLocked;

            this.restaurantForm.patchValue({
              name: data.name || '',
              cuisine: data.cuisine || 'مصري',
              location: data.location || '',
              phone: data.phone || '',
              workingHours: data.workingHours || '',
              description: data.description || ''
            });

            this.currentCoverUrl = data.coverImage || '';
            this.currentThumbUrl = data.thumbnailImage || data.image || '';
            this.galleryKeep = data.gallery || [];

            if (data.menuCategories && data.menuCategories.length > 0) {
              this.menuCategories = data.menuCategories;
            }

            this.menuItems.clear();
            if (data.menuItems && Array.isArray(data.menuItems)) {
              data.menuItems.forEach((item: any) => {
                this.menuItems.push(this.fb.group({
                  id: [item._id || item.id || ''],
                  name: [item.name || '', Validators.required],
                  category: [item.category || this.menuCategories[0] || '', Validators.required],
                  price: [item.price || 0, Validators.required],
                  description: [item.description || ''],
                  imageUrl: [item.imageUrl || item.image || '']
                }));
              });
            }
          }
        },
        error: (err) => {
          console.error('Error fetching vendor data:', err);
          this.errorMessage = 'تعذر جلب بيانات المطعم. تأكد من الاتصال بالخادم.';
        }
      });
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${this.baseUrl}/${path.replace(/\\/g, '/')}`;
  }

  onCoverSelected(event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.selectedCoverFile = event.target.files[0];
    }
  }

  onThumbSelected(event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.selectedThumbFile = event.target.files[0];
    }
  }

  onGallerySelected(event: any): void {
    if (event.target.files) {
      this.selectedGalleryFiles = Array.from(event.target.files);
    }
  }

  onMenuImageSelected(index: number, event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.menuImageFiles[index] = event.target.files[0];
    }
  }

  addCategory(): void {
    const cat = this.newCategory.trim();
    if (cat && !this.menuCategories.includes(cat)) {
      this.menuCategories.push(cat);
      this.newCategory = '';
    }
  }

  removeCategory(cat: string): void {
    this.menuCategories = this.menuCategories.filter(c => c !== cat);
  }

  addMenuItem(): void {
    this.menuItems.push(this.fb.group({
      id: [''],
      name: ['', Validators.required],
      category: [this.menuCategories[0] || '', Validators.required],
      price: [0, Validators.required],
      description: [''],
      imageUrl: ['']
    }));
  }

  removeMenuItem(index: number): void {
    this.menuItems.removeAt(index);
    delete this.menuImageFiles[index];
  }

  removeKeptGallery(imgUrl: string): void {
    this.galleryKeep = this.galleryKeep.filter(img => img !== imgUrl);
  }

  saveBasicInfo(): void {
    if (this.isLocked || !this.restaurantId) return;
    this.savingBasic = true;
    this.clearMessages();

    const formData = new FormData();
    Object.keys(this.restaurantForm.value).forEach(key => {
      if (key !== 'menuItems') {
        formData.append(key, this.restaurantForm.value[key]);
      }
    });

    if (this.selectedCoverFile) formData.append('coverImage', this.selectedCoverFile);
    if (this.selectedThumbFile) formData.append('thumbnailImage', this.selectedThumbFile);

    this.http.put<any>(`${this.apiUrl}/vendor/restaurant/${this.restaurantId}/basic`, formData).subscribe({
      next: (res) => {
        this.successMessage = 'تم تحديث البيانات الأساسية بنجاح!';
        this.savingBasic = false;
        if (res.coverImage) this.currentCoverUrl = res.coverImage;
        if (res.thumbnailImage) this.currentThumbUrl = res.thumbnailImage;
      },
      error: () => {
        this.errorMessage = 'حدث خطأ أثناء حفظ البيانات الأساسية.';
        this.savingBasic = false;
      }
    });
  }

  saveMenu(): void {
    if (this.isLocked || !this.restaurantId) return;
    this.savingMenu = true;
    this.clearMessages();

    const formData = new FormData();
    formData.append('menuCategories', JSON.stringify(this.menuCategories));
    formData.append('menuItems', JSON.stringify(this.menuItems.value));

    Object.keys(this.menuImageFiles).forEach((indexStr) => {
      const idx = parseInt(indexStr, 10);
      formData.append(`menuImage_${idx}`, this.menuImageFiles[idx]);
    });

    this.http.put<any>(`${this.apiUrl}/vendor/restaurant/${this.restaurantId}/menu`, formData).subscribe({
      next: () => {
        this.successMessage = 'تم نشر قائمة الطعام بنجاح!';
        this.savingMenu = false;
      },
      error: () => {
        this.errorMessage = 'حدث خطأ أثناء حفظ قائمة الطعام.';
        this.savingMenu = false;
      }
    });
  }

  saveGallery(): void {
    if (this.isLocked || !this.restaurantId) return;
    this.savingGallery = true;
    this.clearMessages();

    const formData = new FormData();
    formData.append('existingGallery', JSON.stringify(this.galleryKeep));
    this.selectedGalleryFiles.forEach((file) => {
      formData.append('gallery', file);
    });

    this.http.put<any>(`${this.apiUrl}/vendor/restaurant/${this.restaurantId}/gallery`, formData).subscribe({
      next: (res) => {
        this.successMessage = 'تم تحديث معرض الصور بنجاح!';
        if (res.gallery) this.galleryKeep = res.gallery;
        this.savingGallery = false;
      },
      error: () => {
        this.errorMessage = 'حدث خطأ أثناء حفظ الصور.';
        this.savingGallery = false;
      }
    });
  }

  deleteListing(): void {
    if (!this.restaurantId) return;
    if (confirm('هل أنت تأكد من رغبتك في حذف المطعم؟')) {
      this.deleting = true;
      this.http.delete<any>(`${this.apiUrl}/vendor/restaurant/${this.restaurantId}`).subscribe({
        next: () => {
          this.deleting = false;
          this.isAdminDeleted = true;
          this.isLocked = true;
          this.successMessage = 'تم حذف المطعم بنجاح.';
        },
        error: () => {
          this.errorMessage = 'حدث خطأ أثناء حذف المطعم.';
          this.deleting = false;
        }
      });
    }
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}