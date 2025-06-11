import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-categoria',
  standalone: true,
  templateUrl: './edit-categoria.component.html',
  styleUrls: ['./edit-categoria.component.css'],
  imports: [CommonModule, FormsModule]
})
export class EditCategoriaComponent implements OnInit {
  categoria: any = {
    nombre: '',
    descripcion: '',
    icono: ''
  };
  newIcono: File | null = null;
  newIconoPreview: string | ArrayBuffer | null = null;
  deleteIcono = false;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const id = this.route.snapshot.paramMap.get('id');
      this.loadCategoria(id);
    }
  }

  getIconoUrl(iconoPath: string): string {
    return `${environment.apiUrl}storage/categorias/${iconoPath}`;
  }

  loadCategoria(id: string | null): void {
    if (!id) {
      this.errorMessage = 'ID de categoría no válido';
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(`${environment.apiUrl}api/categorias/${id}`, { headers })
      .subscribe({
        next: (data: any) => {
          this.categoria = data;
          if (this.categoria.icono && this.categoria.icono.includes('/')) {
            this.categoria.icono = this.categoria.icono.split('/').pop();
          }
        },
        error: (err) => {
          console.error('Error al cargar categoría', err);
          this.errorMessage = 'Error al cargar la categoría';
          setTimeout(() => this.router.navigate(['/categorias']), 2000);
        }
      });
  }

  onFileSelected(event: any): void {
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

      this.newIcono = file;
      this.deleteIcono = false;
      
      // Mostrar vista previa
      const reader = new FileReader();
      reader.onload = () => {
        this.newIconoPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveCategoria(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Validaciones básicas
    if (!this.categoria.nombre?.trim()) {
        this.errorMessage = 'El nombre es obligatorio';
        return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const token = localStorage.getItem('token');
    if (!token) {
        this.errorMessage = 'Debe iniciar sesión para realizar esta acción';
        this.isLoading = false;
        return;
    }

    const formData = new FormData();
    
    // Agregar campos básicos
    formData.append('_method', 'PUT');
    formData.append('nombre', this.categoria.nombre);
    formData.append('descripcion', this.categoria.descripcion || '');
    
    // Manejo de imágenes
    if (this.newIcono) {
        formData.append('icono', this.newIcono, this.newIcono.name);
    }
    
    if (this.deleteIcono) {
        formData.append('borrar_icono', this.deleteIcono.toString()); 
    }

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    });

    console.log('Enviando FormData con:', {
        nombre: this.categoria.nombre,
        descripcion: this.categoria.descripcion,
        tieneNuevoIcono: !!this.newIcono,
        borrarIcono: this.deleteIcono
    });

    this.http.post(`${environment.apiUrl}api/categorias/${this.categoria.id}`, formData, { headers })
        .subscribe({
            next: (response: any) => {
                console.log('Respuesta del servidor:', response);
                this.successMessage = 'Categoría actualizada correctamente';
                setTimeout(() => this.router.navigate(['/list-category']), 1500);
            },
            error: (err) => {
                this.isLoading = false;
                console.error('Error completo:', err);
                
                if (err.status === 422) {
                    if (err.error?.errors) {
                        let errorMessages: string[] = [];
                        Object.values(err.error.errors).forEach((errors: any) => {
                            errorMessages = errorMessages.concat(errors);
                        });
                        this.errorMessage = errorMessages.join('\n');
                    } else {
                        this.errorMessage = 'Error de validación en los datos enviados';
                    }
                } else {
                    this.errorMessage = 'Error al actualizar la categoría: ' + 
                        (err.message || 'Error desconocido');
                }
            }
        });
}

  cancel(): void {
    this.router.navigate(['/list-category']);
  }
}