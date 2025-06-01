// cart.service.ts
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems: any[] = [];
  private cartSubject = new BehaviorSubject<any[]>([]);
  private cartTotalSubject = new BehaviorSubject<number>(0);
  private cartCountSubject = new BehaviorSubject<number>(0);
  private carritosPorMesa: { [key: string]: any[] } = {};

  constructor() {
  }

  setCurrentMesa(mesa: string): void {
    if (!this.carritosPorMesa[mesa]) {
      this.carritosPorMesa[mesa] = this.loadCartFromStorage(mesa);
    }
    this.updateState(mesa);
  }

  cart$ = this.cartSubject.asObservable();
  total$ = this.cartTotalSubject.asObservable();
  count$ = this.cartCountSubject.asObservable();

  private loadCartFromStorage(mesa: string): any[] {
    try {
      const savedCart = localStorage.getItem(`cart_${mesa}`);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      return [];
    }
  }

  private saveCartToStorage(mesa: string): void {
    localStorage.setItem(`cart_${mesa}`, JSON.stringify(this.carritosPorMesa[mesa]));
  }


  addToCart(dish: any, mesa: string) {
    if (!this.carritosPorMesa[mesa]) {
      this.carritosPorMesa[mesa] = this.loadCartFromStorage(mesa);
    }
    
    const existing = this.carritosPorMesa[mesa].find(item => item.id === dish.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.carritosPorMesa[mesa].push({ 
        ...dish, 
        quantity: 1,
        observaciones: '' 
      });
    }
    
    this.saveCartToStorage(mesa);
  }

  removeFromCart(dish: any, mesa: string) {
    if (!this.carritosPorMesa[mesa]) return;
    
    const index = this.carritosPorMesa[mesa].findIndex(item => item.id === dish.id);
    if (index !== -1) {
      if (this.carritosPorMesa[mesa][index].quantity > 1) {
        this.carritosPorMesa[mesa][index].quantity--;
      } else {
        this.carritosPorMesa[mesa].splice(index, 1);
      }
      this.saveCartToStorage(mesa);
    }
  }

  getCartItems(mesa: string): any[] {
    if (!this.carritosPorMesa[mesa]) {
      this.carritosPorMesa[mesa] = this.loadCartFromStorage(mesa);
    }
    return [...this.carritosPorMesa[mesa]];
  }

  getDishQuantity(id: number, mesa: string): number {
    const cart = this.getCartItems(mesa);
    const item = cart.find(item => item.id === id);
    return item ? item.quantity : 0;
  }

  private updateState(mesa: string) {
    const cartItems = this.getCartItems(mesa);
    this.cartSubject.next([...cartItems]);
    this.cartTotalSubject.next(cartItems.reduce((sum, i) => sum + i.precio * i.quantity, 0));
    this.cartCountSubject.next(cartItems.reduce((sum, i) => sum + i.quantity, 0));
  }

  clearCart(mesa: string) {
    if (this.carritosPorMesa[mesa]) {
      this.carritosPorMesa[mesa] = [];
      this.saveCartToStorage(mesa);
    }
  }
}