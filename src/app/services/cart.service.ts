import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cartItems: any[] = [];
  private cartItemsSubject = new BehaviorSubject<any[]>([]);

  constructor() {

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.cartItemsSubject.next(this.cartItems);
    }
   }

   addToCart(product: any) {
    const existingItem = this.cartItems.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cartItems.push({ ...product, quantity: 1 });
    }
    this.updateCart();
  }
  

  removeFromCart(productId: number) {
    this.cartItems = this.cartItems.filter(item => item.id !== productId);
    this.updateCart();
  }

  updateQuantity(productId: number, quantity: number) {
    const item = this.cartItems.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
      this.updateCart();
    }
  }

  getCart() {
    return this.cartItemsSubject.asObservable();
  }

  getTotal() {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTax() {
    return this.getTotal() * 0.175; // Assuming 17.5% tax rate
  }

  private updateCart() {
    this.cartItemsSubject.next(this.cartItems);
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  // updateCart() {
  //   throw new Error('Method not implemented.');
  // }
}
