import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ResService } from '../service/res-service';
import { AuthService } from '../service/auth.service';
import { resolveImageUrl } from '../utils/image-url';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './restaurant-detail.html',
  styleUrls: ['./restaurant-detail.css']
})
export class RestaurantDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private resService = inject(ResService);
  private authService = inject(AuthService);

  restaurant: any = null;
  listingId: string | null = null;
  activeTab: string = 'menu';
  showReviewModal = false;
  categorizedMenu: { [key: string]: any[] } = {};
  reviewRating = 5;
  reviewComment = '';
  reviewTags: string[] = [];
  reviewMessage = '';
  reviewError = '';
  isOwner = false;
  loadError = '';
  stars = [1, 2, 3, 4, 5];
  availableTags = ['طعم رائع', 'نظافة', 'خدمة', 'قيمة السعر'];

  objectKeys = Object.keys;
  private subs = new Subscription();

  ngOnInit(): void {
    this.subs.add(
      this.route.paramMap.subscribe((params) => {
        const id = params.get('id');
        this.listingId = id;
        if (id) this.loadRestaurantDetails(id);
      })
    );
    this.subs.add(
      this.resService.listingChanges$.subscribe((updated) => {
        const updatedId = updated?._id || updated?.id;
        if (updatedId && this.listingId && String(updatedId) === String(this.listingId)) {
          if (updated.status === 'deleted' || updated.status === 'rejected') {
            this.restaurant = null;
            this.loadError = 'تم حذف هذا المكان من الدليل.';
            return;
          }
          this.applyRestaurant(updated);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadRestaurantDetails(id: string): void {
    this.loadError = '';
    this.resService.getRestaurantById(id).subscribe({
      next: (res: any) => {
        const data = res?.data?.restaurant || res?.data || res;
        this.applyRestaurant(data);
      },
      error: () => {
        this.restaurant = null;
        this.loadError = 'تعذر العثور على هذه القائمة.';
      }
    });
  }

  applyRestaurant(data: any): void {
    const currentUser = this.authService.getUserData();
    const ownerId = data.owner?._id || data.owner?.id || data.owner;
    this.isOwner = !!currentUser && !!ownerId && String(ownerId) === String(currentUser._id || currentUser.id);

    const cover = this.getImageUrl(data.coverImage || data.imageUrl || data.image);
    const reviews = (data.reviews || []).map((rev: any) => ({
      ...rev,
      userName: rev.userName || 'مستخدم',
      userAvatar: this.getImageUrl(rev.userAvatar || rev.user?.imageUrl, ''),
      date: rev.createdAt || rev.date,
      tags: Array.isArray(rev.tags) ? rev.tags : []
    }));
    const ratingsCount = data.ratingsCount || reviews.length || 0;
    const averageRating = data.averageRating || data.rating || 0;

    this.restaurant = {
      ...data,
      name: data.name || data.nameAr,
      image: cover,
      coverImage: cover,
      thumbnail: this.getImageUrl(data.thumbnail || data.image),
      address: data.location || data.address || '',
      phone: data.phone || '',
      workingHours: data.workingHours || '',
      gallery: (data.gallery || []).filter(Boolean).map((img: string) => this.getImageUrl(img)),
      reviews,
      rating: averageRating,
      ratingsCount
    };

    const menu = data.menu || data.menuItems || [];
    if (Array.isArray(menu) && menu.length) {
      const grouped = menu.reduce((acc: any, item: any) => {
        const cat = item.category || 'الأطباق الرئيسية';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push({
          ...item,
          imageUrl: this.getImageUrl(item.imageUrl || item.image)
        });
        return acc;
      }, {});
      const preferred = (data.menuCategories || []).filter((cat: string) => grouped[cat]);
      const rest = Object.keys(grouped).filter((cat) => !preferred.includes(cat));
      this.categorizedMenu = [...preferred, ...rest].reduce((acc: any, cat: string) => {
        acc[cat] = grouped[cat];
        return acc;
      }, {});
    } else {
      this.categorizedMenu = {};
    }
  }

  starArray(rating: number): boolean[] {
    return this.stars.map((star) => star <= Math.round(Number(rating) || 0));
  }

  openReviewModal(): void {
    this.reviewError = '';
    this.reviewMessage = '';
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.isOwner) {
      this.reviewError = 'لا يمكنك تقييم قائمتك الخاصة';
      this.activeTab = 'reviews';
      return;
    }
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
  }

  toggleTag(tag: string): void {
    if (this.reviewTags.includes(tag)) {
      this.reviewTags = this.reviewTags.filter((item) => item !== tag);
    } else {
      this.reviewTags = [...this.reviewTags, tag];
    }
  }

  submitReview(): void {
    if (!this.listingId) return;
    if (this.isOwner) {
      this.reviewError = 'لا يمكنك تقييم قائمتك الخاصة';
      return;
    }

    this.resService.addReview(this.listingId, {
      rating: Number(this.reviewRating),
      comment: this.reviewComment,
      tags: this.reviewTags
    }).subscribe({
      next: (res) => {
        this.reviewMessage = 'تم حفظ تقييمك بنجاح';
        this.showReviewModal = false;
        this.reviewComment = '';
        this.reviewTags = [];
        const updated = res?.data?.restaurant;
        if (updated) this.applyRestaurant(updated);
      },
      error: (err) => {
        this.reviewError = err?.error?.message || 'تعذر حفظ التقييم';
      }
    });
  }

  getImageUrl(path: string, fallback?: string): string {
    return resolveImageUrl(path, fallback === '' ? '' : fallback);
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/egyptian.png';
  }
}
