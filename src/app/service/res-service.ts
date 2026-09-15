import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_ORIGIN } from '../utils/image-url';

export interface ListingFilters {
  country?: string;
  cuisine?: string;
  type?: 'restaurant' | 'home_kitchen';
  q?: string;
  sort?: 'rating';
  limit?: number;
  rated?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ResService {
  private http = inject(HttpClient);
  private apiUrl = `${API_ORIGIN}/api/v1`;

  private listingChangesSubject = new BehaviorSubject<any | null>(null);
  readonly listingChanges$ = this.listingChangesSubject.asObservable();

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  emitListingChange(restaurant: any): void {
    this.listingChangesSubject.next(restaurant);
  }

  getApprovedRestaurants(filters?: ListingFilters): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    return this.http.get(`${this.apiUrl}/restaurants/approved`, { params });
  }

  searchListings(q: string): Observable<any> {
    return this.getApprovedRestaurants({ q });
  }

  getRestaurantById(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = token ? this.getHeaders() : undefined;
    return this.http.get(`${this.apiUrl}/restaurants/${id}`, { headers });
  }

  getMyRestaurants(): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurants/mine`, { headers: this.getHeaders() });
  }

  addRestaurant(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/restaurants`, formData, {
      headers: this.getHeaders()
    }).pipe(tap((res: any) => this.emitListingChange(res?.data?.restaurant)));
  }

  updateRestaurant(id: string, formData: FormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}/restaurants/${id}`, formData, {
      headers: this.getHeaders()
    }).pipe(tap((res: any) => this.emitListingChange(res?.data?.restaurant)));
  }

  addReview(id: string, payload: { rating: number; comment: string; tags?: string[] }): Observable<any> {
    return this.http.post(`${this.apiUrl}/restaurants/${id}/reviews`, payload, {
      headers: this.getHeaders()
    }).pipe(tap((res: any) => this.emitListingChange(res?.data?.restaurant)));
  }

  getPendingRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurants/pending`, { headers: this.getHeaders() });
  }

  approveRequest(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/restaurants/${id}/approve`, {}, { headers: this.getHeaders() })
      .pipe(tap((res: any) => this.emitListingChange(res?.data?.restaurant)));
  }

  rejectRequest(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/restaurants/${id}/reject`, {}, { headers: this.getHeaders() })
      .pipe(tap((res: any) => this.emitListingChange(res?.data?.restaurant)));
  }

  deleteRestaurant(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/listings/${id}`, { headers: this.getHeaders() })
      .pipe(tap((res: any) => this.emitListingChange(res?.data?.restaurant)));
  }
}
