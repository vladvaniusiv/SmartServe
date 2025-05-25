import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // Añade RouterModule
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-list-menu',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './list-menu.component.html',
  styleUrl: './list-menu.component.css'
})
export class ListMenuComponent implements OnInit {
  menus: any[] = [];
  filteredMenus: any[] = [];
  searchTerm = '';
  successMessage = '';
  errorMessage = '';
  user: any = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userString = localStorage.getItem('user');
      if (userString) {
        this.user = JSON.parse(userString);
      }
  
      this.loadMenus();
    }
  }

  loadMenus() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.http.get<any[]>(`${environment.apiUrl}api/menus`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: (data) => {
        this.menus = data;
        this.filteredMenus = [...this.menus];
      },
      error: (err) => {
        console.error('Error al cargar menús:', err);
        if (err.status === 401) {
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = 'Error al cargar los menús. Intente nuevamente.';
        }
      }
    });
  }

  filterMenus() {
    this.filteredMenus = this.menus.filter(menu => 
      menu.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  deleteMenu(id: number) {
    if (!confirm('¿Estás seguro de que deseas eliminar este menú?')) {
      return;
    }

    const token = localStorage.getItem('token');
    this.http.delete(`${environment.apiUrl}api/menus/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: () => {
        this.successMessage = 'Menú eliminado correctamente';
        this.loadMenus();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('Error al eliminar menú:', err);
        this.errorMessage = 'Error al eliminar el menú. Intente nuevamente.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
}