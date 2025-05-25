import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { FormsModule } from '@angular/forms';
import { TruncatePipe } from '../../pipes/truncate.pipe'; // Importa el pipe

@Component({
  selector: 'app-list-platos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TruncatePipe], // Añade TruncatePipe
  templateUrl: './list-platos.component.html',
  styleUrls: ['./list-platos.component.css']
})
export class ListPlatosComponent implements OnInit {
  platos: any[] = [];
  categorias: any[] = [];
  filteredPlatos: any[] = [];
  searchTerm: string = '';
  categoriaFilter: string = '';
  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getPlatos();
    this.getCategorias();
  }

  getPlatos(): void {
    this.http.get<any[]>(environment.apiUrl + 'api/platos').subscribe({
      next: (data) => {
        this.platos = data;
        this.filteredPlatos = [...this.platos];
      },
      error: (err) => {
        console.error('Error al cargar platos', err);
        this.errorMessage = 'Error al cargar los platos';
      }
    });
  }

  getCategorias(): void {
    this.http.get<any[]>(environment.apiUrl + 'api/categorias').subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => {
        console.error('Error al cargar categorías', err);
      }
    });
  }

  // Método para obtener el nombre de la categoría
  getCategoriaNombre(categoriaId: number): string {
    const categoria = this.categorias.find(c => c.id == categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  }

  filterPlatos(): void {
    this.filteredPlatos = this.platos.filter(plato => {
      const matchesSearch = plato.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                          plato.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.categoriaFilter || plato.categoria_id == this.categoriaFilter;
      return matchesSearch && matchesCategory;
    });
  }

  deletePlato(platoId: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este plato?')) {
      return;
    }

    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    
    // Configurar los headers con el token de autenticación
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.delete(environment.apiUrl + 'api/platos/' + platoId, { headers }).subscribe({
      next: () => {
        this.platos = this.platos.filter(p => p.id !== platoId);
        this.filterPlatos();
        this.successMessage = 'Plato eliminado correctamente';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('Error al eliminar plato', err);
        // Mostrar mensaje de error más específico
        this.errorMessage = err.error?.message || 'Error al eliminar el plato';
        setTimeout(() => this.errorMessage = '', 3000);
        
      }
    });
}

  updateDisponibilidad(plato: any): void {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    
    // Verificar si hay token (usuario autenticado)
    if (!token) {
      this.errorMessage = 'Debes iniciar sesión para realizar esta acción';
      setTimeout(() => this.errorMessage = '', 3000);
      plato.disponible = !plato.disponible; // Revertir el cambio
      return;
    }
  
    // Configurar headers con el token de autenticación
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    // Realizar la petición PUT con los headers
    this.http.put(
      `${environment.apiUrl}api/platos/${plato.id}`, 
      { disponible: plato.disponible },
      { headers }
    ).subscribe({
      next: () => {
        this.successMessage = 'Disponibilidad actualizada';
        setTimeout(() => this.successMessage = '', 2000);
      },
      error: (err) => {
        console.error('Error al actualizar disponibilidad', err);
        plato.disponible = !plato.disponible; // Revertir el cambio
        
        if (err.status === 401) {
          this.errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
        } else {
          this.errorMessage = 'Error al actualizar disponibilidad';
        }
        
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
}