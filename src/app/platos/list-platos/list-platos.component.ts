import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { FormsModule } from '@angular/forms';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-platos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TruncatePipe], 
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

  constructor(private router: Router,private http: HttpClient) {}

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

    const token = localStorage.getItem('token');
    
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
        this.errorMessage = err.error?.message || 'Error al eliminar el plato';
        setTimeout(() => this.errorMessage = '', 3000);
        
      }
    });
}

  updateDisponibilidad(plato: any): void {
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.errorMessage = 'Debes iniciar sesión para realizar esta acción';
      setTimeout(() => this.errorMessage = '', 3000);
      plato.disponible = !plato.disponible;
      return;
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
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
        plato.disponible = !plato.disponible; 
        
        if (err.status === 401) {
          this.errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
        } else {
          this.errorMessage = 'Error al actualizar disponibilidad';
        }
        
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

    goToCreateDishes(){
    this.router.navigate(['/create-dishes']);
  }

  goToCreateCategory(){
    this.router.navigate(['/create-category']);
  }
}