import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/v1';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  addRestaurant(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/restaurants`, formData, {
      headers: this.getHeaders()
    });
  }

  getPendingRequests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurants/pending`, { headers: this.getHeaders() });
  }

  getRestaurants(): Observable<any> {
    return this.http.get(`${this.apiUrl}/restaurants`, { headers: this.getHeaders() });
  }

  approveRequest(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/restaurants/${id}/approve`, {}, { headers: this.getHeaders() });
  }

  rejectRequest(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/restaurants/${id}/reject`, { headers: this.getHeaders() });
  }

  deleteRestaurant(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/restaurants/${id}`, { headers: this.getHeaders() });
  }
}