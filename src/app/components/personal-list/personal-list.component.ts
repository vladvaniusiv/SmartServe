import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-personal-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personal-list.component.html',
  styleUrls: ['./personal-list.component.css']
})
export class PersonalListComponent implements OnInit {
  personalList: any[] = [];
  isAdmin = false;
  user = {
    company_name: ''
  };
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!token || !user || user.role !== 'admin') return;

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.get<any[]>(environment.apiUrl+'api/personal', { headers }).subscribe({
        next: (data) => {
          this.personalList = data;
        },
        error: (err) => {
          console.error('Error al cargar el personal', err);
        }
      });
    }
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        this.router.navigate(['/login']);
        return;
      }

      this.userService.getUser().subscribe(user => {
        if (user) {
          this.user = user;
          this.isAdmin = user.role === 'admin';
        } else {
          this.router.navigate(['/login']);
        }
      });
  }
  }


  deleteUser(userId: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(environment.apiUrl + `api/personal/${userId}`, { headers }).subscribe({
      next: () => {
        // Actualizar la lista después de eliminar
        this.personalList = this.personalList.filter(user => user.id !== userId);
        alert('Usuario eliminado correctamente');
      },
      error: (err) => {
        console.error('Error al eliminar el usuario', err);
        alert('Error al eliminar el usuario');
      }
    });
  }
}