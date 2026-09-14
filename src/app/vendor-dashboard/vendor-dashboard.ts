import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './vendor-dashboard.html',
  styleUrls: ['./vendor-dashboard.css']
})
export class VendorDashboard implements OnInit {
  restaurantForm!: FormGroup;
  restaurantId: string = '';
  loading: boolean = false;
  successMessage: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.initForm();
    this.loadVendorRestaurant();
  }

  initForm() {
    this.restaurantForm = this.fb.group({
      description: ['', Validators.required],
      phone: ['', Validators.required],
      workingHours: ['', Validators.required],
      address: ['', Validators.required],
      menuItems: this.fb.array([])
    });
  }

  get menuItems(): FormArray {
    return this.restaurantForm.get('menuItems') as FormArray;
  }

  newMenuItem(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(1)]],
      category: ['الأطباق الرئيسية', Validators.required], // الأطباق الرئيسية، الإضافات، المشروبات
      imageUrl: ['']
    });
  }

  addMenuItem() {
    this.menuItems.push(this.newMenuItem());
  }

  removeMenuItem(index: number) {
    this.menuItems.removeAt(index);
  }

  loadVendorRestaurant() {
    const token = localStorage.getItem('token');
    this.http.get<any>('http://localhost:3000/api/restaurants/mine', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        if (res.data.restaurants && res.data.restaurants.length > 0) {
          const rest = res.data.restaurants[0];
          this.restaurantId = rest._id;
          
          this.restaurantForm.patchValue({
            description: rest.description || '',
            phone: rest.phone || '',
            workingHours: rest.workingHours || '',
            address: rest.address || ''
          });

          if (rest.menuItems && rest.menuItems.length > 0) {
            rest.menuItems.forEach((item: any) => {
              this.menuItems.push(this.fb.group({
                name: [item.name, Validators.required],
                description: [item.description || ''],
                price: [item.price, Validators.required],
                category: [item.category || 'الأطباق الرئيسية', Validators.required],
                imageUrl: [item.imageUrl || '']
              }));
            });
          }
        }
      }
    });
  }

  saveRestaurantDetails() {
    if (this.restaurantForm.invalid) return;
    this.loading = true;

    const token = localStorage.getItem('token');
    this.http.patch<any>(`http://localhost:3000/api/restaurants/${this.restaurantId}`, this.restaurantForm.value, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = 'تم تحديث بيانات المطعم والمينيو بنجاح!';
      },
      error: (err) => {
        this.loading = false;
        alert('حدث خطأ أثناء حفظ البيانات');
      }
    });
  }
}