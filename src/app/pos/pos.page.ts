import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

interface Product {
  name: string;
  price: number;
  stock: number;
  image: string;
  barcode: string;
  category: string;
}

@Component({
  selector: 'app-pos',
  templateUrl: 'pos.page.html',
  styleUrls: ['pos.page.scss'],
})
export class POSPage implements OnInit {
  currentDate = new Date();
  categories = [
    { name: 'Cleaning Chemicals', icon: 'flask' },
    { name: 'Cleaning Tools', icon: 'brush' },
    { name: 'Equipment', icon: 'construct' },
    { name: 'Paper & Disposables', icon: 'newspaper' },
  ];
  allProducts: Product[] = [
    { name: 'All-Purpose Cleaner', price: 149.99, stock: 50, image: 'assets/cleaner.jpg', barcode: '1001', category: 'Cleaning Chemicals' },
    { name: 'Glass Cleaner', price: 89.99, stock: 40, image: 'assets/glass-cleaner.jpg', barcode: '1002', category: 'Cleaning Chemicals' },
    { name: 'Mop', price: 199.99, stock: 30, image: 'assets/mop.jpg', barcode: '2001', category: 'Cleaning Tools' },
    { name: 'Broom', price: 129.99, stock: 25, image: 'assets/broom.jpg', barcode: '2002', category: 'Cleaning Tools' },
    { name: 'Vacuum Cleaner', price: 2999.99, stock: 10, image: 'assets/vacuum.jpg', barcode: '3001', category: 'Equipment' },
    { name: 'Floor Polisher', price: 3999.99, stock: 5, image: 'assets/polisher.jpg', barcode: '3002', category: 'Equipment' },
    { name: 'Paper Towels', price: 79.99, stock: 100, image: 'assets/paper-towels.jpg', barcode: '4001', category: 'Paper & Disposables' },
    { name: 'Trash Bags', price: 59.99, stock: 150, image: 'assets/trash-bags.jpg', barcode: '4002', category: 'Paper & Disposables' },
  ];
  products: Product[] = this.allProducts;
  cart: Product[] = [];
  barcodeInput: string = '';
  paymentType: string = '';
  isCheckoutComplete: boolean = false;

  constructor(private alertController: AlertController) {}

  ngOnInit() {}

  searchProducts(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.products = this.allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm) || 
      product.barcode.includes(searchTerm)
    );
  }

  selectCategory(category: any) {
    this.products = this.allProducts.filter(product => product.category === category.name);
  }

  addToCart(product: Product) {
    this.cart.push({...product});
  }

  removeFromCart(item: Product) {
    const index = this.cart.indexOf(item);
    if (index > -1) {
      this.cart.splice(index, 1);
    }
  }

  getSubtotal() {
    return this.cart.reduce((total, item) => total + item.price, 0);
  }

  getTax() {
    return this.getSubtotal() * 0.15; // Assuming 15% VAT
  }

  getTotal() {
    return this.getSubtotal() + this.getTax();
  }

  setPaymentType(type: string) {
    this.paymentType = type;
  }

  async checkout() {
    if (!this.paymentType) {
      const alert = await this.alertController.create({
        header: 'Payment Type Required',
        message: 'Please select a payment type before checkout.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

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

  async completeTransaction() {
    const alert = await this.alertController.create({
      header: 'Transaction Complete',
      message: 'Thank you for your purchase!',
      buttons: ['OK']
    });

    await alert.present();
    this.isCheckoutComplete = true;
    this.cart = []; // Clear the cart
    this.paymentType = ''; // Reset payment type
  }

  onBarcodeEnter() {
    const product = this.allProducts.find(p => p.barcode === this.barcodeInput);
    if (product) {
      this.addToCart(product);
      this.barcodeInput = ''; // Clear the input
    } else {
      // Show an alert for invalid barcode
      this.alertController.create({
        header: 'Invalid Barcode',
        message: 'No product found with this barcode.',
        buttons: ['OK']
      }).then(alert => alert.present());
    }
  }

  async printReceipt() {
    if (!this.isCheckoutComplete) {
      const alert = await this.alertController.create({
        header: 'Cannot Print Receipt',
        message: 'Please complete the checkout process before printing the receipt.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
  
    // Store header and info
    let receiptContent = '******************************\n';
    receiptContent += '      BEST BRIGHTNESS STORE\n';
    receiptContent += '  123 Main St, City, Country\n';
    receiptContent += '      Tel: (555) 123-4567\n';
    receiptContent += '******************************\n\n';
  
    receiptContent += 'Date: ' + new Date().toLocaleString() + '\n';
    receiptContent += 'Cashier: John Doe (ID: 12345)\n';
    receiptContent += '------------------------------\n';
    receiptContent += 'Item                Qty   Price\n';
    receiptContent += '------------------------------\n';
  
    // Format each item with fixed-width style for alignment
    this.cart.forEach(item => {
      const name = item.name.substring(0, 16).padEnd(16, ' '); // Name truncated to 16 chars max
      const qty = '1'.padStart(4, ' '); // Right-aligned quantity
      const price = `R${item.price.toFixed(2)}`.padStart(8, ' '); // Right-aligned price
      receiptContent += `${name}${qty}${price}\n`;
    });
  
    receiptContent += '------------------------------\n';
    
    // Subtotal, tax, and total breakdown with right-aligned values
    const subtotal = `R${this.getSubtotal().toFixed(2)}`.padStart(10, ' ');
    const tax = `R${this.getTax().toFixed(2)}`.padStart(10, ' ');
    const total = `R${this.getTotal().toFixed(2)}`.padStart(10, ' ');
  
    receiptContent += `Subtotal:         ${subtotal}\n`;
    receiptContent += `Tax (15%):        ${tax}\n`;
    receiptContent += '------------------------------\n';
    receiptContent += `Total:            ${total}\n\n`;
  
    receiptContent += 'Payment Method: ' + (this.paymentType === 'cash' ? 'Cash' : 'Credit Card') + '\n';
    receiptContent += '------------------------------\n';
    receiptContent += '  THANK YOU FOR SHOPPING WITH US!\n';
    receiptContent += '******************************';
  
    // Display the receipt in a preformatted block for consistent styling
    const alert = await this.alertController.create({
      header: 'Receipt',
      message: `<pre>${receiptContent}</pre>`, // Using <pre> to preserve formatting
      buttons: ['OK']
    });
  
    await alert.present();
    this.isCheckoutComplete = false; // Reset checkout status after printing
  }  
  

  appendToNumpad(value: string) {
    this.barcodeInput += value;
  }

  clearNumpad() {
    this.barcodeInput = '';
  }

  submitNumpad() {
    this.onBarcodeEnter();
  }
}