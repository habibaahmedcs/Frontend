import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { LoginComponent } from './login/login';
import { SignupComponent } from './signup/signup';
import { SettingsComponent } from './settings/settings';
import { ProfileComponent } from './profile/profile';
import { RestaurantComponent } from './restaurant/restaurant';
import { RestaurantDetail } from './restaurant-detail/restaurant-detail';
import { NavbarComponent } from './navbar/navbar';
import { AproveRestaurantComponent } from './aprove-restaurant/aprove-restaurant';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { VendorDashboard } from './vendor-dashboard/vendor-dashboard';
import { adminGuard } from './admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'profile', component: ProfileComponent },
  
  // صفحة قائمة المطاعم
  { path: 'restaurant', component: RestaurantComponent },
  
  // صفحة طلب انضمام/إضافة مطعم
  { path: 'aprove-restaurant', component: AproveRestaurantComponent },
  { path: 'add-restaurant', redirectTo: 'aprove-restaurant', pathMatch: 'full' },

  { path: 'resturant', redirectTo: 'restaurant', pathMatch: 'full' },
  { path: 'restaurant-detail/:id', component: RestaurantDetail },
  { path: 'navbar', component: NavbarComponent },
  { 
    path: 'admin-dashboard', 
    component: AdminDashboardComponent, 
    canActivate: [adminGuard] 
  },
  { path: 'vendor-dashboard', component: VendorDashboard },
  { path: 'homefood', redirectTo: 'home', pathMatch: 'full' },
  { path: 'about', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];