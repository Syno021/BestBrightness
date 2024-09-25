import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { AlertController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';

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
  quantity: number = 0;

  constructor(
    private cartService: CartService,
    private alertController: AlertController,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
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
    // Remove item from the cartService
    this.cartService.removeFromCart(productId);

    // Update the local cartItems array and recalculate totals
    this.cartItems = this.cartItems.filter(item => item.id !== productId);
    this.calculateTotals();
    
    // Ensure the UI is updated by checking if the cart is empty
    if (this.cartItems.length === 0) {
      this.cartItems = []; // Clear the array to reflect an empty cart
    }
  }

  increaseQuantity(productId: number) {
    const item = this.cartItems.find(i => i.id === productId);
    if (item) {
      item.quantity += 1; // Update the quantity locally
      this.cartService.updateQuantity(productId, item.quantity); // Sync with cart service
      this.calculateTotals(); // Recalculate totals
      this.cd.detectChanges(); // Manually trigger change detection
    }
  }
  
  decreaseQuantity(productId: number) {
    const item = this.cartItems.find(i => i.id === productId);
    if (item && item.quantity > 1) {
      item.quantity -= 1; // Update the quantity locally
      this.cartService.updateQuantity(productId, item.quantity); // Sync with cart service
      this.calculateTotals(); // Recalculate totals
      this.cd.detectChanges(); // Manually trigger change detection
    }
  }
  

  async proceedOrder() {
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
          }
        }
      ]
    });
    await alert.present();

    // Automatically dismiss the alert after 3 seconds
    setTimeout(() => {
      alert.dismiss();
    }, 3000);
  }
}
