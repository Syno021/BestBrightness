import { Component, OnInit } from '@angular/core';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}
@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {

products: Product[] = [
    { id: 1, name: 'soap', price: 19.99, description: 'This is product 1' },
    { id: 2, name: 'liquid', price: 29.99, description: 'This is product 2' },
    { id: 3, name: 'cleaning attair', price: 39.99, description: 'This is product 3' },
  ];

  constructor() { }

  ngOnInit() {
  }

  addToCart(product: Product) {
    console.log(`Added ${product.name} to cart`);
    // Implement actual cart functionality here

}
}
