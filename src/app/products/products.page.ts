import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ToastController, IonSearchbar } from '@ionic/angular';
import { CartService } from '../services/cart.service';
import { NavController } from '@ionic/angular';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  total_ratings: number; // Track total number of ratings
  average_rating: number; // Track average rating
  isSale?: boolean;
  category: string;
  image_url?: string; // Allow image_url to be optional
}

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {
  @ViewChild(IonSearchbar) searchbar!: IonSearchbar;

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = ['All'];
  selectedCategory: string = 'All';
  sortOption: string = 'name';

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private navCtrl: NavController,
    private toastController: ToastController,
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  // Fetch products from MySQL
  loadProducts() {
    this.http.get<Product[]>('http://localhost/user_api/products.php').subscribe({
      next: (data: Product[]) => {
        this.products = data;
        this.filteredProducts = this.products;
        this.extractCategories(); // Extract categories based on products
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading products:', error);
      }
    });
  }

  // Extract categories from products for the category filter
  extractCategories() {
    this.categories = ['All', ...new Set(this.products.map(product => product.category))];
  }

  // Method to handle product rating and update total_ratings and average_rating
  rateProduct(product: Product, rating: number) {
    const updatedProduct = { ...product };
    const newTotalRatings = updatedProduct.total_ratings + 1;
    const newAverage_rating = ((updatedProduct.average_rating * updatedProduct.total_ratings) + rating) / newTotalRatings;

    // Send the rating to the back-end
    this.http.post(`http://localhost/user_api/rate_product.php`, {
      product_id: product.id,
      rating: rating
    }).subscribe({
      next: (response) => {
        // Update product total_ratings and average locally
        updatedProduct.total_ratings = newTotalRatings;
        updatedProduct.average_rating = newAverage_rating;

        // Update locally without refreshing the entire page
        this.products = this.products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        this.applyFilters(); // Re-apply filters to update displayed data
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error rating product:', error);
      }
    });
  }

  // Search for products based on search term
  searchProducts() {
    this.applyFilters();
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
    const searchTerm = this.searchbar?.value?.toLowerCase() || '';

    // Filter products by search term and category
    this.filteredProducts = this.products.filter((product) =>
      (this.selectedCategory === 'All' || product.category === this.selectedCategory) &&
      product.name.toLowerCase().includes(searchTerm)
    );

    // Sort products
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
        this.filteredProducts.sort((a, b) => b.average_rating - a.average_rating);
        break;
    }
  }

  // Add product to cart and show a toast notification
  async addToCart(product: Product) {
    this.cartService.addToCart(product);
    const toast = await this.toastController.create({
      message: `${product.name} added to cart`,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }

  // Navigate to cart page
  navigateToCart() {
    this.navCtrl.navigateForward('/cart');
  }
}
