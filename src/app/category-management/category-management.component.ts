import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.scss'],
})
export class CategoryManagementComponent implements OnInit {
  categories: any[] = [];
  newCategory: string = '';

  constructor(
    private modalController: ModalController,
    private http: HttpClient,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  loadCategories() {
    this.http.get('http://localhost/user_api/categories.php').subscribe(
      (data: any) => {
        this.categories = data;
        this.presentToast('Categories loaded successfully');
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching categories:', error);
        this.presentToast('Error loading categories: ' + error.message, 'danger');
      }
    );
  }

  addCategory() {
    console.log('Current newCategory value:', this.newCategory); // This should log the value in the console
  
    if (this.newCategory && this.newCategory.trim() !== '') {
      console.log('Attempting to add category:', this.newCategory.trim()); // Log trimmed value
      this.http.post('http://localhost/user_api/categories.php', { name: this.newCategory.trim() }).subscribe(
        (response: any) => {
          console.log('Server response:', response);
          if (response.success) {
            this.loadCategories();
            this.newCategory = '';
            this.presentToast(response.message);
          } else {
            this.presentToast(response.message || 'Unknown error occurred', 'danger');
          }
        },
        (error: HttpErrorResponse) => {
          console.error('Error adding category:', error);
          this.presentToast('Error adding category: ' + (error.error?.message || error.message), 'danger');
        }
      );
    } else {
      console.log('Category name is empty or contains only whitespace');
      this.presentToast('Please enter a category name', 'warning');
    }
  }
  

  editCategory(category: any) {
    // Implement edit functionality
    this.presentToast('Edit functionality not implemented yet', 'warning');
  }

  deleteCategory(category_id: number) {
    this.http.delete(`http://localhost/user_api/categories.php?category_id=${category_id}`).subscribe(
      (response: any) => {
        if (response.success) {
          this.loadCategories();
          this.presentToast(response.message);
        } else {
          this.presentToast(response.message, 'danger');
        }
      },
      (error: HttpErrorResponse) => {
        console.error('Error deleting category:', error);
        this.presentToast('Error deleting category: ' + error.message, 'danger');
      }
    );
  }

  dismissModal() {
    this.modalController.dismiss();
  }
}