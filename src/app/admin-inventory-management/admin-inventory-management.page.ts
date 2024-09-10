import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { AlertController, ToastController } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-inventory-management',
  templateUrl: './admin-inventory-management.page.html',
  styleUrls: ['./admin-inventory-management.page.scss'],
})
export class AdminInventoryManagementPage implements OnInit {
  @ViewChild('addItemModal') addItemModal?: IonModal;

  newItem = {
    product: '',
    category: '',
    quantity: null,
    barcode: '',
    description: ''
  };

  products: any[]=[];

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    // Initialization logic can go here
    this.loadProducts();
  }

  async presentAddItemModal() {
    await this.addItemModal?.present();
  }

  dismissModal() {
    this.addItemModal?.dismiss();
  }

  loadProducts() {
    this.http.get<any[]>('http://localhost/user_api/products.php')
      .subscribe(
        data => {
          this.products = data;
        },
        (error: HttpErrorResponse) => {
          console.error('Error fetching products:', error);
          this.presentToast('Error loading products: ' + error.message, 'danger');
        }
      );
  }

  async submitForm() {
    // Send POST request to PHP API
    this.http.post('http://localhost/user_api/products.php', this.newItem)
      .subscribe(
        async (response: any) => {
          if (response.status === 1) {
            await this.presentToast('Submission successful', 'success');
            this.clearFields();  // Clear form fields after successful submission
          } else {
            await this.presentToast('Submission failed: ' + response.message, 'danger');
          }
        },
        async (error: HttpErrorResponse) => {
          console.error('Error during submission:', error);
          await this.presentToast('Error during submission: ' + error.message, 'danger');
        }
      );
  }
  

  async presentToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  clearFields() {
    this.newItem = {
      product: '',
      category: '',
      quantity: null,
      barcode: '',
      description: ''
    };
  }

  editItem(id: number) {
    // Implement edit functionality
  }

  deleteItem(id: number) {
    // Implement delete functionality
  }
}