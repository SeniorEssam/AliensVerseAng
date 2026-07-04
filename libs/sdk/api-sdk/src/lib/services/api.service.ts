import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseAPI } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  // Updated with the real backend URL provided by the user
  private readonly baseUrl = 'https://localhost:44391/api/v1';
  //private readonly baseUrl = 'https://aliensverses.runasp.net/api/v1';

  get<T>(path: string): Observable<ResponseAPI<T>> {
    return this.http.get<ResponseAPI<T>>(`${this.baseUrl}/${path}`, { withCredentials: true });
  }

  post<T>(path: string, body: any): Observable<ResponseAPI<T>> {
    return this.http.post<ResponseAPI<T>>(`${this.baseUrl}/${path}`, body, { withCredentials: true });
  }

  put<T>(path: string, body: any): Observable<ResponseAPI<T>> {
    return this.http.put<ResponseAPI<T>>(`${this.baseUrl}/${path}`, body, { withCredentials: true });
  }

  delete<T>(path: string): Observable<ResponseAPI<T>> {
    return this.http.delete<ResponseAPI<T>>(`${this.baseUrl}/${path}`, { withCredentials: true });
  }
}
