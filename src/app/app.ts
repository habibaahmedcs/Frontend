import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// تم إزالة .ts من نهاية المسار
import { NavbarComponent } from './navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  currentLang: string = 'ar';
  
  ngOnInit() {
    const savedLang = localStorage.getItem('siteLang') || 'ar';
    
    document.documentElement.lang = savedLang;
    document.documentElement.dir = (savedLang === 'ar') ? 'rtl' : 'ltr';
  }
}