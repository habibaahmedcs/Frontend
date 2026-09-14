import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../service/auth.service'; // تأكد من المسار الصحيح

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = false;
  userName = '';
  isAdmin = false;
  isApprovedOwner = false;
  hasPendingRequest = false;

  private authSub!: Subscription;

  ngOnInit(): void {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user && this.authService.isLoggedIn();

      if (user) {
        this.userName = user.name || user.username || user.firstName || 'مستخدم';
        this.isAdmin = user.role === 'admin';
        this.isApprovedOwner = user.role === 'owner' && user.ownerStatus === 'approved';
        this.hasPendingRequest = user.role === 'owner' && user.ownerStatus === 'pending';
      } else {
        this.resetUserState();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private resetUserState(): void {
    this.isLoggedIn = false;
    this.userName = '';
    this.isAdmin = false;
    this.isApprovedOwner = false;
    this.hasPendingRequest = false;
  }

  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}