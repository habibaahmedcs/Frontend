import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  searchQuery: string = '';
  currentLang: string = 'ar';

  topRestaurants = [
    { id: 1, nameAr: 'كشري أبو طارق', nameEn: 'Abou Tarek Koshary', cuisineAr: 'مصري', cuisineEn: 'Egyptian', locationAr: 'وسط البلد', locationEn: 'Downtown', rating: 4.8, image: 'assets/images/egyptian.jpg' },
    { id: 2, nameAr: 'أنس الدمشقي', nameEn: 'Anas El Dimashqi', cuisineAr: 'سوري', cuisineEn: 'Syrian', locationAr: 'مدينة نصر', locationEn: 'Nasr City', rating: 4.7, image: 'assets/images/syrian.jpg' },
    { id: 3, nameAr: 'روما بيتزا', nameEn: 'Roma Pizza', cuisineAr: 'إيطالي', cuisineEn: 'Italian', locationAr: 'الزمالك', locationEn: 'Zamalek', rating: 4.6, image: 'assets/images/italian.jpg' },
    { id: 4, nameAr: 'موري سوشي', nameEn: 'Mori Sushi', cuisineAr: 'ياباني', cuisineEn: 'Japanese', locationAr: 'المعادي', locationEn: 'Maadi', rating: 4.9, image: 'assets/images/japanese.jpg' }
  ];

  constructor(private router: Router) {}

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/resturant'], { 
        queryParams: { q: this.searchQuery.trim() } 
      });
    }
  }
}