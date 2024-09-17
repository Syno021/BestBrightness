import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';

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

  constructor(private cartService: CartService, private router: Router) {
  }

  ngOnInit() {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.calculateTotals();
    });
  }

  decreaseQuantity(productId: number) {
    const item = this.cartItems.find(item => item.id === productId);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(productId, item.quantity - 1);
    }
  }

  increaseQuantity(productId: number) {
    const item = this.cartItems.find(item => item.id === productId);
    if (item) {
      this.cartService.updateQuantity(productId, item.quantity + 1);
    }
  }


  removeItem(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  updateQuantity(productId: number, quantity: number) {
    this.cartService.updateQuantity(productId, quantity);
  }

  calculateTotals() {
    this.subtotal = this.cartService.getTotal();
    this.tax = this.cartService.getTax();
    this.total = this.subtotal + this.tax;
  }
  
  proceedToCheckout() {
    this.router.navigate(['/checkout']);
    // Implement checkout logic
  }
}
