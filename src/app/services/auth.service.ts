import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object

  ) {}

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post(environment.apiUrl+'api/register', userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl+'api/login', credentials);
  }

  createUser(user: any): Observable<any> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : '';
    return this.http.post<any>(environment.apiUrl + 'api/create-user', user, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }
  getUserData(): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) return of(null);
  
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No se encontró el token en localStorage');
      return throwError(() => new Error('Token no disponible'));
    }
  
    return this.http.get<any>(`${environment.apiUrl}api/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }

  // 🔹 Nuevo método para actualizar los datos del usuario
  updateUserData(userData: any): Observable<any> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : '';
    return this.http.put<any>(environment.apiUrl + 'api/update-user', userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }
  updateEmployeeCompanyName(data: any): Observable<any> {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : '';
    return this.http.put<any>(environment.apiUrl + 'api/update-employee-company-name', data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }
}