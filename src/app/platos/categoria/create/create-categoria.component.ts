import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-create-categoria',
  standalone: true,
  templateUrl: './create-categoria.component.html',
  styleUrls: ['./create-categoria.component.css'],
  imports: [CommonModule, FormsModule]
})
export class CreateCategoriaComponent {
  categoria = {
    nombre: '',
    descripcion: '',
    icono: null as File | null,
  };

  iconoPreview: string | ArrayBuffer | null = null;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(private http: HttpClient, private router: Router) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        this.errorMessage = 'Formato de archivo no válido. Use JPEG, PNG, JPG, GIF o SVG.';
        return;
      }

      // Validar tamaño (2MB máximo)
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage = 'El archivo es demasiado grande. Tamaño máximo: 2MB';
        return;
      }

      this.categoria.icono = file;
      
      // Mostrar vista previa
      const reader = new FileReader();
      reader.onload = () => {
        this.iconoPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  submitCategoria() {
      // Validaciones básicas
      if (!this.categoria.nombre.trim()) {
        this.errorMessage = 'El nombre es obligatorio';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Obtener el token del localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        this.errorMessage = 'Debe iniciar sesión para realizar esta acción';
        this.isLoading = false;
        return;
      }

      const formData = new FormData();
      formData.append('nombre', this.categoria.nombre);
      formData.append('descripcion', this.categoria.descripcion || '');
      
      if (this.categoria.icono instanceof File) {
        formData.append('icono', this.categoria.icono, this.categoria.icono.name);
    }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
      });

      this.http.post(`${environment.apiUrl}api/categorias`, formData, { headers }).subscribe({
        next: (res:any) => {
          this.successMessage = 'Categoría creada con éxito';
          this.isLoading = false;
          
          setTimeout(() => {
            this.router.navigate(['/list-category']);
          }, 1500);
        },
          error: (err) => {
            this.isLoading = false;
            console.error('Error completo:', err);
            
            if (err.status === 422) {
                if (err.error.errors) {
                    const errors = Object.values(err.error.errors).flat();
                    this.errorMessage = errors.join('\n');
                } else {
                    this.errorMessage = 'Datos inválidos enviados al servidor';
                }
            } else if (err.status === 401) {
                this.errorMessage = 'No autenticado. Por favor, inicie sesión nuevamente.';
            } else {
                this.errorMessage = 'Error al crear categoría: ' + err.message;
            }
        }
    });
  }
  cancelar() {
    this.router.navigate(['/list-category']);
  }
}