import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-categoria',
  standalone: true,
  templateUrl: './list-categoria.component.html',
  styleUrls: ['./list-categoria.component.css'],
  imports: [CommonModule]
})
export class ListCategoriaComponent implements OnInit {
  categorias: any[] = [];
  successMessage = '';
  errorMessage = '';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,

  ) {}

  ngOnInit(): void {
    this.loadCategorias();
  }

  // Función para obtener la URL completa del icono
  getIconoUrl(iconoPath: string): string {
    return `${environment.apiUrl}storage/categorias/${iconoPath}`;
  }

  loadCategorias(): void {
    if (isPlatformBrowser(this.platformId)) {

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.get<any[]>(`${environment.apiUrl}api/categorias`, { headers }).subscribe({
        next: (data) => {
          this.categorias = data;
        },
        error: (err) => {
          console.error('Error al cargar categorías', err);
          this.errorMessage = 'Error al cargar categorías';
        }
      });
    }
  }

  deleteCategoria(categoriaId: number): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`${environment.apiUrl}api/categorias/${categoriaId}`, { headers }).subscribe({
      next: () => {
        this.categorias = this.categorias.filter(c => c.id !== categoriaId);
        this.successMessage = 'Categoría eliminada correctamente';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('Error al eliminar categoría', err);
        if (err.error?.error === 'No se puede eliminar la categoría porque tiene platos asociados') {
          this.errorMessage = err.error.error;
        } else {
          this.errorMessage = 'Error al eliminar categoría';
        }
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  editCategoria(categoriaId: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.router.navigate(['/#/categorias/editar', categoriaId]);
  }
}