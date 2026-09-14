import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  userName: string = '';
  isAdmin: boolean = false;
  myRequest: any = null;

  ngOnInit(): void {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
      
      // التوافق مع جميع صيغ الأسماء
      this.userName = this.user.name || 
        `${this.user.fname || ''} ${this.user.lname || ''}`.trim() || 'مستخدم';

      this.isAdmin = this.user.role === 'admin';
    }
  }
}