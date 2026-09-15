import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ResService } from '../service/res-service';
import { API_ORIGIN, listingDetailPath, resolveImageUrl } from '../utils/image-url';

@Component({
  selector: 'app-restaurant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant.html',
  styleUrls: ['./restaurant.css']
})
export class RestaurantComponent implements OnInit, OnDestroy {
  private resService = inject(ResService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  currentLang: string = 'ar';
  searchQuery: string = '';
  selectedCuisine: string = 'all';
  listingType: 'restaurant' | 'home_kitchen' | 'all' = 'restaurant';
  pageTitleAr = 'دليل المطاعم حسب الدولة والمطبخ';
  pageTitleEn = 'Restaurant Directory by Country & Cuisine';
  pageSubtitleAr = 'استكشف مطابخ العالم المتوفرة في مصر';
  pageSubtitleEn = 'Explore world cuisines available in Egypt';
  errorMessage = '';

  allRestaurants: any[] = [];
  filteredRestaurants: any[] = [];
  serverBaseUrl: string = `${API_ORIGIN}/`;
  private subs = new Subscription();

  ngOnInit(): void {
    this.currentLang = localStorage.getItem('siteLang') || 'ar';

    this.route.data.subscribe((data) => {
      this.listingType = data['listingType'] || 'restaurant';
      this.pageTitleAr = data['titleAr'] || this.pageTitleAr;
      this.pageTitleEn = data['titleEn'] || this.pageTitleEn;
      if (this.listingType === 'home_kitchen') {
        this.pageSubtitleAr = 'مطابخ منزلية وأكل بيتي من كل المحافظات';
        this.pageSubtitleEn = 'Home kitchens and homemade dishes across Egypt';
      }
    });

    this.subs.add(
      this.route.queryParamMap.subscribe((params) => {
        this.searchQuery = params.get('q') || '';
        this.selectedCuisine = params.get('cuisine') || 'all';
        this.loadRestaurants();
      })
    );

    this.subs.add(
      this.resService.listingChanges$.subscribe((listing) => {
        if (listing) this.loadRestaurants();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadRestaurants(): void {
    this.errorMessage = '';
    const searchBoth = this.listingType !== 'home_kitchen' && !!this.searchQuery.trim();
    const type = this.listingType === 'home_kitchen'
      ? 'home_kitchen'
      : searchBoth
        ? undefined
        : 'restaurant';
    this.resService.getApprovedRestaurants({
      type,
      q: this.searchQuery || undefined,
      cuisine: this.selectedCuisine !== 'all' ? this.selectedCuisine : undefined
    }).subscribe({
      next: (res: any) => {
        const data = res?.data?.restaurants || res?.data || res || [];
        this.allRestaurants = (Array.isArray(data) ? data : []).map((item: any) => ({
          ...item,
          id: item._id || item.id,
          type: item.type,
          nameAr: item.nameAr || item.name,
          nameEn: item.nameEn || item.name,
          cuisineAr: item.cuisineAr || item.cuisine,
          cuisineEn: item.cuisineEn || item.cuisine,
          locationAr: item.locationAr || item.location,
          locationEn: item.locationEn || item.location,
          rating: item.averageRating || item.rating || 0,
          image: this.getImageUrl(item.thumbnail || item.imageUrl || item.image)
        }));
        this.applyFilter();
      },
      error: () => {
        this.errorMessage = this.currentLang === 'ar'
          ? 'تعذر تحميل الدليل حالياً. تأكد أن السيرفر يعمل.'
          : 'Could not load listings. Make sure the server is running.';
        this.allRestaurants = [];
        this.filteredRestaurants = [];
      }
    });
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

  filterByCuisine(cuisine: string): void {
    this.selectedCuisine = cuisine;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchQuery || null,
        cuisine: cuisine === 'all' ? null : cuisine
      },
      queryParamsHandling: 'merge'
    });
  }

  applySearch(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    let result = [...this.allRestaurants];
    const cuisine = this.selectedCuisine;

    if (cuisine !== 'all') {
      const needle = cuisine.toLowerCase();
      result = result.filter((item) =>
        [item.cuisine, item.cuisineAr, item.cuisineEn]
          .filter(Boolean)
          .some((value: string) => value.toLowerCase().includes(needle))
      );
    }

    if (this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter((item) =>
        [item.nameAr, item.nameEn, item.cuisineAr, item.cuisineEn, item.locationAr, item.locationEn, item.description]
          .filter(Boolean)
          .some((value: string) => value.toLowerCase().includes(query))
      );
    }

    this.filteredRestaurants = result;
  }

  viewDetails(restaurant: any): void {
    this.router.navigate(listingDetailPath(restaurant));
  }
}
