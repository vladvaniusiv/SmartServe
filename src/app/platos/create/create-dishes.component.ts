import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment.development';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-create-dishes',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './create-dishes.component.html',
  styleUrls: ['./create-dishes.component.css']
})
export class CreateDishesComponent {
  dish = {
    nombre: '',
    descripcion: '',
    precio: 0,
    categoria_id: '',
    tiempo_preparacion: null as number | null,
    calorias: null as number | null,
    ingredientes: '',
    alergenos: '',
    disponible: true,
    destacado: false,
    tipo_servicio: ['en mesa'],
    maridaje_recomendado: '',
    video_preparacion: '',
    stock: null as number | null
  };

  categorias: any[] = [];
  imagen: File | null = null;
  successMessage = '';
  errorMessage = '';
  maxFileSize = 100 * 1024 * 1024;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.getCategorias();
  }

  video: File | null = null;

  onVideoSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.size > this.maxFileSize) {
      this.errorMessage = 'El video supera el tamaño máximo de 100MB.';
      this.video = null;
      return;
    }
    this.video = file;
    this.errorMessage = '';
  }

  getCategorias() {
    if (typeof window !== 'undefined') {

    const token = localStorage.getItem('token');
    
    const headers = new HttpHeaders(token ? {
      'Authorization': `Bearer ${token}`
    } : {});
  
  
    this.http.get<any[]>(environment.apiUrl + 'api/categorias', { headers }).subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => {
        console.error('Error al cargar categorías', err);
        if (err.status === 401) {
          this.errorMessage = 'Debes iniciar sesión para acceder a las categorías';
        }
      }
    });
  }
}

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.size > this.maxFileSize) {
      this.errorMessage = 'La imagen supera el tamaño máximo de 100MB.';
      this.imagen = null;
      return;
    }
    this.imagen = file;
    this.errorMessage = '';
  }

  toggleServicio(servicio: string) {
    const index = this.dish.tipo_servicio.indexOf(servicio);
    if (index === -1) {
      this.dish.tipo_servicio.push(servicio);
    } else {
      this.dish.tipo_servicio.splice(index, 1);
    }
  }

  submitDish() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        this.errorMessage = 'Debes iniciar sesión para crear platos';
        setTimeout(() => this.errorMessage = '', 3000);
        return;
      }
  
      // Validaciones
      const errores: string[] = [];
      if (!this.dish.nombre.trim()) errores.push('El nombre es obligatorio.');
      if (!this.dish.precio || this.dish.precio <= 0) errores.push('El precio debe ser mayor a 0.');
      if (!this.dish.categoria_id) errores.push('La categoría es obligatoria.');
      if (!this.dish.tipo_servicio.length) errores.push('Debe seleccionar al menos un tipo de servicio.');
      
      if (errores.length > 0) {
        alert('Errores:\n' + errores.join('\n'));
        return;
      }
  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      });
  
      const formData = new FormData();
  
      // Convertir campos a arrays
      const ingredientes = this.dish.ingredientes 
        ? this.dish.ingredientes.split(',').map(i => i.trim()).filter(i => i)
        : [];
      
      const alergenos = this.dish.alergenos
        ? this.dish.alergenos.split(',').map(a => a.trim()).filter(a => a)
        : [];
  
      // Agregar campos básicos
      formData.append('nombre', this.dish.nombre);
      formData.append('descripcion', this.dish.descripcion || '');
      formData.append('precio', this.dish.precio.toString());
      formData.append('categoria_id', this.dish.categoria_id);
      
      // Agregar campos opcionales si tienen valor
      if (this.dish.tiempo_preparacion !== null) {
        formData.append('tiempo_preparacion', this.dish.tiempo_preparacion.toString());
      }
      
      if (this.dish.calorias !== null) {
        formData.append('calorias', this.dish.calorias.toString());
      }
  
      // Agregar arrays como múltiples entradas (FormData)
      ingredientes.forEach((ingrediente, index) => {
        formData.append(`ingredientes[${index}]`, ingrediente);
      });
  
      alergenos.forEach((alergeno, index) => {
        formData.append(`alergenos[${index}]`, alergeno);
      });
  
      this.dish.tipo_servicio.forEach((servicio, index) => {
        formData.append(`tipo_servicio[${index}]`, servicio);
      });
  
      formData.append('disponible', this.dish.disponible ? '1' : '0');
      formData.append('destacado', this.dish.destacado ? '1' : '0');
      formData.append('maridaje_recomendado', this.dish.maridaje_recomendado || '');
      
      if (this.dish.stock !== null) {
        formData.append('stock', this.dish.stock.toString());
      }
  
      // Archivos
      if (this.imagen) {
        formData.append('imagen', this.imagen);
      }
      
      if (this.video) {
        formData.append('video_preparacion', this.video);
      }
  
      formData.forEach((value, key) => {
        console.log(key, value);
      });
  
      this.http.post(environment.apiUrl + 'api/platos', formData, { headers }).subscribe({
        next: () => {
          this.successMessage = 'Plato creado con éxito';
          this.errorMessage = '';
          this.resetForm();
          setTimeout(() => this.router.navigate(['/list-platos']), 1500);
        },
        error: (err) => {
          console.error('Error completo:', err);
          if (err.status === 0) {
            this.errorMessage = 'Error de conexión. Verifica tu red o que el servidor esté funcionando.';
          } else if (err.status === 413) {
            this.errorMessage = 'El archivo es demasiado grande (máximo 100MB)';
          } else if (err.error?.errors) {
            this.errorMessage = Object.values(err.error.errors).flat().join('\n');
          } else {
            this.errorMessage = err.error?.message || 'Error al crear el plato';
          }
        }
      });
    }
  }

  resetForm() {
    this.dish = {
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
      stock: null
    };
    this.imagen = null;
  }
}