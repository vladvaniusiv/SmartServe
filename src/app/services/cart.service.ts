// cart.service.ts
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems: any[] = [];
  private cartSubject = new BehaviorSubject<any[]>([]);
  private cartTotalSubject = new BehaviorSubject<number>(0);
  private cartCountSubject = new BehaviorSubject<number>(0);

  constructor() {
    this.cartItems = this.loadCartFromStorage();
  }

  cart$ = this.cartSubject.asObservable();
  total$ = this.cartTotalSubject.asObservable();
  count$ = this.cartCountSubject.asObservable();

  private loadCartFromStorage(): any[] {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      return [];
    }
  }

  private saveCartToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }


  addToCart(dish: any) {
    const existing = this.cartItems.find(item => item.id === dish.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cartItems.push({ ...dish, quantity: 1 });
    }
    this.updateState();
  }

  removeFromCart(dish: any) {
    const index = this.cartItems.findIndex(item => item.id === dish.id);
    if (index !== -1) {
      if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity--;
      } else {
        this.cartItems.splice(index, 1);
      }
    }
    this.updateState();
  }

  getCartItems() {
    return this.cartItems;
  }

  getDishQuantity(id: number) {
    const item = this.cartItems.find(i => i.id === id);
    return item ? item.quantity : 0;
  }

  private updateState() {
    this.saveCartToStorage();
    this.cartSubject.next([...this.cartItems]);
    this.cartTotalSubject.next(this.cartItems.reduce((sum, i) => sum + i.precio * i.quantity, 0));
    this.cartCountSubject.next(this.cartItems.reduce((sum, i) => sum + i.quantity, 0));
  }

  clearCart() {
  this.cartItems = [];
  this.cartSubject.next(this.cartItems);
  this.cartTotalSubject.next(0);
  this.cartCountSubject.next(0);
}
}