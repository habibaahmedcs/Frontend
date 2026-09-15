import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ResService } from '../service/res-service';
import { API_ORIGIN, listingDetailPath, resolveImageUrl } from '../utils/image-url';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private resService = inject(ResService);
  private router = inject(Router);
  private listingSub?: Subscription;

  searchQuery: string = '';
  currentLang: string = 'ar';
  searchMessage: string = '';
  serverBaseUrl: string = `${API_ORIGIN}/`;

  fallbackRestaurants = [
    { id: 'fallback-1', nameAr: 'كشري أبو طارق', nameEn: 'Abou Tarek Koshary', cuisineAr: 'مصري', cuisineEn: 'Egyptian', locationAr: 'وسط البلد', locationEn: 'Downtown', rating: 4.8, image: 'assets/images/egyptian.jpg' },
    { id: 'fallback-2', nameAr: 'أنس الدمشقي', nameEn: 'Anas El Dimashqi', cuisineAr: 'سوري', cuisineEn: 'Syrian', locationAr: 'مدينة نصر', locationEn: 'Nasr City', rating: 4.7, image: 'assets/images/syrian.jpg' },
    { id: 'fallback-3', nameAr: 'روما بيتزا', nameEn: 'Roma Pizza', cuisineAr: 'إيطالي', cuisineEn: 'Italian', locationAr: 'الزمالك', locationEn: 'Zamalek', rating: 4.6, image: 'assets/images/italian.jpg' },
    { id: 'fallback-4', nameAr: 'موري سوشي', nameEn: 'Mori Sushi', cuisineAr: 'ياباني', cuisineEn: 'Japanese', locationAr: 'المعادي', locationEn: 'Maadi', rating: 4.9, image: 'assets/images/japanese.jpg' }
  ];

  topRestaurants: any[] = [];
  topHomeFood: any[] = [];

  ngOnInit(): void {
    this.currentLang = localStorage.getItem('siteLang') || 'ar';
    this.loadTopRated();
    this.listingSub = this.resService.listingChanges$.subscribe((listing) => {
      if (listing) this.loadTopRated();
    });
  }

  ngOnDestroy(): void {
    this.listingSub?.unsubscribe();
  }

  loadTopRated(): void {
    this.resService.getApprovedRestaurants({ type: 'restaurant', sort: 'rating', limit: 4 }).subscribe({
      next: (res) => {
        const mapped = this.mapListings(res);
        this.topRestaurants = mapped.length ? mapped : [];
      },
      error: () => {
        this.topRestaurants = this.fallbackRestaurants;
      }
    });

    this.resService.getApprovedRestaurants({ type: 'home_kitchen', sort: 'rating', limit: 4, rated: true }).subscribe({
      next: (res) => {
        this.topHomeFood = this.mapListings(res);
      },
      error: () => {
        this.topHomeFood = [];
      }
    });
  }

  private mapListings(res: any): any[] {
    const data = res?.data?.restaurants || [];
    return data.map((item: any) => ({
      id: item._id || item.id,
      type: item.type,
      nameAr: item.name,
      nameEn: item.name,
      cuisineAr: item.cuisine,
      cuisineEn: item.cuisine,
      locationAr: item.location,
      locationEn: item.location,
      rating: item.averageRating || item.rating || 0,
      image: this.getImageUrl(item.thumbnail || item.imageUrl || item.image)
    }));
  }

  getImageUrl(path: string): string {
    return resolveImageUrl(path);
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes('egyptian.png')) {
      img.src = 'assets/images/egyptian.png';
    }
  }

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (!q) {
      this.searchMessage = this.currentLang === 'ar' ? 'اكتب اسم مطعم أو مطبخ أو منطقة للبحث' : 'Type a name, cuisine, or area to search';
      return;
    }
    this.searchMessage = '';
    this.router.navigate(['/restaurants'], {
      queryParams: { q }
    });
  }

  openListing(item: any): void {
    if (!item?.id || String(item.id).startsWith('fallback')) {
      this.router.navigate(['/restaurants']);
      return;
    }
    this.router.navigate(listingDetailPath(item));
  }

  detailsLink(item: any): any {
    if (!item?.id || String(item.id).startsWith('fallback')) return '/restaurants';
    return listingDetailPath(item);
  }
}
