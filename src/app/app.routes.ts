import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { LoginComponent } from './login/login';
import { SignupComponent } from './signup/signup';
import { RestaurantComponent } from './restaurant/restaurant';
import { AproveRestaurantComponent } from './aprove-restaurant/aprove-restaurant';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { VendorDashboardComponent } from './vendor-dashboard/vendor-dashboard';
import { ProfileComponent } from './profile/profile';
import { SettingsComponent } from './settings/settings';
import { AboutComponent } from './about/about';
import { adminGuard } from './admin.guard';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'restaurants',
    component: RestaurantComponent,
    data: { listingType: 'restaurant', titleAr: 'دليل المطاعم حسب الدولة والمطبخ', titleEn: 'Restaurant Directory by Country & Cuisine' }
  },
  {
    path: 'homefood',
    component: RestaurantComponent,
    data: { listingType: 'home_kitchen', titleAr: 'أكل البيت', titleEn: 'Home-cooked Food' }
  },
  { path: 'aprove-restaurant', component: AproveRestaurantComponent, canActivate: [authGuard] },
  { path: 'add-restaurant', redirectTo: 'aprove-restaurant', pathMatch: 'full' },
  {
    path: 'restaurant/:id',
    loadComponent: () => import('./restaurant-detail/restaurant-detail').then(m => m.RestaurantDetailComponent)
  },
  {
    path: 'home-made/:id',
    loadComponent: () => import('./restaurant-detail/restaurant-detail').then(m => m.RestaurantDetailComponent)
  },
  {
    path: 'restaurant-detail/:id',
    loadComponent: () => import('./restaurant-detail/restaurant-detail').then(m => m.RestaurantDetailComponent)
  },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'vendor-dashboard', component: VendorDashboardComponent, canActivate: [authGuard] },
  { path: 'add-listing', redirectTo: 'vendor-dashboard', pathMatch: 'full' },
  { path: 'manage-restaurant', redirectTo: 'vendor-dashboard', pathMatch: 'full' },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'home' }
];
