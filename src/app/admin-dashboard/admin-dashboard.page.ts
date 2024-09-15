import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {

  totalUsers: number = 0;
  salesThisMonth: number = 0;
  pendingOrders: number = 0;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchUserCount();
    this.fetchSalesCount();
    this.fetchPendingOrdersCount();
  }

  fetchUserCount() {
    this.http.get<{ user_count: number }>('http://localhost/user_api/register.php')
      .subscribe(response => {
        this.totalUsers = response.user_count;
      });
  }

  fetchSalesCount() {
    this.http.get<{ sales_count: number }>('http://localhost/user_api/sales.php')
      .subscribe(response => {
        this.salesThisMonth = response.sales_count;
      });
  }

  fetchPendingOrdersCount() {
    this.http.get<{ pending_orders_count: number }>('http://localhost/user_api/orders.php')
      .subscribe(response => {
        this.pendingOrders = response.pending_orders_count;
      });
  }
}
