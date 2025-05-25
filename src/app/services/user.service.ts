import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

export interface User {
  name: string;
  email: string;
  phone_number: string;
  company_name: string;
  role: string;
  staff_count: number;
}


@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  private userSubject = new BehaviorSubject<User | null>(null);

  setUser(user: User) {
    this.userSubject.next(user);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getUser(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  loadUserFromLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.userSubject.next(JSON.parse(storedUser));
      }
    }
  }
}