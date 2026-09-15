import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { ResService } from '../service/res-service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private resService = inject(ResService);

  user: any = null;
  userName: string = '';
  isAdmin: boolean = false;
  myRequest: any = null;

  private userSub!: Subscription;

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (this.user) {
        this.userName = this.user.name ||
          `${this.user.firstName || this.user.fname || ''} ${this.user.lastName || this.user.lname || ''}`.trim() || 'مستخدم';
        this.isAdmin = this.user.role === 'admin';
      } else {
        this.userName = '';
        this.isAdmin = false;
      }
    });

    this.authService.fetchProfile().subscribe({ error: () => undefined });
    this.resService.getMyRestaurants().subscribe({
      next: (res) => {
        const list = res?.data?.restaurants || [];
        this.myRequest = list[0] || null;
      },
      error: () => {
        this.myRequest = null;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
