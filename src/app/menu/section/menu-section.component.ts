import { Component,Input,OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar-menu/navbar-menu.component';
import { FooterComponent } from '../footer/footer.component';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { ViewEncapsulation } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-menu-section',
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './menu-section.component.html',
  styleUrl: './menu-section.component.css',
  standalone: true,
  encapsulation: ViewEncapsulation.None,

})
export class MenuSectionComponent {
  @Input() config: any;
  @Input() sectionTitle: string = '';
  @Input() restaurantName: string = '';
  @Input() logo: string | null = null;
  @Input() selectedLanguages: string[] = [];
  @Input() description: string = '';
  @Input() sectionType: string = ''; // 'menu', 'carta', 'vino', 'aperitivo'
  @Input() sectionDishes: any[] = [];
  @Input() categories: any[] = [];
  @Input() apiUrl: string = '/assets/data/';
  @Input() themeClass: string = '';
  @Input() allSections: any = {}; // Agregamos este input para recibir todas las secciones
  @Output() sectionChanged = new EventEmitter<string>();

  searchTerm: string = '';
  filter: string = '';
  showPreview: boolean = false;
  showCart: boolean = false;
  cartTotalItems: number = 0;
  cartTotal: number = 0;
  tableCount: number = 1;
  user = {
    company_name: ''
  };

  dishes: any[] = [];
  selectedDishes: any[] = [];
  cart: any[] = [];
  selectedDish: any = null;
  expandedDishId: number | null = null;

  showFilterModal: boolean = false;
  allIngredientes: string[] = [];
  allAlergenos: string[] = [];
  selectedIngredientes: { [key: string]: boolean } = {};
  selectedAlergenos: { [key: string]: boolean } = {};
  selectedCategories: number[] = [];
  cartIcon: string = 'cart.png';
  sortOption: string = '';
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cartService: CartService,
    private router: Router,
  ) {}
  selectedSort = 'precio';
  selectedSortKey: string = '';
  selectedSortLabel: string = 'Ninguno';
  ngOnInit() {
    this.sectionDishes = this.sectionDishes.map(dish => ({
      ...dish,
      ingredientes: this.formatToArray(dish.ingredientes),
      alergenos: this.formatToArray(dish.alergenos)}));
  
    this.cartService.cart$.subscribe((items: any[]) => {
      this.cart = items;
    });

    this.cartService.total$.subscribe((total: number) => {
      this.cartTotal = total;
    });

    this.cartService.count$.subscribe((count: number) => {
      this.cartTotalItems = count;
    });

    // Obtener lista única de ingredientes y alérgenos
    const ingredientesSet = new Set<string>();
    const alergenosSet = new Set<string>();
  
    for (const dish of this.sectionDishes) {
      dish.ingredientes.forEach((i: string) => ingredientesSet.add(i));
      dish.alergenos.forEach((a: string) => alergenosSet.add(a));
    }
  
    this.allIngredientes = Array.from(ingredientesSet).filter(i => typeof i === 'string');
    this.allAlergenos = Array.from(alergenosSet).filter(a => typeof a === 'string');
  }


  ngOnChanges(changes: SimpleChanges) {
    // Si cambió sectionDishes y ya tiene valor definido...
    if (changes['sectionDishes'] && this.sectionDishes) {
      // Recalcular listas únicas de ingredientes y alérgenos
      this.allIngredientes = Array.from(new Set(
        this.sectionDishes.flatMap(d => d.ingredientes)
      ));
      this.allAlergenos   = Array.from(new Set(
        this.sectionDishes.flatMap(d => d.alergenos)
      ));
    }
  }

  setSort(field: string, direction: 'asc' | 'desc', label: string) {
    this.sortField = field;
    this.sortDirection = direction;
    this.selectedSortLabel = label;
    this.applyFilters();
  }

    // Modificar getImageUrl()
  getImageUrl(path: string): string {
    if (!path) return '';
    return `/assets/images/${path}`;
  }

  getCategoryName(catId: number): string {
  const cat = this.categories.find(c => c.id === catId);
  return cat ? cat.nombre : 'Sin categoría';
}

getCategoryIcon(catId: number): string | null {
  const cat = this.categories.find(c => c.id === catId);
  return cat && cat.icono_url ? cat.icono_url : null;
}

  // Modificar processDishes()
  private processDishes() {
    this.sectionDishes = this.sectionDishes.map(dish => ({
      ...dish,
      ingredientes: this.formatToArray(dish.ingredientes),
      alergenos: this.formatToArray(dish.alergenos),
      imagen: dish.imagen ? this.getImageUrl(`platos/${dish.imagen}`) : null
    }));
  }

  // Modificar getCartIconPath()
  getCartIconPath(): string {
    return this.getImageUrl(`cart/${this.cartIcon}`);
  }

  get filteredAndSortedDishes() {
    let dishes = this.filteredDishes;
    
    if (this.sortField) {
      dishes = [...dishes].sort((a, b) => {
        const valA = a[this.sortField] ?? 0;
        const valB = b[this.sortField] ?? 0;

        // Handle string comparison
        if (typeof valA === 'string' && typeof valB === 'string') {
          return this.sortDirection === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
        }
        // Handle number comparison
        else {
          return this.sortDirection === 'asc' 
            ? valA - valB 
            : valB - valA;
        }
      });
    }
    
    return dishes;
  }

  changeSection(newSection: string) {
    if (this.sectionType !== newSection) {
      this.sectionType = newSection;
      this.sectionDishes = this.allSections[newSection] || [];
      this.expandedDishId = null; // Resetear plato expandido al cambiar sección
      this.sectionChanged.emit(newSection); // Emitir el evento de cambio
    }
  }

  sortDishes() {
    if (!this.sortOption) return;

    this.sectionDishes.sort((a, b) => {
      const valA = a[this.sortOption] ?? 0;
      const valB = b[this.sortOption] ?? 0;

      return valA - valB;
    });
  }

  realizarPedido() {
    this.cartService.getCartItems().forEach(item => {
      this.cartService.removeFromCart(item);
    });
    alert('Pedido simulado exitosamente');
    this.cart = [];
    this.showCart = false;
  }

  getMesaIdDesdeRuta(): number {
    const parts = this.router.url.split('/');
    const mesaStr = parts.find(part => part.startsWith('mesa-'));
    return mesaStr ? parseInt(mesaStr.replace('mesa-', ''), 10) : 1;
  }

  
  toggleDishDetails(dishId: number) {
    this.expandedDishId = this.expandedDishId === dishId ? null : dishId;
  }

  addToCart(dish: any) {
    if (dish.stock != null && this.getDishQuantity(dish.id) >= dish.stock) {
      alert(`No hay suficiente stock. Solo quedan ${dish.stock} unidades.`);
      return;
    }
    this.cartService.addToCart(dish);
  }

  removeFromCart(dish: any) {
    this.cartService.removeFromCart(dish);
  }

  getDishQuantity(id: number): number {
    return this.cartService.getDishQuantity(id);
  }


  updateCartTotals() {
    this.cartTotalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    this.cartTotal = this.cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
  }

  showDishDetails(dish: any) {
    this.selectedDish = dish;
  }

  closeDishDetails() {
    this.selectedDish = null;
  }

  toggleCart() {
    this.showCart = !this.showCart;
  }

  get filteredDishes() {
    return this.sectionDishes.filter(dish => {
      // Búsqueda por nombre
      const matchesSearch = this.searchTerm
        ? dish.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;

      // Filtrado por categorías
      const matchesCategory = this.selectedCategories.length === 0 ||
        this.selectedCategories.includes(dish.categoria_id);

      // Filtrado por ingredientes: mostrar platos que tengan al menos uno de los seleccionados
      const selectedIngredientesKeys = Object.keys(this.selectedIngredientes)
        .filter(key => this.selectedIngredientes[key]);

      const matchesIngredientes = selectedIngredientesKeys.length === 0 ||
        dish.ingredientes?.some((ing: string) => selectedIngredientesKeys.includes(ing));

      // Filtrado por alérgenos: ocultar platos que contengan alguno de los seleccionados
      const selectedAlergenosKeys = Object.keys(this.selectedAlergenos)
        .filter(key => this.selectedAlergenos[key]);

      const matchesAlergenos = selectedAlergenosKeys.length === 0 ||
        !dish.alergenos?.some((al: string) => selectedAlergenosKeys.includes(al));

      return matchesSearch && matchesCategory && matchesIngredientes && matchesAlergenos;
    });
  }

  private formatToArray(value: any): string[] {
    if (Array.isArray(value)) {
      return value.filter(item => item.trim() !== '');
    }
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim()).filter(item => item !== '');
    }
    return [];
  }


  getSafeVideoUrl(videoPath: string): string {
    return this.getImageUrl(`platos/${videoPath}`); // Para modo estático
    // return environment.apiUrl + 'storage/' + videoPath; // Para modo backend
  }

  getMaxAvailable(dish: any): number {
    if (dish.stock === null || dish.stock === undefined) return 999; // Sin límite
    return dish.stock - this.getDishQuantity(dish.id);
  }

  toggleFilterModal() {
    this.showFilterModal = !this.showFilterModal;
  }
  
  applyFilters() {
    this.showFilterModal = false;
  }


  onCategoryToggle(categoryId: number) {
    const index = this.selectedCategories.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(categoryId);
    }
  }
  
}