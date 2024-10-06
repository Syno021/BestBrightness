import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';
import { AlertController,ToastController, AlertOptions } from '@ionic/angular';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import jsPDF from 'jspdf';
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
  userId: string | null = null;

  subtotal: number = 0;
  tax: number = 0;
  total: number = 0;
  // toastController: any;
  
  private cartSubscription: Subscription | undefined;

  constructor(
    private cartService: CartService, 
     private alertController: AlertController,
     private toastController: ToastController,
     private cd: ChangeDetectorRef,
     private http: HttpClient,
     private afStorage: AngularFireStorage,
     private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.loadCart();
    this.getUserId();
  }

  getUserId() {
    this.userId = sessionStorage.getItem('userId');
    if (!this.userId) {
      console.warn('User is not logged in');
      // You might want to redirect to login page or show a message
    }
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
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.tax = this.subtotal * 0.15; // Assuming 15% tax rate
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
    try {
      if (this.cartItems.length === 0) {
        const alert = await this.alertController.create({
          header: 'Empty Cart',
          message: 'Your cart is empty. Add some items before placing order.',
          buttons: ['OK']
        });
        await alert.present();
        return;
      }
  
      console.log('Starting order placement process');
  
      // Generate PDF
      const pdf = new jsPDF();
      let yPos = 20;
  
      pdf.setFontSize(18);
      pdf.text('Order Details', 20, yPos);
      yPos += 10;
  
      pdf.setFontSize(12);
      this.cartItems.forEach((item, index) => {
        pdf.text(`${index + 1}. ${item.name} - Quantity: ${item.quantity} - Price: R${item.price.toFixed(2)}`, 20, yPos);
        yPos += 10;
      });
  
      yPos += 10;
      pdf.setFontSize(14);
      pdf.text(`Total: R${this.total.toFixed(2)}`, 20, yPos);
      yPos += 10;
      pdf.text(`Order Type: ${this.deliveryMethod}`, 20, yPos);
  
      console.log('PDF generated');
  
      // Save PDF to a Blob
      const pdfBlob = pdf.output('blob');
  
      // Upload PDF to Firebase Storage
      const filePath = `orders/${new Date().getTime()}_order.pdf`;
      const fileRef = this.afStorage.ref(filePath);
      const task = this.afStorage.upload(filePath, pdfBlob);
  
      console.log('Uploading PDF to Firebase Storage');
  
      await task;
      const downloadURL = await fileRef.getDownloadURL().toPromise();
  
      console.log('PDF uploaded successfully, URL:', downloadURL);
  
      // Prepare the order data
      const orderData = {
        user_id: this.userId,
        total_amount: this.total,
        order_type: this.deliveryMethod,
        status: 'pending',
        items: this.cartItems,
        pdf_url: downloadURL,
        created_at: new Date()
      };
  
      console.log('Order data prepared:', JSON.stringify(orderData, null, 2));
  
      // Send the order data to the PHP script
      const response = await this.http.post<{ success: boolean, message: string }>(
        'http://localhost/user_api/orders.php', 
        orderData
      ).toPromise();
  
      console.log('Full response from PHP script:', response);
  
      if (response && response.success) {
        // Generate a unique ID for Firestore (you might want to use a more robust method)
        const firestoreOrderId = new Date().getTime().toString();
  
        // Save to Firestore using the generated ID
        const firestoreOrderData = {
          ...orderData,
          firestore_order_id: firestoreOrderId
        };
  
        console.log('Saving order to Firestore with ID:', firestoreOrderId);
  
        await this.firestore.collection('orders').doc(firestoreOrderId).set(firestoreOrderData);
  
        console.log('Order saved to Firestore successfully');
  
        const alert = await this.alertController.create({
          header: 'Order Placed',
          message: `Your order for R${this.total.toFixed(2)} has been placed successfully!`,
          buttons: ['OK']
        });
        await alert.present();
  
        this.cartService.clearCart();
        this.cartItems = [];
        this.calculateTotals();
      } else {
        throw new Error('Server response indicates failure');
      }
    } catch (error) {
      console.error('Error in order placement process:', error);
      this.showToast('An error occurred while placing your order. Please try again.');
    }
  }
}
