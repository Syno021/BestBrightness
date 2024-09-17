import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-order-management',
  templateUrl: './admin-order-management.page.html',
  styleUrls: ['./admin-order-management.page.scss'],
})
export class AdminOrderManagementPage implements OnInit {

  orderData: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.http.get<{ orderData: any[] }>('http://localhost/user_api/orders.php')
      .subscribe(response => {
        this.orderData = response.orderData;
      });
  }
}
