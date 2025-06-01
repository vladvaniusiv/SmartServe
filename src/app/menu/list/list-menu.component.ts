import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // Añade RouterModule
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as QRCode from 'qrcode';

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
        this.menus = data.map(menu => ({ ...menu, qrCount: 1 }));
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

  async generateQRCodes(menuId: number, mesaCount: number) {
    try {
      if (mesaCount < 1 || mesaCount > 20) {
        alert('Por favor, ingrese un número válido de mesas (1-20)');
        return;
      }

      const baseUrl = window.location.origin;
      
      for (let i = 1; i <= mesaCount; i++) {
        const mesaUrl = `${baseUrl}/#/menus/${menuId}/mesa/${i}`;
        const fileName = `menu-${menuId}-mesa-${i}.png`;
        
        // Generar el código QR
        const qrDataUrl = await QRCode.toDataURL(mesaUrl, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        // Descargar el QR
        this.downloadQR(qrDataUrl, fileName);
      }

      this.successMessage = `Se han generado ${mesaCount} códigos QR para este menú`;
      setTimeout(() => this.successMessage = '', 3000);
      
    } catch (error) {
      console.error('Error generando QR:', error);
      this.errorMessage = 'Error al generar los códigos QR';
      setTimeout(() => this.errorMessage = '', 3000);
    }
  }

  // Función auxiliar para descargar el QR
  private downloadQR(dataUrl: string, fileName: string) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  // 1. Primero eliminar el archivo JSON
  this.http.delete(`${environment.apiUrl}api/menus-json/${id}`, { headers }).subscribe({
    next: () => {
      // 2. Luego eliminar el menú del backend
      this.http.delete(`${environment.apiUrl}api/menus/${id}`, { headers }).subscribe({
        next: () => {
          this.successMessage = 'Menú y archivo JSON eliminados correctamente.';
          this.loadMenus();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          console.error('Error al eliminar el menú:', err);
          this.errorMessage = 'El archivo JSON se eliminó, pero hubo un error al eliminar el menú.';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    },
    error: (err) => {
      if (err.status === 404) {
        // Si el archivo JSON no existe, igual eliminar el menú
        this.http.delete(`${environment.apiUrl}api/menus/${id}`, { headers }).subscribe({
          next: () => {
            this.successMessage = 'Menú eliminado (el archivo JSON no existía).';
            this.loadMenus();
            setTimeout(() => this.successMessage = '', 3000);
          },
          error: (err) => {
            console.error('Error al eliminar el menú:', err);
            this.errorMessage = 'Error al eliminar el menú.';
            setTimeout(() => this.errorMessage = '', 3000);
          }
        });
      } else {
        console.error('Error al eliminar el archivo JSON:', err);
        this.errorMessage = 'Error al eliminar el archivo JSON.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    }
  });
}
}