import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category: string;
  barcode: string;
  image_url: string;
  total_ratings: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
  quantity?: number;
}

@Component({
  selector: 'app-pos',
  templateUrl: 'pos.page.html',
  styleUrls: ['pos.page.scss'],
})
export class POSPage implements OnInit {
  currentDate = new Date();
  categories: Array<{ name: string, icon: string }> = [];
  selectedCategory: string = 'All';
  allProducts: Product[] = [];
  products: Product[] = [];
  cart: Product[] = [];
  barcodeInput: string = '';
  paymentType: string = '';
  isCheckoutComplete: boolean = false;
  amountPaid: number = 0;
  amountPaidInput: string = '';
  receiptVisible: boolean = false;
  receiptData: any = null;


  constructor(private alertController: AlertController, private http: HttpClient) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.http.get<Product[]>('http://localhost/user_api/products.php').subscribe({
      next: (data: Product[]) => {
        this.allProducts = data.map(product => ({
          ...product,
          price: +product.price || 0  // Convert price to a number or default to 0
        }));
        this.products = this.allProducts;
        this.extractCategories();
        console.log('Products loaded:', this.products);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading products:', error);
      }
    });
}


  extractCategories() {
    const categorySet = new Set(this.allProducts.map(product => product.category || 'Other'));
    this.categories = [{ name: 'All', icon: 'grid' }, 
      ...Array.from(categorySet).map(category => ({ name: category, icon: this.getCategoryIcon(category) }))
    ];
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'Cleaning Chemicals': return 'flask';
      case 'Cleaning Tools': return 'brush';
      case 'Equipment': return 'construct';
      case 'Paper & Disposables': return 'newspaper';
      default: return 'pricetag';
    }
  }

  searchProducts(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filterProducts(searchTerm);
  }

  onCategoryChange() {
    this.filterProducts();
}

  filterProducts(searchTerm: string = '') {
    this.products = this.allProducts.filter(product =>
      (this.selectedCategory === 'All' || product.category === this.selectedCategory) &&
      (product.name.toLowerCase().includes(searchTerm) || product.barcode.includes(searchTerm))
    );
}


addToCart(product: Product) {
  if (isNaN(product.price)) {
      console.warn(`Product ${product.name} has an invalid price`);
      this.showAlert('Invalid Price', `${product.name} has an invalid price.`);
      return;
  }

  // Proceed with adding to the cart if price is valid
  const cartItem = this.cart.find(item => item.product_id === product.product_id);
  if (cartItem) {
      if (cartItem.quantity! < product.stock_quantity) {
          cartItem.quantity!++;
      } else {
          this.showAlert('Out of Stock', 'Not enough stock available.');
      }
  } else {
      if (product.stock_quantity > 0) {
          this.cart.push({ ...product, quantity: 1 });
      } else {
          this.showAlert('Out of Stock', 'Product is out of stock.');
      }
  }
}


  removeFromCart(item: Product) {
    const cartItem = this.cart.find(cartProd => cartProd.barcode === item.barcode);

    if (cartItem && cartItem.quantity! > 1) {
      cartItem.quantity!--;
    } else {
      this.cart = this.cart.filter(cartProd => cartProd.barcode !== item.barcode);
    }
  }

  getSubtotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity!), 0);
  }

  getTax() {
    return this.getSubtotal() * 0.15; // Assuming 15% VAT
  }

  getTotal() {
    return this.getSubtotal() + this.getTax();
  }

  async checkout() {
    if (!this.paymentType) {
      await this.showAlert('Payment Type Required', 'Please select a payment type before checkout.');
      return;
    }
  
    if (this.paymentType === 'cash') {
      if (!this.amountPaidInput) {
        await this.showAlert('Amount Required', 'Please enter the amount paid for cash transactions.');
        return;
      }
      this.handleCashPayment();
    } else {
      this.showCheckoutAlert();
    }
  }
  
  

  async handleCashPayment() {
    this.amountPaid = parseFloat(this.amountPaidInput);
    const total = this.getTotal();
    if (this.amountPaid < total) {
      this.showAlert('Insufficient Amount', 'The amount paid is less than the total due.');
      return;
    }
  
    const change = this.amountPaid - total;
  
    // Create an alert with the payment details
    const alert = await this.alertController.create({
      header: 'Checkout',
      message: `
        Total: R${total.toFixed(2)}
<br>
        Amount Paid: R${this.amountPaid.toFixed(2)}
<br>
        Change: R${change.toFixed(2)}
      `,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: () => {
            this.completeTransaction();
          }
        }
      ]
    });
  
    await alert.present();
  }
  
  // Method to show the checkout alert for non-cash payments
  async showCheckoutAlert() {
    const total = this.getTotal();
  
    const alert = await this.alertController.create({
      header: 'Checkout',
      message: `
        Total: R${total.toFixed(2)}
      `,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: () => {
            this.completeTransaction();
          }
        }
      ]
    });
  
    await alert.present();
  }

  
  
  completeTransaction() {
    this.prepareReceiptData();
    this.isCheckoutComplete = true;
    // Reset cart and other necessary states
    this.cart = [];
    this.paymentType = '';
    this.amountPaidInput = '';
  }

  prepareReceiptData() {
    const total = this.getTotal();
    const change = this.paymentType === 'cash' ? this.amountPaid - total : 0;
    
    this.receiptData = {
      date: new Date().toLocaleString(),
      cashier: 'John Doe',
      cashierId: '12345',
      items: [...this.cart],
      subtotal: this.getSubtotal(),
      tax: this.getTax(),
      total: total,
      paymentType: this.paymentType,
      amountPaid: this.paymentType === 'cash' ? this.amountPaid : null, // Show amount paid only for cash payments
      change: this.paymentType === 'cash' ? change : null // Include change only for cash payments
    };
  }
  

  // hideReceipt() {
  //   this.receiptVisible = false;
  //   this.receiptData = null;
  // }


  onBarcodeEnter() {
    const product = this.allProducts.find(p => p.barcode === this.barcodeInput);
    if (product) {
      this.addToCart(product);
      this.barcodeInput = '';
    } else {
      this.showAlert('Invalid Barcode', 'No product found with this barcode.');
    }
  }

 printReceipt() {
    if (!this.isCheckoutComplete) {
      this.showAlert('Cannot Print Receipt', 'Please complete the checkout process before printing the receipt.');
      return;
    }
    this.receiptVisible = true;
  }

  hideReceipt() {
    this.receiptVisible = false;
  }
  
  appendToNumpad(value: string) {
    if (value === 'C') {
      this.clearNumpad();
    } else if (value === 'Enter') {
      this.onBarcodeEnter();
    } else {
      // Check if the payment type is cash and append to amountPaidInput
      if (this.paymentType === 'cash') {
        this.amountPaidInput += value; // Append the value to the amount paid
      } else {
        this.barcodeInput += value; // Append to barcode input
      }
    }
  }

  clearNumpad() {
    // Clear the appropriate input based on payment type
    if (this.paymentType === 'cash') {
      this.amountPaidInput = ''; // Clear amount paid input
    } else {
      this.barcodeInput = ''; // Clear barcode input
    }
  }
  
  submitNumpad() {
    if (this.isCheckoutComplete) {
      this.handleCashPayment();  // Handle the payment when "Enter" is pressed during checkout
    } else {
      this.onBarcodeEnter();     // Handle barcode entry
    }
  }
  

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}