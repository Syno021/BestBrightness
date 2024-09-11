import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

interface Product {
  name: string;
  price: number;
  stock: number;
  image: string;
  barcode: string;
  category: string;
  quantity?: number; // Optional field for quantity when added to the cart
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
    const cartItem = this.cart.find(item => item.barcode === product.barcode);

    if (cartItem) {
      if (cartItem.quantity! < product.stock) {
        cartItem.quantity!++;
      } else {
        this.alertController.create({
          header: 'Out of Stock',
          message: 'Not enough stock available.',
          buttons: ['OK']
        }).then(alert => alert.present());
      }
    } else {
      if (product.stock > 0) {
        this.cart.push({ ...product, quantity: 1 });
      } else {
        this.alertController.create({
          header: 'Out of Stock',
          message: 'Product is out of stock.',
          buttons: ['OK']
        }).then(alert => alert.present());
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

  completeTransaction() {
    this.cart.forEach(item => {
      const product = this.allProducts.find(p => p.barcode === item.barcode);
      if (product) {
        product.stock -= item.quantity!;
      }
    });

    this.alertController.create({
      header: 'Transaction Complete',
      message: 'Thank you for your purchase!',
      buttons: ['OK']
    }).then(alert => alert.present());

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
