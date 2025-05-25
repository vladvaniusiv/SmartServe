import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-personal-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personal-list.component.html',
  styleUrls: ['./personal-list.component.css']
})
export class PersonalListComponent implements OnInit {
  personalList: any[] = [];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Solo ejecutar en el navegador
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