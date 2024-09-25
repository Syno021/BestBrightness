import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { AlertController,ToastController, AlertOptions } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
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
