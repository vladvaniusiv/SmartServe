import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuSectionComponent } from '../section/menu-section.component';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'app-show',
  standalone: true,
  imports: [CommonModule, MenuSectionComponent],
  templateUrl: './show-menu.component.html',
  styleUrl: './show-menu.component.css'
})
export class ShowMenuComponent implements OnInit {
  menu: any = {
    nombre: '',
    config: {
      theme: 'light',
      description: '',
      logo: null as File | string | null,
      location: 'Calle Falsa 123, Ciudad',
      wifiPassword: 'restaurante2025',
      socialLinks: [],
      visibleSections: {
        menu: true,
        carta: true,
        vino: true,
        aperitivo: true
      }
    },
    platos: []
  };

  menuId: number | null = null;
  categorias: any[] = [];
  currentSection: string = 'menu';
  logoPreviewUrl: string | null = null;
  apiUrl = '/assets/data/'; // Ruta directa a assets

  menuSections: any = {
    menu: [],
    carta: [],
    vino: [],
    aperitivo: []
  };

  user = {
    company_name: ''
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.menuId = +params['id'];
      this.loadMenu();
    });
  }

  onSectionChanged(newSection: string) {
    this.currentSection = newSection;
  }

  loadMenu() {
    if (!this.menuId) return;
    forkJoin({
      /*
      menu: this.http.get<any>(`${this.apiUrl}menus/menu_${this.menuId}.json`),
      platos: this.http.get<any[]>(`${this.apiUrl}platos.json`), 
      categorias: this.http.get<any[]>(`${this.apiUrl}categorias.json`) */
      menu: this.http.get<any>(`/assets/data/menus/menu_${this.menuId}.json`),
      platos: this.http.get<any[]>('/assets/data/platos.json'),
      categorias: this.http.get<any[]>('/assets/data/categorias.json')
    }).subscribe({
      next: ({ menu, platos, categorias }) => {
        this.processStaticData(menu, platos);
        this.categorias = categorias; // <-- Asegurar que categorias es any[]
        this.loadLogo();
      },
      error: (err) => console.error('Error loading data:', err)
    });
  }

  private processStaticData(menuData: any, platos: any[]) {
  this.menu = menuData.menu;
  this.user.company_name = menuData.menu.company_name;

  const relaciones = menuData.relaciones_menu_plato;

  // Agrega los platos a las secciones según las relaciones
  this.updateMenuSections(relaciones, platos);

  // Establece la primera sección visible con platos
  const visibleSections = this.menu.config.visibleSections;
  const sectionOrder = ['menu', 'carta', 'vino', 'aperitivo'];

  for (const section of sectionOrder) {
    if (visibleSections[section] && this.menuSections[section]?.length > 0) {
      this.currentSection = section;
      break;
    }
  }
}

  private loadLogo() {
    if (this.menu.config?.logo) {
      this.logoPreviewUrl = `/assets/images/menus/logos/${this.menu.config.logo}`;
    }
  }


  updateMenuSections(relaciones: any[], platos: any[]) {
  this.menuSections = {
    menu: [],
    carta: [],
    vino: [],
    aperitivo: []
  };

  const platoMap = new Map<number, any>();
  platos.forEach(p => platoMap.set(p.id, p));

  relaciones.forEach(rel => {
    const plato = platoMap.get(rel.plato_id);
    if (!plato) return;

    // Normalizar campos
    plato.ingredientes = this.formatToArray(plato.ingredientes);
    plato.alergenos = this.formatToArray(plato.alergenos);
    plato.tipo_servicio = Array.isArray(plato.tipo_servicio)
      ? plato.tipo_servicio
      : (plato.tipo_servicio ? plato.tipo_servicio.split(',') : []);

    if (this.menuSections[rel.section]) {
      this.menuSections[rel.section].push(plato);
    }
  });

  // Sección carta = combinación de todas las demás (sin duplicados)
  const cartaPlatos = [...this.menuSections.menu, ...this.menuSections.vino, ...this.menuSections.aperitivo];
  const uniquePlatos = this.removeDuplicates([...this.menuSections.carta, ...cartaPlatos]);
  this.menuSections.carta = uniquePlatos;
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

  // ShowMenuComponent.ts (fragmento corregido)
  formatToArray(data: string | any[]): any[] {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Error al parsear JSON:', e);
        return [];
      }
    }
    return Array.isArray(data) ? data : [];
  }

  get sectionDishes() {
    return this.menuSections[this.currentSection] || [];
  }

  get themeClass() {
    return this.menu.config.theme === 'dark' ? 'theme-dark' : 'theme-light';
  }
}