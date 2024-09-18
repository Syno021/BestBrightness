import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { AlertController, AlertOptions } from '@ionic/angular';

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

  constructor(
    private cartService: CartService, 
    // private router: Router,
     private alertController: AlertController 
  ) {}

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
  
  proceedOrder = async (): Promise<void> => {
    if (this.cartItems.length === 0) {
      const alert = await this.alertController.create({
        header: 'Empty Cart',
        message: 'Your cart is empty. Add some items before proceeding.',
        buttons: ['OK']
      });

      await alert.present();
      return;
    }

const alert = await this.alertController.create({
  header: 'Order Placed',
  message: `Your order for R${this.total.toFixed(2)} has been placed successfully!`,
  buttons: [
      {
        text: 'OK',
        handler: () => {
          this.cartService.clearCart();
          this.cartItems = [];
          this.calculateTotals();
          alert.dismiss();
        }
      }
    ]
  });

  await alert.present();

   // Automatically dismiss the alert after 3 seconds
   setTimeout(() => {
    alert.dismiss();
  }, 3000);
};


  proceedToCheckout() {
    // Your checkout logic here
  }
}




