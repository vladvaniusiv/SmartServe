import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-edit-plato',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-plato.component.html',
  styleUrls: ['./edit-plato.component.css']
})
export class EditPlatoComponent implements OnInit {
  dish: any = {
    nombre: '',
    descripcion: '',
    precio: 0,
    categoria_id: '',
    tiempo_preparacion: null,
    calorias: null,
    ingredientes: '',
    alergenos: '',
    disponible: true,
    destacado: false,
    tipo_servicio: ['en mesa'],
    maridaje_recomendado: '',
    video_preparacion: '',
    stock: null,
    imagen_actual: ''
  };

  categorias: any[] = [];
  nuevaImagen: File | null = null;
  nuevoVideo: File | null = null;
  successMessage = '';
  errorMessage = '';
  platoId: string | null = null;
  apiUrl = environment.apiUrl;
  isLoading = false;
  eliminarImagen = false;
  eliminarVideo = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.platoId = this.route.snapshot.paramMap.get('id');
      this.getCategorias();
      this.loadPlato();
    }
  }

  loadPlato(): void {
    if (!isPlatformBrowser(this.platformId) || !this.platoId) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders(token ? {
      'Authorization': `Bearer ${token}`
    } : {});

    this.http.get(`${this.apiUrl}api/platos/${this.platoId}`, { headers }).subscribe({
      next: (data: any) => {
        // Parse tipo_servicio si viene como string
        let tipoServicio = data.tipo_servicio;
        if (typeof tipoServicio === 'string') {
          try {
            tipoServicio = JSON.parse(tipoServicio);
          } catch (e) {
            tipoServicio = [];
          }
        }
        
        this.dish = {
          ...data,
          ingredientes: Array.isArray(data.ingredientes) ? data.ingredientes.join(', ') : (data.ingredientes || ''),
          alergenos: Array.isArray(data.alergenos) ? data.alergenos.join(', ') : (data.alergenos || ''),
          tipo_servicio: Array.isArray(tipoServicio) ? tipoServicio : [],
          imagen_actual: data.imagen || ''
        };
      },
      error: (err) => {
        console.error('Error al cargar plato', err);
        this.errorMessage = 'Error al cargar el plato';
      }
    });
}

  getCategorias(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders(token ? {
      'Authorization': `Bearer ${token}`
    } : {});

    this.http.get<any[]>(`${this.apiUrl}api/categorias`, { headers }).subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => {
        console.error('Error al cargar categorías', err);
        this.errorMessage = 'Error al cargar las categorías';
      }
    });
  }

  getVideoUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('storage/')) {
      return `${this.apiUrl}${path}`;
    }
    return `${this.apiUrl}storage/${path}`;
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('storage/')) {
      return `${this.apiUrl}${path}`;
    }
    return `${this.apiUrl}storage/${path}`;
  }

  onImageSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.nuevaImagen = event.target.files[0];
    }
  }

  onVideoSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.nuevoVideo = event.target.files[0];
    }
  }

  toggleServicio(servicio: string): void {
    const index = this.dish.tipo_servicio.indexOf(servicio);
    if (index === -1) {
      this.dish.tipo_servicio.push(servicio);
    } else {
      this.dish.tipo_servicio.splice(index, 1);
    }
  }

  submitDish(): void {
    if (!this.platoId) return;

    const errores: string[] = [];
    if (!this.dish.nombre.trim()) errores.push('El nombre es obligatorio.');
    if (!this.dish.precio || this.dish.precio <= 0) errores.push('El precio debe ser mayor a 0.');
    if (!this.dish.categoria_id) errores.push('La categoría es obligatoria.');
    if (!this.dish.tipo_servicio.length) errores.push('Debe seleccionar al menos un tipo de servicio.');

    if (errores.length > 0) {
      this.errorMessage = errores.join('\n');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Debes iniciar sesión para realizar esta acción';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('_method', 'PUT');

    // Agregar campos básicos
    formData.append('nombre', this.dish.nombre);
    formData.append('descripcion', this.dish.descripcion || '');
    formData.append('precio', this.dish.precio.toString());
    formData.append('categoria_id', this.dish.categoria_id);
    formData.append('disponible', this.dish.disponible ? '1' : '0');
    formData.append('destacado', this.dish.destacado ? '1' : '0');

    // Campos opcionales
    if (this.dish.tiempo_preparacion) {
      formData.append('tiempo_preparacion', this.dish.tiempo_preparacion.toString());
    }
    if (this.dish.calorias) {
      formData.append('calorias', this.dish.calorias.toString());
    }
    if (this.dish.maridaje_recomendado) {
      formData.append('maridaje_recomendado', this.dish.maridaje_recomendado);
    }
    if (this.nuevoVideo) {
      formData.append('video_preparacion', this.nuevoVideo);
    }
    if (this.dish.stock) {
      formData.append('stock', this.dish.stock.toString());
    }

    // Tipo de servicio como array
    this.dish.tipo_servicio.forEach((servicio: string, index: number) => {
      formData.append(`tipo_servicio[${index}]`, servicio);
    });

    // Ingredientes como array
    this.dish.ingredientes
      .split(',')
      .map((i: string) => i.trim())
      .filter((i: string) => i.length > 0)
      .forEach((ingrediente: string, index: number) => {
        formData.append(`ingredientes[${index}]`, ingrediente);
      });

    // Alérgenos como array
    this.dish.alergenos
      .split(',')
      .map((a: string) => a.trim())
      .filter((a: string) => a.length > 0)
      .forEach((alergeno: string, index: number) => {
        formData.append(`alergenos[${index}]`, alergeno);
      });

    // Nueva imagen (si se seleccionó)
    if (this.nuevaImagen) {
      formData.append('imagen', this.nuevaImagen);
    }

    if (this.eliminarImagen) {
      formData.append('eliminar_imagen', '1');
    }
    
    if (this.eliminarVideo) {
      formData.append('eliminar_video', '1');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });

    this.http.post(`${this.apiUrl}api/platos/${this.platoId}`, formData, { headers }).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.successMessage = 'Plato actualizado con éxito';
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/list-platos']), 1500);
      },
      error: (err) => {
        console.error('Error al actualizar plato:', err);
        this.isLoading = false;
        
        if (err.error?.errors) {
          const erroresServidor = Object.values(err.error.errors).flat();
          this.errorMessage = erroresServidor.join('\n');
        } else if (err.message) {
          this.errorMessage = err.message;
        } else {
          this.errorMessage = 'Error desconocido al actualizar el plato';
        }
      }
    });
  }
}