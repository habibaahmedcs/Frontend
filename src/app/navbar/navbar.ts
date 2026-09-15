import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../service/auth.service';

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
  hasRejectedListing = false;

  private authSub!: Subscription;

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.fetchProfile().subscribe({ error: () => undefined });
    }

    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user && this.authService.isLoggedIn();

      if (user) {
        const ownerStatus = user.ownerStatus;
        this.userName = user.firstName || user.name || 'مستخدم';
        this.isAdmin = user.role === 'admin';
        this.isApprovedOwner = user.role === 'vendor' || ownerStatus === 'approved';
        this.hasPendingRequest = ownerStatus === 'pending' && !this.isApprovedOwner;
        this.hasRejectedListing = ownerStatus === 'rejected';
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
    this.hasRejectedListing = false;
  }

  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}
