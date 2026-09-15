import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { User } from '../user';
import { API_ORIGIN } from '../utils/image-url';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${API_ORIGIN}/api/v1`;

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserData());
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  isLoggedIn(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true' && !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserData(): User | null {
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

  saveUser(user: User, token?: string): void {
    const normalized: User = {
      ...user,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    };
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('registeredUser', JSON.stringify(normalized));
    if (token) {
      localStorage.setItem('token', token);
    }
    this.currentUserSubject.next(normalized);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  signup(userData: FormData | Record<string, unknown>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/signup`, userData).pipe(
      tap((res) => {
        const user = res?.data?.user;
        const token = res?.token || res?.data?.token;
        if (user && token) {
          this.saveUser(user, token);
        }
      }),
    );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((res) => {
        const user = res?.data?.user || res?.user;
        const token = res?.token || res?.data?.token;
        if (user && token) {
          this.saveUser(user, token);
        }
      }),
    );
  }

  fetchProfile(): Observable<any> {
    return this.http
      .get<{ status: string; data: { user: User } }>(`${this.apiUrl}/users/profile`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap((res) => {
          if (res?.data?.user) {
            this.saveUser(res.data.user, this.getToken() || undefined);
          }
        }),
      );
  }

  updateProfile(formData: FormData): Observable<any> {
    return this.http
      .put<{ status: string; data: { user: User } }>(`${this.apiUrl}/users/profile`, formData, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap((res) => {
          if (res?.data?.user) {
            this.saveUser(res.data.user, this.getToken() || undefined);
          }
        }),
      );
  }

  changePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/change-password`, passwordData, {
      headers: this.getAuthHeaders(),
    });
  }

  logout(): void {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('registeredUser');
    this.currentUserSubject.next(null);
  }
}
