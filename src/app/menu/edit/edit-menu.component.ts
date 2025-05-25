import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { MenuSectionComponent } from '../section/menu-section.component';

@Component({
  selector: 'app-edit-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,TruncatePipe,MenuSectionComponent],
  templateUrl: './edit-menu.component.html',
  styleUrl: './edit-menu.component.css'
})

export class EditMenuComponent implements OnInit {
  menu: any = {
    nombre: '',
    config: {
      theme: 'light',
      description: '',
      logo: null as File | string | null,
      location: 'Calle Falsa 123, Ciudad',
      wifiPassword: 'restaurante2025',
      socialLinks: [
        { name: 'Instagram', url: 'https://instagram.com', icon: null, iconPreview: null },
        { name: 'Facebook', url: 'https://facebook.com', icon: null, iconPreview: null },
        { name: 'TikTok', url: 'https://tiktok.com', icon: null, iconPreview: null },
        { name: 'YouTube', url: 'https://youtube.com', icon: null, iconPreview: null },
      ],
      visibleSections: {
        menu: true,
        carta: true,
        vino: true,
        aperitivo: true
      }
    },
    platos: []
  };
  configurationSaved = false;
  menuId: number | null = null;
  allDishes: any[] = [];
  filteredDishes: any[] = [];
  categorias: any[] = [];
  selectedSection = 'menu';
  showDishSelector = false;
  successMessage = '';
  errorMessage = '';
  previewVisible = false;
  dishSearchTerm = '';
  selectedCategory = '';
  logoPreviewUrl: string | null = null;
  deleteLogo = false;
  currentSection: string = 'menu';
  apiUrl = environment.apiUrl;

  // Para el preview
  menuSections: any = {
    menu: [],
    carta: [],
    vino: [],
    aperitivo: []
  };

  user = {
    company_name: ''
  };
  config = {
    theme: 'light',
    description: '',
    logo: null as File | string | null,
    location: 'Calle Falsa 123, Ciudad',
    wifiPassword: 'restaurante2025',
    socialLinks: [
      { name: 'Instagram', url: 'https://instagram.com' },
      { name: 'Facebook', url: 'https://facebook.com' },
      { name: 'TikTok', url: 'https://tiktok.com' },
      { name: 'YouTube', url: 'https://youtube.com' },
    ] as Array<{ name: string; url: string; icon?: File | string; iconPreview?: string | ArrayBuffer | null }>,
    visibleSections: {
      menu: true,
      carta: true,
      vino: true,
      aperitivo: true
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get sectionDishes() {
    return this.menuSections[this.currentSection] || [];
  }

  onSectionChanged(newSection: string) {
    this.currentSection = newSection;
  }

  changeTheme(newTheme: 'light' | 'dark') {
    this.menu.config.theme = newTheme;
    // Forzar la detección de cambios si es necesario
    setTimeout(() => {
      // Esto asegurará que Angular detecte el cambio
    });
  }

  get themeClass() {
    return this.menu.config.theme === 'dark' ? 'theme-dark' : 'theme-light';
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.route.params.subscribe(params => {
        this.menuId = +params['id'];
        this.loadMenu();
        this.loadAllDishes();
        this.loadCategorias();
      });
    }
  }

  loadMenu() {
    const token = localStorage.getItem('token');
    this.http.get<any>(`${environment.apiUrl}api/menus/${this.menuId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: (data) => {
        this.menu = data;
        this.user.company_name = data.company_name || '';
        this.deleteLogo = false; // Resetear el checkbox al cargar

        // Cargar el logo
        if (data.config?.logo) {
          this.menu.config.logo = data.config.logo;
          this.logoPreviewUrl = `${environment.apiUrl}storage/menus/logos/${data.config.logo}`;
        }
  
        // Cargar redes sociales correctamente
        if (data.config?.socialLinks) {
          this.menu.config.socialLinks = data.config.socialLinks.map((social: any) => ({
            name: social.name,
            url: social.url,
            icon: social.icon || null,
            iconPreview: social.icon 
              ? `${environment.apiUrl}storage/menus/social_icons/${social.icon}`
              : null
          }));
        } else {
          // Si no hay redes sociales en la configuración, usar las predeterminadas
          this.menu.config.socialLinks = [
            { name: 'Instagram', url: 'https://instagram.com', icon: null, iconPreview: null },
            { name: 'Facebook', url: 'https://facebook.com', icon: null, iconPreview: null },
            { name: 'TikTok', url: 'https://tiktok.com', icon: null, iconPreview: null },
            { name: 'YouTube', url: 'https://youtube.com', icon: null, iconPreview: null }
          ];
        }
  
        this.updateMenuSections(data.platos);
        // Establecer sección actual basada en las secciones visibles y con platos
        const visibleSections = this.menu.config.visibleSections;
        const sectionOrder = ['menu', 'carta', 'vino', 'aperitivo'];

        for (const section of sectionOrder) {
          if (visibleSections[section] && this.menuSections[section]?.length > 0) {
            this.currentSection = section;
            break;
          }
        }
      },
      error: (err) => {
        console.error('Error al cargar menú:', err);
        if (err.status === 401) {
          this.router.navigate(['/#/login']);
        } else {
          this.errorMessage = 'Error al cargar el menú. Intente nuevamente.';
        }
      }
    });
  }

  updateMenuSections(platos: any[]) {
  // Reiniciar las secciones
  this.menuSections = {
    menu: [],
    carta: [],
    vino: [],
    aperitivo: []
  };

  if (!platos) return;

  // Procesar todos los platos manteniendo sus relaciones originales
  platos.forEach(plato => {
    // Obtener todas las secciones a las que pertenece este plato
    const sections = plato.pivot ? 
      (Array.isArray(plato.pivot) ? 
        plato.pivot.map((p: any) => p.section) : 
        [plato.pivot.section]): 
      ['carta'];

    // Procesar datos del plato
    plato.ingredientes = this.formatToArray(plato.ingredientes);
    plato.alergenos = this.formatToArray(plato.alergenos);
    plato.tipo_servicio = Array.isArray(plato.tipo_servicio) ? plato.tipo_servicio : 
      (plato.tipo_servicio ? plato.tipo_servicio.split(',') : []);

    // Agregar el plato a cada sección correspondiente
    sections.forEach((section: string) => {
      if (this.menuSections[section]) {
        // Verificar que el plato no esté ya en esta sección
        if (!this.menuSections[section].some((p: any) => p.id === plato.id)) {
          this.menuSections[section].push(plato);
        }
      }
    });
  });
}
  
  private removeDuplicates(platos: any[]): any[] {
    const uniquePlatos: any[] = [];
    const platoIds = new Set<number>();
  
    platos.forEach(plato => {
      if (!platoIds.has(plato.id)) {
        platoIds.add(plato.id);
        uniquePlatos.push(plato);
      }
    });
  
    return uniquePlatos;
  }

  private formatToArray(value: any): string[] {
    if (!value) return [];
    
    if (Array.isArray(value)) {
      // Si ya es un array, limpiar los valores
      return value.map(item => String(item).trim()).filter(item => item !== '');
    }
    
    if (typeof value === 'string') {
      try {
        // Intentar parsear si es un string JSON
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map(item => String(item).trim()).filter(item => item !== '');
        }
      } catch (e) {
        // Si no es JSON válido, tratar como string separado por comas
        return value.split(',')
          .map(item => item.replace(/[\[\]"]+/g, '').trim())
          .filter(item => item !== '');
      }
    }
    
    return [];
  }


  loadAllDishes() {
    const token = localStorage.getItem('token');
    this.http.get<any[]>(`${environment.apiUrl}api/platos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: (data) => {
        this.allDishes = data.map(d => ({ 
          ...d, 
          selected: false,
          ingredientes: this.formatToArray(d.ingredientes),
          alergenos: this.formatToArray(d.alergenos),
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
    const token = localStorage.getItem('token');
    this.http.get<any[]>(`${environment.apiUrl}api/categorias`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
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
        this.errorMessage = 'Formato de archivo no válido. Use JPEG, PNG, JPG, GIF o SVG.';
        setTimeout(() => this.errorMessage = '', 3000);
        return;
      }
      
      // Validar tamaño (2MB máximo)
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage = 'El tamaño máximo permitido es 2MB';
        setTimeout(() => this.errorMessage = '', 3000);
        return;
      }
      
      this.menu.config.logo = file;
      this.errorMessage = '';
      this.getLogoPreviewUrl();

    }
  }

  addSocialLink() {
    this.menu.config.socialLinks.push({ name: '', url: '', icon: null, iconPreview: null });
  }
  
  removeSocialLink(index: number) {
    this.menu.config.socialLinks.splice(index, 1);
  }
  
  private logoBlobUrl: string | null = null;
  private currentLogo: File | string | null = null;
  getLogoPreviewUrl(): string {
    // Si está marcado para eliminar, no mostrar logo
    if (this.deleteLogo) {
      return '';
    }
  
    // Si el logo no ha cambiado, devolver la URL cacheada
    if (this.menu.config.logo === this.currentLogo && this.logoBlobUrl) {
      return this.logoBlobUrl;
    }
  
    // Liberar la URL anterior si existe
    if (this.logoBlobUrl) {
      URL.revokeObjectURL(this.logoBlobUrl);
      this.logoBlobUrl = null;
    }
  
    this.currentLogo = this.menu.config.logo;
  
    // Si es un archivo nuevo (File object)
    if (this.menu.config.logo instanceof File) {
      this.logoBlobUrl = URL.createObjectURL(this.menu.config.logo);
      return this.logoBlobUrl;
    }
    
    // Si es una cadena con la ruta del logo
    if (typeof this.menu.config.logo === 'string' && this.menu.config.logo) {
      if (this.menu.config.logo.startsWith('http')) {
        return this.menu.config.logo;
      }
      return `${environment.apiUrl}storage/menus/logos/${this.menu.config.logo}`;
    }
    
    return '';
  }

  ngOnDestroy() {
    if (this.logoBlobUrl) {
      URL.revokeObjectURL(this.logoBlobUrl);
    }
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

  getPlatosBySection(section: string): any[] {
    if (!this.menu.platos) return [];
    return this.menu.platos.filter((p: any) => p.pivot.section === section);
  }

  hasPlatosInSection(section: string): boolean {
    if (!this.menu.platos) return false;
    return this.menu.platos.filter((p: any) => p.pivot.section === section).length > 0;
  }

  getCategoryName(categoryId: number): string {
    const category = this.categorias.find(c => c.id === categoryId);
    return category ? category.nombre : 'Sin categoría';
  }

  updateMenu() {
    const token = localStorage.getItem('token');
    const formData = new FormData();
  
    // Agregar datos básicos del menú
    formData.append('nombre', this.menu.nombre);
    formData.append('company_name', this.user.company_name);
    
    // Si se marcó eliminar logo, agregar flag
    if (this.deleteLogo) {
      formData.append('delete_logo', 'true');
    }
  
    // Preparar la configuración con socialLinks
    const config = {
      ...this.menu.config,
      socialLinks: this.menu.config.socialLinks.map((link: any) => ({
        name: link.name,
        url: link.url,
        icon: link.icon instanceof File ? undefined : link.icon
      }))
    };
  
    // Si estamos eliminando el logo, limpiar la referencia
    if (this.deleteLogo) {
      config.logo = null;
      this.menu.config.logo = null;
      this.logoPreviewUrl = null;
    }
  
    formData.append('config', JSON.stringify(config));
    
    // Agregar logo si es un archivo nuevo y no estamos eliminando
    if (this.menu.config.logo instanceof File && !this.deleteLogo) {
      formData.append('logo', this.menu.config.logo, this.menu.config.logo.name);
    }
  
    // Agregar iconos de redes sociales si son archivos nuevos
    this.menu.config.socialLinks.forEach((link: any, index: number) => {
      if (link.icon instanceof File) {
        formData.append(`socialLinks[${index}][icon]`, link.icon, link.icon.name);
      }
    });
  
    this.http.post(
      `${environment.apiUrl}api/menus/${this.menuId}/update-config`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    ).subscribe({
      next: (response: any) => {
        this.successMessage = 'Menú actualizado correctamente';     
        this.configurationSaved = true;

        setTimeout(() => this.successMessage = '', 3000);
        
        // Actualizar la configuración local con la respuesta del servidor
        if (response.menu?.config) {
          this.menu.config = {
            ...this.menu.config,
            ...response.menu.config,
            logo: response.menu.config.logo || this.menu.config.logo,
            socialLinks: this.menu.config.socialLinks.map((link: any, index: number) => ({
              ...link,
              icon: response.menu.config.socialLinks[index]?.icon || link.icon,
              iconPreview: response.menu.config.socialLinks[index]?.icon 
                ? `${environment.apiUrl}storage/menus/social_icons/${response.menu.config.socialLinks[index].icon}`
                : link.iconPreview
            }))
          };
        }
      },
      error: (err) => {
        console.error('Error al actualizar menú:', err);
        this.configurationSaved = false;
        if (err.status === 422) {
          const errorMsg = Object.values(err.error.errors).flat().join('\n');
          this.errorMessage = `Error de validación:\n${errorMsg}`;
        } else {
          this.errorMessage = 'Error al actualizar el menú. Intente nuevamente.';
        }
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  onDeleteLogoChange() {
    if (this.deleteLogo) {
      // Limpiar la vista previa inmediatamente
      this.logoPreviewUrl = null;
      
      // Si es un archivo cargado pero no guardado, limpiarlo
      if (this.menu.config.logo instanceof File) {
        this.menu.config.logo = null;
      }
    } else {
      // Si se desmarca, restaurar la vista previa
      this.getLogoPreviewUrl();
    }
  }

  removeDishFromMenu(dishId: number, section: string) {
    if (!confirm('¿Estás seguro de que deseas quitar este plato del menú?')) {
        return;
    }

    const token = localStorage.getItem('token');
    this.http.delete(
        `${environment.apiUrl}api/menus/${this.menuId}/remove-plato/${dishId}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: { section }
        }
    ).subscribe({
        next: () => {
            this.successMessage = 'Plato eliminado del menú correctamente';
            this.loadMenu();
            setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
            console.error('Error al eliminar plato del menú:', err);
            this.errorMessage = 'Error al eliminar el plato del menú. Intente nuevamente.';
            setTimeout(() => this.errorMessage = '', 3000);
        }
    });
}

addDishesToMenu() {
  const selectedDishes = this.filteredDishes.filter(d => d.selected).map(d => d.id);
  
  if (selectedDishes.length === 0) {
    this.errorMessage = 'Por favor selecciona al menos un plato';
    setTimeout(() => this.errorMessage = '', 3000);
    return;
  }

  const token = localStorage.getItem('token');
  
  // Preparar las relaciones a crear
  const relationsToCreate = [];
  
  // Siempre agregar a la sección seleccionada
  relationsToCreate.push({
    section: this.selectedSection,
    dish_ids: selectedDishes
  });
  
  // Si la sección no es "carta", agregar también a "carta"
  if (this.selectedSection !== 'carta') {
    relationsToCreate.push({
      section: 'carta',
      dish_ids: selectedDishes
    });
  }

  // Enviar todas las relaciones al backend
  this.http.post(`${environment.apiUrl}api/menus/${this.menuId}/add-platos`, 
    { relations: relationsToCreate }, 
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  ).subscribe({
    next: (response: any) => {
      this.successMessage = 'Platos agregados al menú correctamente';
      this.loadMenu();
      this.filteredDishes.forEach(d => d.selected = false);
      setTimeout(() => this.successMessage = '', 3000);
    },
    error: (err) => {
      console.error('Error al agregar platos al menú:', err);
      this.errorMessage = 'Error al agregar platos al menú. Intente nuevamente.';
      setTimeout(() => this.errorMessage = '', 3000);
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
        this.menu.config.socialLinks[index].icon = file;
        this.menu.config.socialLinks[index].iconPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }


// Export data
  exportDataToJSON(): void {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.get<any>(`${this.apiUrl}api/menus/${this.menuId}`, { headers }).subscribe(menuData => {
      this.http.get<any>(`${this.apiUrl}api/menus/${this.menuId}/platos`, { headers }).subscribe({
        next: (response) => {
          if (!response.relaciones || !Array.isArray(response.relaciones)) {
            console.error('Estructura de datos incorrecta');
            return;
          }

          const uniqueRelationships = response.relaciones.reduce((acc: any[], rel: any) => {
            const exists = acc.some(item => 
              item.menu_id === rel.menu_id && 
              item.plato_id === rel.plato_id && 
              item.section === rel.section
            );
            
            if (!exists) {
              acc.push({
                menu_id: rel.menu_id,
                plato_id: rel.plato_id,
                section: rel.section || 'carta',
                created_at: rel.created_at,
                updated_at: rel.updated_at
              });
            }
            return acc;
          }, []);

          const uniquePlatos = this.removeDuplicates(response.platos);

          this.http.get<any[]>(`${this.apiUrl}api/categorias`, { headers }).subscribe(categoriasData => {
            // 1. Exportar menú
            const menuExportData = {
              menu: this.processMenuData(menuData),
              relaciones_menu_plato: uniqueRelationships
            };
            
            // 2. Exportar platos (actualizar existente)
            const platosExportData = this.processPlatosData(uniquePlatos);
            
            // 3. Exportar categorías
            const categoriasExportData = categoriasData;

            // Enviar cada archivo al backend
            this.exportFileToAssets(
              JSON.stringify(menuExportData), 
              `menu_${this.menuId}.json`,
              'menus'
            );

            this.exportFileToAssets(
              JSON.stringify(platosExportData),
              'platos.json'
            );

            this.exportFileToAssets(
              JSON.stringify(categoriasExportData),
              'categorias.json'
            );

            this.successMessage = 'Datos exportados correctamente a assets/';
            setTimeout(() => this.successMessage = '', 3000);
          });
        },
        error: (err) => {
          console.error('Error al exportar:', err);
          this.errorMessage = 'Error al exportar los datos';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    });
  }

  private exportFileToAssets(data: string, filename: string, subfolder: string = ''): void {
    const token = localStorage.getItem('token');
    const blob = new Blob([data], { type: 'application/json' });
    const formData = new FormData();
    
    formData.append('json', blob, filename);
    formData.append('subfolder', subfolder);

    this.http.post(`${this.apiUrl}api/export-json`, formData, { 
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        console.log('Archivo guardado:', res.relative_path);
      },
      error: (err) => {
        console.error('Error al guardar archivo:', err);
      }
    });
  }

  private processMenuData(menu: any): any {
    return {
      id: menu.id,
      nombre: menu.nombre,
      company_name: menu.company_name,
      config: menu.config,
      created_at: menu.created_at,
      updated_at: menu.updated_at
    };
  }

  private processPlatosData(platos: any[]): any[] {
    return platos.map(plato => ({
      id: plato.id,
      nombre: plato.nombre,
      descripcion: plato.descripcion,
      precio: plato.precio,
      categoria_id: plato.categoria_id,
      imagen: plato.imagen,
      tiempo_preparacion: plato.tiempo_preparacion,
      calorias: plato.calorias,
      ingredientes: plato.ingredientes,
      alergenos: plato.alergenos,
      disponible: plato.disponible,
      destacado: plato.destacado,
      tipo_servicio: plato.tipo_servicio,
      maridaje_recomendado: plato.maridaje_recomendado,
      video_preparacion: plato.video_preparacion,
      stock: plato.stock,
      created_at: plato.created_at,
      updated_at: plato.updated_at
    }));
  }
}