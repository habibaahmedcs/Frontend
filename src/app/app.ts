import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar';
import { AuthService } from './service/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  currentLang: string = 'ar';

  ngOnInit() {
    const savedLang = localStorage.getItem('siteLang') || 'ar';
    document.documentElement.lang = savedLang;
    document.documentElement.dir = (savedLang === 'ar') ? 'rtl' : 'ltr';

    if (this.authService.isLoggedIn()) {
      this.authService.fetchProfile().subscribe({ error: () => undefined });
    }
  }
}