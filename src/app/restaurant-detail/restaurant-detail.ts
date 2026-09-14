import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-detail.html',
  styleUrls: ['./restaurant-detail.css']
})
export class RestaurantDetail implements OnInit {
  restaurantId: string = '';
  restaurant: any = null;
  activeTab: 'menu' | 'photos' | 'reviews' = 'menu';
  
  // نموذج إضافة تقييم
  showReviewModal: boolean = false;
  newReview = {
    userName: '',
    rating: 5,
    comment: '',
    tags: [] as string[]
  };

  availableTags = ['طعم رائع', 'نظافة', 'سرعة التوصيل', 'قيمة السعر'];

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.restaurantId = this.route.snapshot.paramMap.get('id') || '';
    if (this.restaurantId) {
      this.fetchRestaurantDetails();
    }
  }

  fetchRestaurantDetails() {
    this.http.get<any>(`http://localhost:3000/api/restaurants/${this.restaurantId}`).subscribe({
      next: (res) => {
        this.restaurant = res.data.restaurant;
      },
      error: (err) => console.error(err)
    });
  }

  // تجميع المينيو حسب الفئات (الأطباق الرئيسية، الإضافات...)
  get categorizedMenu() {
    if (!this.restaurant?.menuItems) return {};
    return this.restaurant.menuItems.reduce((acc: any, item: any) => {
      const cat = item.category || 'الأطباق الرئيسية';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  }

  get objectKeys() {
    return Object.keys;
  }

  toggleTag(tag: string) {
    const idx = this.newReview.tags.indexOf(tag);
    if (idx > -1) {
      this.newReview.tags.splice(idx, 1);
    } else {
      this.newReview.tags.push(tag);
    }
  }

  submitReview() {
    if (!this.newReview.userName || !this.newReview.comment) return;

    this.http.post<any>(`http://localhost:3000/api/restaurants/${this.restaurantId}/reviews`, this.newReview).subscribe({
      next: (res) => {
        this.fetchRestaurantDetails();
        this.showReviewModal = false;
        this.newReview = { userName: '', rating: 5, comment: '', tags: [] };
      }
    });
  }
}