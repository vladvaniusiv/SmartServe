import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { MenuSectionComponent } from '../section/menu-section.component';
import { TruncatePipe } from "../../pipes/truncate.pipe";

@Component({
  selector: 'app-create-menu',
  imports: [CommonModule, FormsModule, MenuSectionComponent, TruncatePipe],
  templateUrl: './create-menu.component.html',
  styleUrl: './create-menu.component.css',
  standalone: true,
})
export class CreateMenuComponent implements OnInit {
  isAdmin = false;
  menuCreated = false;
  newMenuName = '';
  nameError = '';
  user = {
    company_name: ''
  };
  config = {
    description: '',
    logo: null as File | string | null,
    location: 'Calle Falsa 123, Ciudad',
    wifiPassword: 'restaurante2025',
    socialLinks: [
      { name: 'Instagram', url: 'https://instagram.com', icon: null as File | string | null, iconPreview: null as string | ArrayBuffer | null },
      { name: 'Facebook', url: 'https://facebook.com', icon: null as File | string | null, iconPreview: null as string | ArrayBuffer | null },
      { name: 'TikTok', url: 'https://tiktok.com', icon: null as File | string | null, iconPreview: null as string | ArrayBuffer | null },
      { name: 'YouTube', url: 'https://youtube.com', icon: null as File | string | null, iconPreview: null as string | ArrayBuffer | null },
    ] as Array<{ name: string; url: string; icon?: File | string | null; iconPreview?: string | ArrayBuffer | null }>,
    visibleSections: {
      menu: true,
      carta: true,
      vino: true,
      aperitivo: true
    }
  };

  tableCount = 1;
  dishSearchTerm = '';
  selectedCategory = '';
  allDishes: any[] = [];
  filteredDishes: any[] = [];
  categorias: any[] = [];
  selectedSection = 'menu';
  showDishSelector = {
    menu: false,
    vino: false,
    aperitivo: false
  };
  currentMenuId: number | null = null;
  previewVisible = false;
  menuSections: any = {
    menu: [],
    carta: [],
    vino: [],
    aperitivo: []
  };
  configurationSaved = false;
  logoPreview:string | ArrayBuffer | null = null;
  isLoading=false;
  currentSection = 'menu';

  constructor(
    private router: Router, 
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        this.router.navigate(['/login']);
        return;
      }

      this.userService.getUser().subscribe(user => {
        if (user) {
          this.user = user;
          this.isAdmin = user.role === 'admin';
        } else {
          this.router.navigate(['/login']);
        }
      });

    this.loadCategorias();
  }}

  getSectionDishes(section: string): any[] {
    return this.menuSections[section] || [];
  }

  onSectionChanged(newSection: string) {
    this.currentSection = newSection;
  }

  get apiUrl(): string {
    return environment.apiUrl;
  }

  getPlatosBySection(section: string): any[] {
    return this.menuSections[section] || [];
  }

  hasPlatosInSection(section: string): boolean {
    return this.menuSections[section]?.length > 0;
  }

  async removeDishFromMenu(dishId: number, section: string) {
    if (!confirm('¿Estás seguro de quitar este plato?')) return;
    
    if (!this.currentMenuId) {
      alert('Primero debes crear el menú');
      return;
    }

    try {
      await this.http.delete(
        `${environment.apiUrl}api/menus/${this.currentMenuId}/remove-plato/${dishId}`,
        {
          headers: this.getAuthHeaders().headers,
          body: { section }
        }
      ).toPromise();

      // Actualizar localmente
      this.menuSections[section] = this.menuSections[section].filter((p: any) => p.id !== dishId);
      alert('Plato removido correctamente');
    } catch (err) {
      console.error('Error removing dish:', err);
      alert('Error al remover el plato');
    }
  }

  saveConfiguration() {
    if (!this.currentMenuId) {
      alert('Primero debes crear el menú');
      return;
    }
  
    const formData = new FormData();
    
    this.config.socialLinks.forEach((social, index) => {
      formData.append(`socialLinks[${index}][name]`, social.name);
      formData.append(`socialLinks[${index}][url]`, social.url);
      
      if (social.icon instanceof File) {
        formData.append(`socialLinks[${index}][icon]`, social.icon, social.icon.name);
      } else if (typeof social.icon === 'string') {
        formData.append(`socialLinks[${index}][icon]`, social.icon);
      }
    });
    
    const configData = {
      description: this.config.description,
      location: this.config.location,
      wifiPassword: this.config.wifiPassword,
      socialLinks: this.config.socialLinks.map(social => ({
        name: social.name,
        url: social.url,
        icon: social.icon instanceof File ? undefined : social.icon
      })),
      visibleSections: this.config.visibleSections
    };
    
    formData.append('config', JSON.stringify(configData));
    formData.append('company_name', this.user.company_name);
  
    if (this.config.logo instanceof File) {
      formData.append('logo', this.config.logo, this.config.logo.name);
    }
  
    this.http.post(
      `${environment.apiUrl}api/menus/${this.currentMenuId}/update-config`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    ).subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor:', response);
        this.configurationSaved = true;
        alert('Configuración guardada correctamente');
        
        // Actualizar la configuración local con las rutas de los íconos
        if (response.menu?.config?.socialLinks) {
          this.config.socialLinks = this.config.socialLinks.map((link, index) => ({
            ...link,
            icon: response.menu.config.socialLinks[index]?.icon || link.icon,
            iconPreview: response.menu.config.socialLinks[index]?.icon 
              ? `${environment.apiUrl}storage/menus/social_icons/${response.menu.config.socialLinks[index].icon}`
              : link.iconPreview
          }));
        }
      },
      error: (err) => {
        console.error('Error completo:', err);
        if (err.status === 422) {
          const errorMsg = Object.values(err.error.errors).flat().join('\n');
          alert(`Error de validación:\n${errorMsg}`);
        } else {
          alert('Error al guardar la configuración: ' + 
                (err.error?.message || 'Error del servidor'));
        }
      }
    });
  }


  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        this.nameError = 'Formato de archivo no válido. Use JPEG, PNG, JPG, GIF o SVG.';
        return;
      }

      // Validar tamaño (2MB máximo)
      if (file.size > 2 * 1024 * 1024) {
        this.nameError = 'El archivo es demasiado grande. Tamaño máximo: 2MB';
        return;
      }

      this.config.logo = file;
      this.nameError = '';
      
      // Mostrar vista previa
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  addSocialLink() {
    this.config.socialLinks.push({ name: '', url: '' });
  }
  
  removeSocialLink(index: number) {
    this.config.socialLinks.splice(index, 1);
  }

  getLogoPreviewUrl(): string {
    if (this.logoPreview) {
      return this.logoPreview.toString();
    }
    if (typeof this.config.logo === 'string' && this.config.logo) {
      return this.config.logo.startsWith('http') 
        ? this.config.logo 
        : `${environment.apiUrl}storage/${this.config.logo}`;
    }
    return '';
  }

  togglePreview() {
    this.previewVisible = !this.previewVisible;
  }

  filterDishes() {
    this.filteredDishes = this.allDishes.filter(dish => {
      const matchName = this.dishSearchTerm === '' || dish.nombre.toLowerCase().includes(this.dishSearchTerm.toLowerCase());
      const matchCategory = this.selectedCategory === '' || dish.categoria_id == this.selectedCategory;
      return matchName && matchCategory;
    });
  }

  addSelectedDishesToMenu() {
    if (!this.currentMenuId || isNaN(this.currentMenuId)) {
      console.error('ID de menú inválido:', this.currentMenuId);
      alert('Error: No se ha seleccionado un menú válido');
      return;
    }

    const selected = this.filteredDishes.filter(d => d.selected).map(d => d.id);
    
    if (selected.length === 0) {
      alert('Por favor selecciona al menos un plato');
      return;
    }

    // Crear array de relaciones igual que en edit-menu
    const relationsToCreate = [{
      section: this.selectedSection,
      dish_ids: selected
    }];

    // Si no es carta, agregar relación adicional
    if (this.selectedSection !== 'carta') {
      relationsToCreate.push({
        section: 'carta',
        dish_ids: selected
      });
    }

    this.http.post(
      `${environment.apiUrl}api/menus/${this.currentMenuId}/add-platos`, 
      { relations: relationsToCreate }, // Enviar mismo formato que en edición
      this.getAuthHeaders()
    ).subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor:', response);
        this.updateMenuSections(response.platos);

        this.loadMenu(); // Forzar recarga de datos
        
        alert('Platos agregados correctamente');
        this.closeDishSelector(this.selectedSection);
        this.filteredDishes.forEach(d => d.selected = false);
      },
      error: (err) => {
        console.error('Error al agregar platos:', err);
        if (err.status === 401) {
          alert('Sesión expirada. Por favor, inicia sesión nuevamente');
          this.router.navigate(['/login']);
        } else if (err.status === 404) {
          alert('Menú no encontrado. Por favor, recarga la página e intenta nuevamente.');
        } else {
          alert('Error al agregar platos: ' + (err.error?.message || 'Error del servidor'));
        }
      }
    });
  }

  loadMenu() {
    if (!this.currentMenuId) return;

    const token = localStorage.getItem('token');
    this.http.get<any>(`${environment.apiUrl}api/menus/${this.currentMenuId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.updateMenuSections(data.platos);
      },
      error: (err) => {
        console.error('Error al cargar menú:', err);
        if (err.status === 401) this.router.navigate(['/login']);
      }
    });
  }

  private updateMenuSections(platos: any[]) {
    this.menuSections = {
      menu: [],
      carta: [],
      vino: [],
      aperitivo: []
    };

    if (!platos) return;

    platos.forEach(plato => {
      const sections = plato.pivot ? 
        (Array.isArray(plato.pivot) ? 
          plato.pivot.map((p: any) => p.section) : 
          [plato.pivot.section]) : 
        ['carta'];

      plato.ingredientes = this.formatToArray(plato.ingredientes);
      plato.alergenos = this.formatToArray(plato.alergenos);
      plato.tipo_servicio = Array.isArray(plato.tipo_servicio) ? plato.tipo_servicio : 
        (plato.tipo_servicio ? plato.tipo_servicio.split(',') : []);

      sections.forEach((section: string) => {
        if (this.menuSections[section] && 
            !this.menuSections[section].some((p: any) => p.id === plato.id)) {
          this.menuSections[section].push(plato);
        }
      });
    });
  }

  private formatToArray(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map(item => item.trim());
    return [];
  }

  openDishSelector(section: string) {
    this.selectedSection = section;
    // Mostrar solo el selector para la sección específica
    this.showDishSelector = { menu: false, vino: false, aperitivo: false };
    this.showDishSelector[section as keyof typeof this.showDishSelector] = true;    
    this.loadAllDishes();
  }

  closeDishSelector(section: string) {
    this.showDishSelector[section as keyof typeof this.showDishSelector] = false;
  }

  getCategoryName(id: number): string {
    const cat = this.categorias.find(c => c.id === id);
    return cat ? cat.nombre : 'Sin categoría';
  }

  loadAllDishes() {
    this.http.get<any[]>(environment.apiUrl + 'api/platos').subscribe({
      next: (data) => {
        this.allDishes = data.map(d => ({ 
          ...d, 
          selected: false,
          ingredientes: Array.isArray(d.ingredientes) ? d.ingredientes : 
                       (d.ingredientes ? d.ingredientes.split(',') : []),
          alergenos: Array.isArray(d.alergenos) ? d.alergenos : 
                    (d.alergenos ? d.alergenos.split(',') : []),
          tipo_servicio: Array.isArray(d.tipo_servicio) ? d.tipo_servicio : 
                        (d.tipo_servicio ? d.tipo_servicio.split(',') : [])
        }));
        this.filteredDishes = [...this.allDishes];
      },
      error: (err) => {
        console.error('Error al cargar platos:', err);
      }
    });
  }

  loadCategorias() {
    this.http.get<any[]>(`${environment.apiUrl}api/categorias`).subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => {
        console.error('Error al cargar las categorías', err);
      }
    });
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  createMenu() {
    if (!this.newMenuName.trim()) {
      this.nameError = 'El nombre del menú es requerido';
      return;
    }
  
    this.isLoading = true;
    this.nameError = '';
  
    const formData = new FormData();
    formData.append('nombre', this.newMenuName);
    formData.append('company_name', this.user.company_name);
    
    // Preparar la configuración completa con todos los campos requeridos
    const configData = {
      description: this.config.description || '',
      location: this.config.location || 'Calle Falsa 123, Ciudad',
      wifiPassword: this.config.wifiPassword || 'restaurante2025',
      socialLinks: this.config.socialLinks.map(social => ({
        name: social.name,
        url: social.url,
        // Solo incluir el nombre del archivo si no es un File
        icon: social.icon instanceof File ? undefined : social.icon
      })),
      visibleSections: this.config.visibleSections || {
        menu: true,
        carta: true,
        vino: true,
        aperitivo: true
      }
    };
  
    formData.append('config', JSON.stringify(configData));
    
    // Adjuntar el logo si es un archivo nuevo
    if (this.config.logo instanceof File) {
      formData.append('logo', this.config.logo, this.config.logo.name);
    }
  
    // Adjuntar iconos de redes sociales como archivos
    this.config.socialLinks.forEach((social, index) => {
      if (social.icon instanceof File) {
        formData.append(`socialLinks[${index}][icon]`, social.icon, social.icon.name);
      }
    });
  
    const token = localStorage.getItem('token');
    
    this.http.post(`${environment.apiUrl}api/menus`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.currentMenuId = response.menu.id;
        this.menuCreated = true;
        this.loadMenu();

        // Actualizar la configuración local con la respuesta del servidor
        if (response.menu?.config) {
          this.config = {
            ...this.config,
            ...response.menu.config,
            logo: response.menu.config.logo || this.config.logo,
            socialLinks: response.menu.config.socialLinks || this.config.socialLinks
          };
  
          // Actualizar las vistas previas de los iconos
          if (response.menu.config.socialLinks) {
            this.config.socialLinks = this.config.socialLinks.map((link, index) => ({
              ...link,
              icon: response.menu.config.socialLinks[index]?.icon || link.icon,
              iconPreview: response.menu.config.socialLinks[index]?.icon 
                ? `${environment.apiUrl}storage/menus/social_icons/${response.menu.config.socialLinks[index].icon}`
                : link.iconPreview
            }));
          }
        }
        
        this.loadCategorias();
        this.loadAllDishes();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error completo:', err);
        if (err.status === 422) {
          const errorMsg = Object.values(err.error.errors).flat().join('\n');
          this.nameError = `Error de validación:\n${errorMsg}`;
        } else if (err.status === 409) {
          this.nameError = err.error.message || 'Ya existe un menú con ese nombre';
        } else {
          this.nameError = 'Error al crear el menú. Intente nuevamente.';
        }
      }
    });
  }

  onSocialIconSelected(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
  
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        alert('Formato no válido para ícono de red social');
        return;
      }
  
      if (file.size > 2 * 1024 * 1024) {
        alert('Ícono demasiado grande. Máximo 2MB');
        return;
      }
  
      const reader = new FileReader();
      reader.onload = () => {
        this.config.socialLinks[index].icon = file;
        this.config.socialLinks[index].iconPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  exportarDatos() {
    if (!this.configurationSaved || this.currentMenuId === null) {
      alert("Debes guardar la configuración antes de exportar los datos.");
      return;
    }

    const exportUrl = `${this.apiUrl}menus/export/${this.currentMenuId}`;
    window.open(exportUrl, '_blank');
  }
}