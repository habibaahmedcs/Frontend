import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  currentLang: string = 'ar';
  activeTab: 'requests' | 'restaurants' = 'requests';
  selectedImage: string | null = null;

  requests: any[] = [];
  restaurants: any[] = [];

  ngOnInit(): void {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      this.currentLang = savedLang;
    }
  }

  switchTab(tab: 'requests' | 'restaurants'): void {
    this.activeTab = tab;
  }

  getImageUrl(imagePath: string): string {
    return imagePath || 'assets/images/default-restaurant.jpg';
  }

  openImageModal(image: string): void {
    this.selectedImage = this.getImageUrl(image);
  }

  closeImageModal(): void {
    this.selectedImage = null;
  }

  approveRequest(id: string): void {
    console.log('Approve:', id);
  }

  rejectRequest(id: string): void {
    console.log('Reject:', id);
  }

  deleteRestaurant(id: string): void {
    console.log('Delete:', id);
  }
}