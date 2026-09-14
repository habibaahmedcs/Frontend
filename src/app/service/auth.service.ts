import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/v1';

  private currentUserSubject = new BehaviorSubject<any>(this.getUserData());
  public currentUser$: Observable<any> = this.currentUserSubject.asObservable();

  isLoggedIn(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserData(): any {
    const savedUser = localStorage.getItem('registeredUser');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    return null;
  }

  saveUser(user: any, token?: string): void {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('registeredUser', JSON.stringify(user));
    if (token) {
      localStorage.setItem('token', token);
    }
    this.currentUserSubject.next(user);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // جلب البروفايل من الباك إند وتحديث البيانات المحلية
  fetchProfile(): Observable<any> {
    return this.http.get<{ status: string; data: { user: any } }>(`${this.apiUrl}/users/profile`, { headers: this.getAuthHeaders() }).pipe(
      tap(res => {
        if (res?.data?.user) {
          this.saveUser(res.data.user);
        }
      })
    );
  }

  // تحديث البيانات الشخصية
  updateProfile(userData: any): Observable<any> {
    return this.http.put<{ status: string; data: { user: any } }>(`${this.apiUrl}/users/profile`, userData, { headers: this.getAuthHeaders() }).pipe(
      tap(res => {
        const updatedUser = res?.data?.user || userData;
        this.saveUser(updatedUser);
      })
    );
  }

  // تغيير كلمة المرور
  changePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/change-password`, passwordData, { headers: this.getAuthHeaders() });
  }

  // تسجيل الدخول مع تحديث الحالة فوراً
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        // استخراج بيانات المستخدم والتوكن طبقاً لشكل الرد من الـ API
        const user = res?.data?.user || res?.user || res?.data;
        const token = res?.token || res?.data?.token;

        if (user) {
          this.saveUser(user, token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('registeredUser');
    this.currentUserSubject.next(null);
  }
}