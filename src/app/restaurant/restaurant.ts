import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResService } from '../service/res-service';

@Component({
  selector: 'app-restaurant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant.html',
  styleUrl: './restaurant.css'
})
export class RestaurantComponent implements OnInit {
  currentLang: string = 'ar';
  searchQuery: string = '';
  selectedCuisine: string = 'all';

  restaurants: any[] = [];
  filteredRestaurants: any[] = [];

  constructor(private restaurantService: ResService) {}

  ngOnInit(): void {
    this.loadRestaurants();
  }

  private extractArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.restaurants)) return res.data.restaurants;
    if (Array.isArray(res?.restaurants)) return res.restaurants;
    return [];
  }

  loadRestaurants(): void {
    const service = this.restaurantService as any;
    const request$ = service.getApprovedRestaurants?.() ?? service.getRestaurants?.();

    if (!request$) {
      console.error('ResService does not expose a restaurant list method.');
      return;
    }

    request$.subscribe({
      next: (res: any) => {
        const rawList = this.extractArray(res);
        this.restaurants = rawList.map((item: any) => ({
          id: item._id || item.id,
          nameAr: item.name,
          nameEn: item.name,
          cuisineAr: item.cuisine,
          cuisineEn: item.cuisine,
          locationAr: item.location,
          locationEn: item.location,
          rating: item.rating || 4.5,
          image: this.getImageUrl(item.image)
        }));
        this.filteredRestaurants = [...this.restaurants];
      },
      error: (err: any) => console.error('خطأ في تحميل المطاعم:', err)
    });
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/default-restaurant.png';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('restaurants/')) return `http://localhost:3000/uploads/${imagePath}`;
    return `http://localhost:3000/uploads/restaurants/${imagePath}`;
  }

  filterByCuisine(cuisine: string): void {
    this.selectedCuisine = cuisine;
    this.applyFilters();
  }

  applySearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredRestaurants = this.restaurants.filter(r => {
      const matchesCuisine = this.selectedCuisine === 'all' || r.cuisineAr === this.selectedCuisine;
      const query = this.searchQuery.toLowerCase();
      const matchesSearch = !query || 
        r.nameAr.toLowerCase().includes(query) || 
        r.cuisineAr.toLowerCase().includes(query) || 
        r.locationAr.toLowerCase().includes(query);

      return matchesCuisine && matchesSearch;
    });
  }
}