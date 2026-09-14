import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './service/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = (authService as any).getUserData?.() ?? (authService as any).user ?? null;

  // السماح بالدخول فقط إذا كان الحساب دورة admin
  if (user && user.role?.toLowerCase() === 'admin') {
    return true;
  }

  // إذا لم يكن أدمن، يتم توجيهه للصفحة الرئيسية
  router.navigate(['/']);
  return false;
};