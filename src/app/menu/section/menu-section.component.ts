import { Component,Input,OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar-menu/navbar-menu.component';
import { FooterComponent } from '../footer/footer.component';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  @Input() apiUrl: string =  this.getBasePath() + 'assets/data/';
  @Input() themeClass: string = '';
  @Input() allSections: any = {}; // Agregamos este input para recibir todas las secciones
  @Output() sectionChanged = new EventEmitter<string>();
  @Input() mesa: string = '';

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

  //orderStatus: any = null;
  showOrderStatus = false;
  pedidoIds: number[] = [];
  checkingStatus = false;
  statusCheckInterval: any;
  hasActiveOrders: boolean = false;

  ngOnInit() {
    this.sectionDishes = this.sectionDishes.map(dish => ({
      ...dish,
      ingredientes: this.formatToArray(dish.ingredientes),
      alergenos: this.formatToArray(dish.alergenos)}));
  
    this.cart = this.cartService.getCartItems(this.mesa);

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

    const savedPedidos = localStorage.getItem(`ultimosPedidos_${this.mesa}`);
    if (savedPedidos) {
      this.pedidoIds = JSON.parse(savedPedidos);
      this.hasActiveOrders = this.pedidoIds.length > 0;
      this.checkOrderStatus();
    }
    this.route.params.subscribe(params => {
    this.mesa = params['mesa'] || '1';
  });
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

  getBasePath(): string {
    return window.location.hostname.includes('github.io') ? '/SmartServe/' : '/';
  }

  setSort(field: string, direction: 'asc' | 'desc', label: string) {
    this.sortField = field;
    this.sortDirection = direction;
    this.selectedSortLabel = label;
    this.applyFilters();
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    const base = window.location.hostname.includes('github.io') ? '/SmartServe/' : '';
    return `${base}assets/images/platos/${path.replace('platos/', '')}`;
  }

  getCategoryName(catId: number): string {
  const cat = this.categories.find(c => c.id === catId);
  return cat ? cat.nombre : 'Sin categoría';
}

getCartIconPath(): string {
  const base = window.location.hostname.includes('github.io') ? '/SmartServe/' : '';
  return `${base}assets/images/cart/${this.cartIcon}`;
}

getCategoryIcon(catId: number): string | null {
  const cat = this.categories.find(c => c.id === catId);
  const base = window.location.hostname.includes('github.io') ? '/SmartServe/' : '';
  return cat?.icono ? `${base}assets/images/categorias/${cat.icono}` : null;
}

getSafeVideoUrl(videoPath: string): string {
  const base = window.location.hostname.includes('github.io') ? '/SmartServe/' : '';
  return `${base}assets/images/platos/${videoPath}`;
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
  const pedido = {
      mesa_id: this.mesa,
      platos: this.cart.map(item => ({
        plato_id: item.id,
        cantidad: item.quantity,
        observaciones: item.observaciones || ''
      }))
    };

  console.log('📤 Enviando pedido:', pedido);
  // Add headers to the request
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });
  this.http.post('https://pedidosmenu.loca.lt/api/pedidos', pedido, { headers }).subscribe({
      next: (response: any) => {
        if (response.pedidoIds && Array.isArray(response.pedidoIds)) {
          this.pedidoIds = response.pedidoIds;
          this.hasActiveOrders = this.pedidoIds.length > 0;
          localStorage.setItem(`ultimosPedidos_${this.mesa}`, JSON.stringify(this.pedidoIds));
          
          // Mostrar estado y actualizar
          this.showOrderStatus = true;
          this.checkOrderStatus();
          
          // Iniciar intervalo si es necesario
          if (this.hasActiveOrders && !this.statusCheckInterval) {
            this.statusCheckInterval = setInterval(() => {
              this.checkOrderStatus();
            }, 5000);
          }
          
          alert('Pedidos realizados exitosamente');
          this.cartService.clearCart(this.mesa);
          this.cart = [];
          this.showCart = false;
        } else {
          throw new Error('Formato de respuesta inválido');
        }
      },
    error: (error) => {
      console.error('Error completo:', error);
      alert(`Error al realizar el pedido: ${error.error?.detalle || error.message}`);
    }
  });
}

orderStatus: { [key: number]: any } = {}; // Inicializar como objeto vacío

checkOrderStatus() {
  console.log('Verificando estado para IDs:', this.pedidoIds);
  
  if (this.pedidoIds.length === 0) {
    console.warn('No hay IDs de pedido para verificar');
    this.hasActiveOrders = false;
    return;
  }
  
  this.pedidoIds.forEach(id => {
    const url = `https://pedidosmenu.loca.lt/api/pedidos/${id}`;
    console.log('Consultando:', url);
    
    this.http.get(url).subscribe({
      next: (status: any) => {
        if (status.platos) {
          status.platos = status.platos.map((plato: any) => {
            const platoLocal = this.findPlatoById(plato.plato_id);
            return {
              ...plato,
              nombre: platoLocal ? platoLocal.nombre : `Plato #${plato.plato_id}`
            };
          });
        }
        
        this.orderStatus = {
          ...this.orderStatus,
          [id]: status
        };
      },
      error: (error) => {
          console.error(`Error en pedido ${id}:`, error);
            if (error.status === 404) {
              this.removePedido(id);  // Usar la nueva función
            } else {
            // Manejar otros errores
            this.orderStatus = {
              ...this.orderStatus,
              [id]: { 
                error: true,
                message: 'Error obteniendo estado' 
              }
            };
          }
        }
      });
  });
}

// menu-section.component.ts
removePedido(id: number) {
  // Eliminar de la lista de IDs
  this.pedidoIds = this.pedidoIds.filter(pedidoId => pedidoId !== id);
  
  // Eliminar de los estados mostrados
  delete this.orderStatus[id];
  
  // Actualizar localStorage
  localStorage.setItem(`ultimosPedidos_${this.mesa}`, JSON.stringify(this.pedidoIds));
  
  // Actualizar estado y detener intervalo si es necesario
  this.hasActiveOrders = this.pedidoIds.length > 0;
  if (!this.hasActiveOrders && this.statusCheckInterval) {
    clearInterval(this.statusCheckInterval);
    this.statusCheckInterval = null;
  }
  
  // Limpiar errores previos
  if (this.orderStatus[id]?.error) {
    delete this.orderStatus[id];
  }
}

// Buscar plato por ID en los datos locales
findPlatoById(id: number): any {
  return this.sectionDishes.find(dish => dish.id === id);
}

// Alternar visibilidad del estado
toggleOrderStatus() {
    this.showOrderStatus = !this.showOrderStatus;
    
    if (this.showOrderStatus) {
      this.checkOrderStatus();
      // Iniciar intervalo solo si hay pedidos activos
      if (this.hasActiveOrders && !this.statusCheckInterval) {
        this.statusCheckInterval = setInterval(() => {
          this.checkOrderStatus();
        }, 5000);
      }
    } else {
      // Detener intervalo al cerrar el panel
      if (this.statusCheckInterval) {
        clearInterval(this.statusCheckInterval);
        this.statusCheckInterval = null;
      }
    }
  }

// Obtener clase CSS según estado
getStatusClass(status: string): string {
  switch (status) {
    case 'pendiente': return 'status-pending';
    case 'en preparación': return 'status-preparing';
    case 'en camino': return 'status-onway';
    case 'entregado': return 'status-delivered';
    case 'cancelado': return 'status-cancelled';
    default: return '';
  }
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
    this.cartService.addToCart(dish, this.mesa);
    this.cart = this.cartService.getCartItems(this.mesa);
    this.updateCartTotals();
  }

  removeFromCart(dish: any) {
    this.cartService.removeFromCart(dish, this.mesa);
    this.cart = this.cartService.getCartItems(this.mesa);
    this.updateCartTotals();
  }

  getDishQuantity(id: number): number {
    return this.cartService.getDishQuantity(id, this.mesa);
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
    if (typeof value === 'string') {
      try {
        return JSON.parse(value.replace(/'/g, '"'));
      } catch (e) {
        return value.split(',').map((item: string) => item.trim());
      }
    }
    return Array.isArray(value) ? value : [];
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