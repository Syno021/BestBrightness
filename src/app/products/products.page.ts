import { Component, OnInit,ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController,IonSearchbar } from '@ionic/angular';
import { CartService } from '../services/cart.service';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  rating: number;
  isSale?: boolean;
  category: string;
  
}
@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {

  @ViewChild(IonSearchbar) searchbar!: IonSearchbar;

products: Product[] = [
    { id: 1, name: 'soap', price: 19.99, description: 'This is product 1',image:'', rating:5, category:''},
    { id: 2, name: 'liquid', price: 29.99, description: 'This is product 2',image:'', rating:5, category:'' },
    { id: 3, name: 'liquid', price: 29.99, description: 'This is product 3',image:'', rating:5, category:'' },
    { id: 4, name: 'cloth', price: 39.99, description: 'This is product 4',image:'' ,rating:4, category:'' },
    { id: 5, name: 'gloves', price: 40.99, description: 'This is product 5',image:'' ,rating:3, category:'' },
    { id: 6, name: 'mask', price: 90.99, description: 'This is product 6',image:'' ,rating:5, category:'' },
    { id: 7, name: 'plastic bin', price: 60.99, description: 'This is product 7',image:'' ,rating:3, category:'' },
    { id: 8, name: 'bottle chemi', price: 55.99, description: 'This is product 8',image:'' ,rating:4, category:'' },
    { id: 9, name: 'pressure cleaner', price: 50.99, description: 'This is product 9',image:'' ,rating:5, category:'' },
  ];

  filteredProducts: Product[] = this.products;
  categories: string[] = ['All', ...new Set(this.products.map(product => product.category))];
  selectedCategory: string = 'All';
  sortOption: string = 'name';


  constructor(private cartservice: CartService, private toastController: ToastController) { }

  ngOnInit() {
    this.applyFilters();
  }

  
  // applyFilters() {
  //   throw new Error('Method not implemented.');
  // }

  searchProducts() {
    this.applyFilters()
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  sortProducts(option: string) {
    this.sortOption = option;
    this.applyFilters();
  }

 applyFilters() {
    const searchTerm = this.searchbar ? this.searchbar.value?.toLowerCase()?? '' : '';
    
    this.filteredProducts = this.products.filter(product => 
      (this.selectedCategory === 'All' || product.category === this.selectedCategory) &&
      product.name.toLowerCase().includes(searchTerm)
    );

switch(this.sortOption) {
  case 'name':
    this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    break;
  case 'price_low_high':
    this.filteredProducts.sort((a, b) => a.price - b.price);
    break;
  case 'price_high_low':
    this.filteredProducts.sort((a, b) => b.price - a.price);
    break;
  case 'rating':
    this.filteredProducts.sort((a, b) => b.rating - a.rating);
    break;
}
 }
async addToCart(product: any) {
  this.cartservice.addToCart(product);

  const toast = await this.toastController.create({
    message: `${product.name} added to cart`,
    duration: 2000,
    position: 'bottom'
  });
  toast.present();
}
}
