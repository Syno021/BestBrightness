import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { AlertController, ToastController } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

interface Product {
  product_id: number;
  name: string;
  category: string;
  stock_quantity: number;
  barcode: string;
  description: string;
  price: number;
  image_url: string;
}

@Component({
  selector: 'app-admin-inventory-management',
  templateUrl: './admin-inventory-management.page.html',
  styleUrls: ['./admin-inventory-management.page.scss'],
})
export class AdminInventoryManagementPage implements OnInit {
  @ViewChild('addItemModal') addItemModal?: IonModal;
  
  newItem: Product = {
    product_id: 0,
    name: '',
    category: '',
    stock_quantity: 0,
    barcode: '',
    description: '',
    price: 0,
    image_url: ''
  };
  
  products: Product[] = [];
  fastMoving: Product[] = [];
  slowMoving: Product[] = [];
  lowStockAlert: Product[] = [];

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadProducts();
  }

  async presentAddItemModal() {
    await this.addItemModal?.present();
  }

  dismissModal() {
    this.addItemModal?.dismiss();
    this.clearFields();
  }

  loadProducts() {
    this.http.get<Product[]>('http://localhost/user_api/products.php')
      .subscribe(
        data => {
          this.products = data;
          this.updateProductLists();
        },
        (error: HttpErrorResponse) => {
          console.error('Error fetching products:', error);
          this.presentToast('Error loading products: ' + error.message, 'danger');
        }
      );
  }

  updateProductLists() {
    const sortedProducts = [...this.products].sort((a, b) => b.stock_quantity - a.stock_quantity);
    this.fastMoving = sortedProducts.slice(0, 5);
    this.slowMoving = sortedProducts.slice(-5).reverse();
    this.lowStockAlert = this.products.filter(p => p.stock_quantity < 75);
  }

  async submitForm() {
    this.http.post<{status: number, message: string}>('http://localhost/user_api/products.php', this.newItem)
      .subscribe(
        async (response) => {
          if (response.status === 1) {
            await this.presentToast('Product added successfully', 'success');
            this.dismissModal();
            this.loadProducts();
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
      product_id: 0,
      name: '',
      category: '',
      stock_quantity: 0,
      barcode: '',
      description: '',
      price: 0,
      image_url: ''
    };
  }

  async editItem(product: Product) {
    const alert = await this.alertController.create({
      header: 'Edit Product',
      inputs: [
        { name: 'name', type: 'text', value: product.name, placeholder: 'Product Name' },
        { name: 'category', type: 'text', value: product.category, placeholder: 'Category' },
        { name: 'stock_quantity', type: 'number', value: product.stock_quantity, placeholder: 'Quantity' },
        { name: 'barcode', type: 'text', value: product.barcode, placeholder: 'Barcode' },
        { name: 'description', type: 'textarea', value: product.description, placeholder: 'Description' },
        { name: 'price', type: 'number', value: product.price, placeholder: 'Price' },
        { name: 'image_url', type: 'text', value: product.image_url, placeholder: 'Image URL' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data) => {
            this.http.put<{status: number, message: string}>(`http://localhost/user_api/products.php?id=${product.product_id}`, data)
              .subscribe(
                async (response) => {
                  if (response.status === 1) {
                    await this.presentToast('Product updated successfully', 'success');
                    this.loadProducts();
                  } else {
                    await this.presentToast('Update failed: ' + response.message, 'danger');
                  }
                },
                async (error: HttpErrorResponse) => {
                  console.error('Error during update:', error);
                  await this.presentToast('Error during update: ' + error.message, 'danger');
                }
              );
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteItem(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this product?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: () => {
            this.http.delete<{status: number, message: string}>(`http://localhost/user_api/products.php?id=${id}`)
              .subscribe(
                async (response) => {
                  if (response.status === 1) {
                    await this.presentToast('Product deleted successfully', 'success');
                    this.loadProducts();
                  } else {
                    await this.presentToast('Deletion failed: ' + response.message, 'danger');
                  }
                },
                async (error: HttpErrorResponse) => {
                  console.error('Error during deletion:', error);
                  await this.presentToast('Error during deletion: ' + error.message, 'danger');
                }
              );
          }
        }
      ]
    });
    await alert.present();
  }
}