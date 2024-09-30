import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { AlertController,ToastController, AlertOptions } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
// import { AddressModalComponent } from './address-modal.component';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  cartItems: any[] = [];
  deliveryMethod: string = 'delivery';
  selectedAddress: any = null;
  savedAddresses: any[] = []; // Fetch this from a service or storage

  subtotal: number = 0;
  tax: number = 0;
  total: number = 0;
  // toastController: any;
  
  private cartSubscription: Subscription | undefined;

  constructor(
    private cartService: CartService, 
    // private router: Router,
     private alertController: AlertController,
     private toastController: ToastController,
     private cd: ChangeDetectorRef,
    //  private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  loadCart() {
    this.cartSubscription = this.cartService.getCart().subscribe({
      next: (items) => {
        this.cartItems = items;
        this.calculateTotals();
        console.log('Cart items:', this.cartItems);
        if (this.cartItems.length === 0) {
          this.showToast('Your cart is empty');
        }
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.showToast('Failed to load cart. Please try again later.');
      }
    });
  }

  calculateTotals() {
    this.subtotal = this.cartService.getTotal();
    this.tax = this.cartService.getTax();
    this.total = this.subtotal + this.tax;
  }

  removeItem(productId: number) {
    console.log('removeItem: Attempting to remove item with productId:', productId);
    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        console.log('removeItem: Item successfully removed from cart');
        this.showToast('Item removed from cart');
        this.loadCart();
      },
      error: (error: Error) => {
        this.showToast(`Failed to remove item from cart: ${error.message}`);
      }
    });
}

updateQuantity(productId: number, newQuantity: number) {
    console.log('updateQuantity: Attempting to update quantity for productId:', productId, 'with new quantity:', newQuantity);
    if (newQuantity < 1) {
      console.log('updateQuantity: New quantity is less than 1, removing item with productId:', productId);
      this.removeItem(productId);
      return;
    }
    
    this.cartService.updateQuantity(productId, newQuantity).subscribe({
      next: () => {
        //console.log('updateQuantity: Quantity successfully updated for productId:', productId, 'to:', newQuantity);
        this.showToast('Quantity updated');
        this.loadCart();
      },
      error: (error) => {
        //console.error('updateQuantity: Error updating quantity for productId:', productId, 'Error details:', error);
        this.showToast(`Failed to update quantity for productId ${productId}: ${error.message}`);
      }
    });
}
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  decreaseQuantity(productId: number) {
    const item = this.cartItems.find(i => i.product_id === productId);
    if (item && item.quantity > 1) {
      this.updateQuantity(productId, item.quantity - 1);
    }
  }

  increaseQuantity(productId: number) {
    const item = this.cartItems.find(i => i.product_id === productId);
    if (item) {
      this.updateQuantity(productId, item.quantity + 1);
    }
  }
  
  async addNewAddress() {
    
    const alert = await this.alertController.create({
      header: 'Add New Address',
      cssClass: 'address-alert',
      inputs: [
        {
          name: 'address_line1',
          type: 'text',
          placeholder: 'Address Line 1 *',
           cssClass: 'address-input'
        },
        {
          name: 'address_line2',
          type: 'text',
          placeholder: 'Address Line 2',
          cssClass: 'address-input'
        },
        {
          name: 'city',
          type: 'text',
          placeholder: 'City *',
          cssClass: 'address-input'
        },
        {
          name: 'province',
          type: 'text',
          placeholder: 'Province',
          cssClass: 'address-input'
        },
        {
          name: 'postal_code',
          type: 'text',
          placeholder: 'Postal Code',
          cssClass: 'address-input'
        },
        {
          name: 'country',
          type: 'text',
          placeholder: 'Country *',
          cssClass: 'address-input'
        }
      ],

      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            return true; // Dismiss the alert
          }
        },
        {
          text: 'Add',
          handler: (data) => {
            if (!data.address_line1 || !data.city || !data.country) {
              // Show error message for required fields
              this.showErrorToast('Please fill in all required fields.');
              return false;
            }

            const newAddress = {
              address_line1: data.address_line1,
              address_line2: data.address_line2,
              city: data.city,
              province: data.province,
              postal_code: data.postal_code,
              country: data.country
            
            };
            this.savedAddresses.push(newAddress);
            this.selectedAddress = newAddress;
            return true;
          }
        }
      
    ]
  });

  await alert.present();
}
  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  }
  

  // processedToCheckout() {
  //   if (this.deliveryMethod === 'delivery' && !this.selectedAddress) {
  //     // Show an alert or toast message
  //     console.log('Please select or add a delivery address');
  //     return;

  //   }
  //   // Proceed with checkout logic
  //   console.log('Proceeding to checkout', {
  //     deliveryMethod: this.deliveryMethod,
  //     address: this.selectedAddress,
  //     total: this.total
  //   });
  // }

  PlaceOrder = async (): Promise<void> => {
    if (this.cartItems.length === 0) {
      const alert = await this.alertController.create({
        header: 'Empty Cart',
        message: 'Your cart is empty. Add some items before placing order.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

const alert = await this.alertController.create({
  header: 'Order Placed',
  message: `Your order for R{{this.total.toFixed(2)} has been placed successfully!`,
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
  }
}
