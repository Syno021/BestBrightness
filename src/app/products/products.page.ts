import { Component, OnInit,ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController,IonSearchbar } from '@ionic/angular';
import { CartService } from '../services/cart.service';
import { NavController } from '@ionic/angular';



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
    { id: 1, name: 'Pine Gel', price: 19.99, description: 'High-quality pine gel', image: 'assets/pinegel.jpg', rating: 5, category: 'Personal Care' },
    { id: 2, name: 'Broom and Dustpan', price: 29.99, description: 'Multipurpose liquid cleaner', image: 'assets/broom.jpg', rating: 5, category: 'Cleaning Supplies' },
    { id: 3, name: 'Cleaning Cloth', price: 39.99, description: 'Microfiber cleaning cloth', image: 'assets/cloth.jpg', rating: 4, category: 'Cleaning Supplies' },
    { id: 4, name: 'Gloves', price: 40.99, description: 'Durable cleaning gloves', image: 'assets/gloves.jpg', rating: 3, category: 'Personal Care' },
    { id: 5, name: 'Toilet Cleaner', price: 90.99, description: 'Protective face mask', image: 'assets/all.webp', rating: 5, category: 'Personal Care' },
    { id: 6, name: 'Pressure Cleaner', price: 50.99, description: 'High-pressure cleaner for heavy-duty cleaning', image: 'assets/cleaner.jpg', rating: 5, category: 'Cleaning Equipment' },
    { id: 7, name: 'Mop', price: 18.99, description: 'High-quality mop', image: 'assets/mop.jpg', rating: 5, category: 'Personal Care' },
    { id: 8, name: 'Toilet Brush', price: 59.99, description: 'Multipurpose liquid cleaner', image: 'assets/brush.jpg', rating: 5, category: 'Cleaning Supplies' },
    { id: 9, name: 'Bucket and Mop', price: 159.99, description: 'Microfiber cleaning cloth', image: 'assets/bucket.jpg', rating: 5, category: 'Cleaning Supplies' },
   
  ];

  // Filtered product list
  filteredProducts: Product[] = this.products;

  // Categories and sorting options
  categories: string[] = ['All', ...new Set(this.products.map(product => product.category))];
  selectedCategory: string = 'All';
  sortOption: string = 'name';

  constructor(private cartservice: CartService, private toastController: ToastController, private router: Router) { }

  ngOnInit() {
    this.applyFilters();
  }

  // Search for products based on search term
  


  searchProducts() {
    this.applyFilters();
  }

  navigateToCart() {
    this.router.navigate(['/cart']);
  }

  // Filter products by category
  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  // Sort products by the selected option
  sortProducts(option: string) {
    this.sortOption = option;
    this.applyFilters();
  }

  // Apply search, category filter, and sorting to the product list
  applyFilters() {
    const searchTerm = this.searchbar ? this.searchbar.value?.toLowerCase() ?? '' : '';

    // Filter products by category and search term
    this.filteredProducts = this.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm)
    );
  
    // this.filteredProducts = this.products.filter(product => 
    //   (this.selectedCategory === 'All' || product.category === this.selectedCategory) &&
    //   product.name.toLowerCase().includes(searchTerm)
    // );



    // Sort products based on the selected option
    switch (this.sortOption) {
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

  // Add product to cart and show a toast notification
  async addToCart(product: Product) {
    this.cartservice.addToCart(product);

    const toast = await this.toastController.create({
      message: `${product.name} added to cart`,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}
