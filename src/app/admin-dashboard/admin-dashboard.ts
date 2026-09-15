import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResService } from '../service/res-service';
import { resolveImageUrl } from '../utils/image-url';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private resService = inject(ResService);

  activeTab: 'requests' | 'restaurants' | 'homes' = 'requests';
  currentLang: string = 'ar';

  requests: any[] = [];
  restaurants: any[] = [];
  homeKitchens: any[] = [];
  selectedImage: string | null = null;
  loading = false;
  feedback = '';
  errorMessage = '';
  private listingSub?: Subscription;

  ngOnInit(): void {
    this.currentLang = localStorage.getItem('siteLang') || 'ar';
    this.refreshAll();
    this.listingSub = this.resService.listingChanges$.subscribe((listing) => {
      if (listing) this.refreshAll();
    });
  }

  ngOnDestroy(): void {
    this.listingSub?.unsubscribe();
  }

  refreshAll(): void {
    this.loadPendingRequests();
    this.loadApprovedRestaurants();
    this.loadHomeKitchens();
  }

  switchTab(tab: 'requests' | 'restaurants' | 'homes'): void {
    this.activeTab = tab;
  }

  loadPendingRequests(): void {
    this.loading = true;
    this.resService.getPendingRequests().subscribe({
      next: (res: any) => {
        this.loading = false;
        this.requests = res?.data?.restaurants || res?.data || [];
        this.errorMessage = '';
      },
      error: (err) => {
        this.loading = false;
        this.requests = [];
        this.errorMessage = err?.error?.message || (this.currentLang === 'ar'
          ? 'تعذر تحميل الطلبات. تأكد أنك مسجل كأدمن وأن السيرفر يعمل.'
          : 'Could not load requests. Confirm you are logged in as admin.');
      }
    });
  }

  loadApprovedRestaurants(): void {
    this.resService.getApprovedRestaurants({ type: 'restaurant' }).subscribe({
      next: (res: any) => {
        this.restaurants = res?.data?.restaurants || res?.data || [];
      },
      error: () => {
        this.restaurants = [];
      }
    });
  }

  loadHomeKitchens(): void {
    this.resService.getApprovedRestaurants({ type: 'home_kitchen' }).subscribe({
      next: (res: any) => {
        this.homeKitchens = res?.data?.restaurants || res?.data || [];
      },
      error: () => {
        this.homeKitchens = [];
      }
    });
  }

  approveRequest(id: string): void {
    this.resService.approveRequest(id).subscribe({
      next: () => {
        this.feedback = this.currentLang === 'ar' ? 'تم قبول الطلب بنجاح' : 'Request approved';
        this.refreshAll();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || (this.currentLang === 'ar' ? 'فشل قبول الطلب' : 'Approve failed');
      }
    });
  }

  rejectRequest(id: string): void {
    this.resService.rejectRequest(id).subscribe({
      next: () => {
        this.feedback = this.currentLang === 'ar' ? 'تم رفض الطلب' : 'Request rejected';
        this.loadPendingRequests();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || (this.currentLang === 'ar' ? 'فشل رفض الطلب' : 'Reject failed');
      }
    });
  }

  deleteRestaurant(id: string): void {
    const confirmMsg = this.currentLang === 'ar' ? 'هل أنت تأكد من حذف هذا المطعم؟' : 'Are you sure you want to delete this restaurant?';
    if (confirm(confirmMsg)) {
      this.resService.deleteRestaurant(id).subscribe({
        next: () => {
          this.feedback = this.currentLang === 'ar' ? 'تم الحذف' : 'Deleted';
          this.refreshAll();
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || (this.currentLang === 'ar' ? 'فشل الحذف' : 'Delete failed');
        }
      });
    }
  }

  getImageUrl(path: string): string {
    return resolveImageUrl(path);
  }

  openImageModal(imagePath: string): void {
    this.selectedImage = this.getImageUrl(imagePath);
  }

  closeImageModal(): void {
    this.selectedImage = null;
  }
}
