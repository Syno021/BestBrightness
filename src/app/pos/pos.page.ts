import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

interface Product {
  id: any;
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
  cartItems: any[] = [];


  constructor(private alertController: AlertController,
              private http: HttpClient) {}

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

async purchaseProducts() {
  try {
    if (this.cart.length === 0) {
      await this.showAlert('Error', 'Your cart is empty. Please add items before checking out.');
      return;
    }

    // Prepare the order data
    const orderData = {
      user_id: 2, // Dynamically set based on logged-in user
      total_amount: this.getTotal(),
      order_type: "walk-in",
      status: 'Pending',
      items: this.cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    console.log('Order data:', orderData); // Log order data

    // Create the order
    const orderResponse = await this.http.post<{ success: boolean, message: string, order_id: number }>(
      'http://localhost/user_api/orders.php',
      orderData
    ).toPromise();

    console.log('Order response:', orderResponse); // Log order response

    // Ensure we received a valid order_id from the backend
    if (!orderResponse || !orderResponse.success || !orderResponse.order_id) {
      throw new Error(orderResponse?.message || 'Failed to create order or retrieve order ID');
    }

    const orderId = orderResponse.order_id;
    console.log('Successfully retrieved order_id:', orderId); // Log the order_id

    // Now create the sale using the order_id from the order response
    const saleData = {
      order_id: orderId,
      cashier_id: 14, // You'll need to implement user authentication
      total_amount: this.getTotal(),
      payment_method: this.paymentType,
      amount_paid: parseFloat(this.amountPaidInput) || this.getTotal() // Use amount paid for cash, total for card
    };

    console.log('Sale data:', saleData); // Log sale data

    const saleResponse = await this.http.post<{ success: boolean, message: string, sale_id: number }>(
      'http://localhost/user_api/sales.php',
      saleData
    ).toPromise();

    console.log('Sale response:', saleResponse); // Log sale response

    if (!saleResponse || !saleResponse.success) {
      throw new Error(saleResponse?.message || 'Failed to record sale');
    }

    console.log('Sale recorded:', saleResponse);
    await this.showAlert('Transaction Complete', `Thank you for your purchase! Order ID: ${orderId}`);
    this.resetCart();
    this.isCheckoutComplete = true; // Enable the print receipt button

  } catch (error) {
    console.error('Error completing transaction:', error);
    if (error instanceof HttpErrorResponse) {
      console.error('Error details:', error.error);
    }
    await this.showAlert('Error', 'There was an error completing the transaction. Please try again.');
  }
}




resetCart() {
  this.cart = [];
  this.paymentType = '';
  this.amountPaidInput = '';
  this.isCheckoutComplete = true;
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
      // Handle other payment types (e.g., credit card) here
      const alert = await this.alertController.create({
        header: 'Checkout',
        message: `Total: R${this.getTotal().toFixed(2)}<br>Payment Type: ${this.paymentType}`,
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
  }
  
  

  handleCashPayment() {
    this.amountPaid = parseFloat(this.amountPaidInput); // Use the numpad input
    if (this.amountPaid < this.getTotal()) {
      this.showAlert('Insufficient Amount', 'The amount paid is less than the total due.');
      return;
    }
  
    const change = this.amountPaid - this.getTotal();
    const alert = this.alertController.create({
      header: 'Checkout',
      message: `Total: R${this.getTotal().toFixed(2)}<br>Amount Paid: R${this.amountPaid.toFixed(2)}<br>Change: R${change.toFixed(2)}`,
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
    
    alert.then(a => a.present());
  }

  
  
  completeTransaction() {
    this.cart.forEach(item => {
      const product = this.allProducts.find(p => p.barcode === item.barcode);
      if (product) {
        product.stock_quantity -= item.quantity!;
      }
    });

    this.showAlert('Transaction Complete', 'Thank you for your purchase!');

  this.isCheckoutComplete = true;
  this.cart = [];
  this.paymentType = '';
  this.amountPaidInput = ''; // Reset the amount paid input
}

  onBarcodeEnter() {
    const product = this.allProducts.find(p => p.barcode === this.barcodeInput);
    if (product) {
      this.addToCart(product);
      this.barcodeInput = '';
    } else {
      this.showAlert('Invalid Barcode', 'No product found with this barcode.');
    }
  }

  async printReceipt() {
    if (!this.isCheckoutComplete) {
      await this.showAlert('Cannot Print Receipt', 'Please complete the checkout process before printing the receipt.');
      return;
    }

    const formatLine = (left: string, right: string, width: number = 40) => {
      return left.padEnd(width - right.length) + right;
    };

    const formatCurrency = (amount: number) => `R${amount.toFixed(2)}`;

    let receiptContent = [
      'BEST BRIGHTNESS STORE',
      '123 Main St, City, Country',
      'Tel: (555) 123-4567',
      '----------------------------------------',
      `Date: ${new Date().toLocaleString()}`,
      `Cashier: John Doe (ID: 12345)`,
      '----------------------------------------',
      'Item                  Qty         Price',
      '----------------------------------------',
    ];

    this.cart.forEach(item => {
      const name = item.name.substring(0, 20).padEnd(20);
      const qty = item.quantity!.toString().padStart(3);
      const price = formatCurrency(item.price * item.quantity!).padStart(10);
      receiptContent.push(`${name} ${qty}    ${price}`);
    });

    const subtotal = formatCurrency(this.getSubtotal());
    const tax = formatCurrency(this.getTax());
    const total = formatCurrency(this.getTotal());

    receiptContent = receiptContent.concat([
      '----------------------------------------',
      formatLine('Subtotal:', subtotal.padStart(14)),
      formatLine('Tax (15%):', tax.padStart(14)),
      '----------------------------------------',
      formatLine('Total:', total.padStart(14)),
      '',
      `Payment: ${this.paymentType === 'cash' ? 'Cash' : 'Credit Card'}`,
      '----------------------------------------',
      'THANK YOU FOR SHOPPING WITH US!',
      '****************************************',
    ]);

    const alert = await this.alertController.create({
      header: 'Receipt',
      message: `<pre style="font-family: monospace; white-space: pre-wrap; font-size: 14px; line-height: 1.2;">${receiptContent.join('\n')}</pre>`,
      buttons: ['OK'],
      cssClass: 'receipt-alert'
    });

    await alert.present();
    this.isCheckoutComplete = false;
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