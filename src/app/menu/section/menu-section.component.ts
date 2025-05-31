import { Component,Input,OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar-menu/navbar-menu.component';
import { FooterComponent } from '../footer/footer.component';
import { environment } from '../../../environments/environment';
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
  @Input() apiUrl: string =  this.getBasePath() + 'assets/data/';
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

  //orderStatus: any = null;
  showOrderStatus = false;
  pedidoIds: number[] = [];
  checkingStatus = false;
  statusCheckInterval: any;

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

    const savedPedidos = localStorage.getItem('ultimosPedidos');
    if (savedPedidos) {
      this.pedidoIds = JSON.parse(savedPedidos);
      this.checkOrderStatus();
    }
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

/*
  realizarPedido() {
  const pedido = {
    mesa_id: this.getMesaIdDesdeRuta(),
    platos: this.cart.map(item => ({
      plato_id: item.id,
      cantidad: item.quantity,
      observaciones: item.observaciones || ''
    })),
    total: this.cartTotal
  };

  this.http.post('http://localhost:3000/api/pedidos', pedido).subscribe({
    next: (response) => {
      alert('Pedido realizado exitosamente');
      this.cartService.clearCart();
      this.cart = [];
      this.showCart = false;
    },
    error: (error) => {
      console.error('Error al realizar el pedido:', error);
      alert('Ocurrió un error al enviar el pedido. Intente nuevamente.');
    }
  });
  }
*/
/*
realizarPedido() {
  const pedido = {
    mesa_id: this.getMesaIdDesdeRuta(),
    platos: this.cart.map(item => ({
      plato_id: item.id,
      cantidad: item.quantity,
      observaciones: item.observaciones || ''
    })),
    total: this.cartTotal
  };

    console.log('Enviando pedido:', pedido); // Log del pedido enviado
  
  this.http.post('https://pedidosmenu.loca.lt/api/pedidos', pedido).subscribe({
    next: (response: any) => {
      console.log('Respuesta completa del backend:', response); // Respuesta completa
      
      // Extrae IDs de los pedidos creados
      if (response.pedidos && Array.isArray(response.pedidos)) {
        this.pedidoIds = response.pedidos.map((p: any) => p.id);
      } else if (response.pedidoIds) {
        this.pedidoIds = response.pedidoIds;
      } else {
        console.error('Formato de respuesta inesperado:', response);
      }

      console.log('IDs de pedidos recibidos:', this.pedidoIds);
      alert('Pedido realizado exitosamente');
      this.cartService.clearCart();
      this.cart = [];
      this.showCart = false;
      this.toggleOrderStatus();
    },
    error: (error) => {
    console.error('Error completo:', error); // Error completo
    alert('Ocurrió un error al enviar el pedido. Intente nuevamente.');
    }
  });
}*/
realizarPedido() {
  const pedido = {
    mesa_id: this.getMesaIdDesdeRuta(),
    platos: this.cart.map(item => ({
      plato_id: item.id,
      cantidad: item.quantity,
      observaciones: item.observaciones || ''
    }))
  };

  console.log('📤 Enviando pedido:', pedido);
  
  this.http.post('https://pedidosmenu.loca.lt/api/pedidos', pedido).subscribe({
    next: (response: any) => {
      console.log('📥 Respuesta del backend:', response);
      
      if (response.pedidoIds && Array.isArray(response.pedidoIds)) {
        this.pedidoIds = response.pedidoIds;
        localStorage.setItem('ultimosPedidos', JSON.stringify(this.pedidoIds));
        alert('Pedidos realizados exitosamente');
        this.cartService.clearCart();
        this.cart = [];
        this.showCart = false;
        this.toggleOrderStatus();
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    },
    error: (error) => {
      console.error('❌ Error completo:', error);
      alert(`Error al realizar el pedido: ${error.error?.detalle || error.message}`);
    }
  });
}


// Nuevo método para verificar estado
/*
checkOrderStatus() {
  console.log('Verificando estado para IDs:', this.pedidoIds);
  
  if (this.pedidoIds.length === 0) {
    console.warn('No hay IDs de pedido para verificar');
    return;
  }
  
  this.pedidoIds.forEach(id => {
    const url = `https://pedidosmenu.loca.lt/api/pedidos/${id}`;
    console.log('Consultando:', url);
    
    this.http.get(url).subscribe({
      next: (status: any) => {
        console.log(`Estado para pedido ${id}:`, status);
        this.orderStatus[id] = status;
      },
      error: (error) => {
        console.error(`Error en pedido ${id}:`, error);
        this.orderStatus[id] = { 
          error: true,
          message: 'Error obteniendo estado' 
        };
      }
    });
  });
}*/
// En la clase del componente
orderStatus: { [key: number]: any } = {}; // Inicializar como objeto vacío

checkOrderStatus() {
  console.log('Verificando estado para IDs:', this.pedidoIds);
  
  if (this.pedidoIds.length === 0) {
    console.warn('No hay IDs de pedido para verificar');
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
        this.orderStatus = {
          ...this.orderStatus,
          [id]: { 
            error: true,
            message: 'Error obteniendo estado' 
          }
        };
      }
    });
  });
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
    // Consultar cada 5 segundos (5000 ms)
    this.statusCheckInterval = setInterval(() => {
      this.checkOrderStatus();
    }, 5000);
  } else {
    clearInterval(this.statusCheckInterval);
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
    /*
    if (Array.isArray(value)) {
      return value.filter(item => item.trim() !== '');
    }
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim()).filter(item => item !== '');
    }
    return [];*/
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