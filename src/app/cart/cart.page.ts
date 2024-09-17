import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  cartItems: any[] = [];
  subtotal: number = 0;
  tax: number = 0;
  total: number = 0;

  constructor(private cartService: CartService) { }

  ngOnInit() {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.calculateTotals();
    });
  }

  calculateTotals() {
    this.subtotal = this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    this.tax = this.cartService.getTax();
    this.total = this.subtotal + this.tax;
  }

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  increaseQuantity(productId: number) {
    const item = this.cartItems.find(i => i.id === productId);
    if (item) {
      this.cartService.updateQuantity(productId, item.quantity + 1);
    }
  }

  decreaseQuantity(productId: number) {
    const item = this.cartItems.find(i => i.id === productId);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(productId, item.quantity - 1);
    }
  }

  proceedToCheckout() {
    // Your checkout logic here
  }
}
