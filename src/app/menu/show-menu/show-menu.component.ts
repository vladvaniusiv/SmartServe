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
  apiUrl: string =  this.getBasePath() + 'assets/data/';
  mesa: string = '1';
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
      this.mesa = params['mesa'] || '1';
      this.loadMenu();
    });
  }

  getBasePath(): string {
    return window.location.hostname.includes('github.io') ? '/SmartServe/' : '';
  }

  onSectionChanged(newSection: string) {
    this.currentSection = newSection;
  }

  loadMenu() {
    if (!this.menuId) return;
    forkJoin({
      menu: this.http.get<any>(`${this.apiUrl}menus/menu_${this.menuId}.json`),
      platos: this.http.get<any[]>(`${this.apiUrl}platos.json`),
      categorias: this.http.get<any[]>(`${this.apiUrl}categorias.json`)
    }).subscribe({
      next: ({ menu, platos, categorias }) => {
        this.processStaticData(menu, platos);
        this.categorias = categorias;
        this.loadLogo();
      },
      error: (err) => console.error('Error loading data:', err)
    });
  }

  private processStaticData(menuData: any, platos: any[]) {
  this.menu = menuData.menu;
  this.user.company_name = menuData.menu.company_name;

  const relaciones = menuData.relaciones_menu_plato;

  this.updateMenuSections(relaciones, platos);

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
      const cleanLogo = this.menu.config.logo.replace('logos/', '');
      this.logoPreviewUrl = `${this.getBasePath()}assets/images/menus/logos/${cleanLogo}`;
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

    plato.ingredientes = this.formatToArray(plato.ingredientes);
    plato.alergenos = this.formatToArray(plato.alergenos);
    plato.tipo_servicio = Array.isArray(plato.tipo_servicio)
      ? plato.tipo_servicio
      : (plato.tipo_servicio ? plato.tipo_servicio.split(',') : []);

    if (this.menuSections[rel.section]) {
      this.menuSections[rel.section].push(plato);
    }
  });

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
}