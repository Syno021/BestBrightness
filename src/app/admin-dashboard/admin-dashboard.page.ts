// admin-dashboard.page.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {
  totalUsers: number = 0;
  totalSalesAmount: number = 0;
  pendingOrders: number = 0;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.fetchUserCount();
    this.fetchTotalSalesAmount();
    this.fetchPendingOrdersCount();
  }

  fetchUserCount() {
    this.http.get<{ user_count: number }>('http://localhost/user_api/register.php?count=true')
      .subscribe(
        response => {
          this.totalUsers = response.user_count;
        },
        error => {
          console.error('Error fetching user count:', error);
        }
      );
  }

  fetchTotalSalesAmount() {
    this.http.get<{ totalSalesAmount: number }>('http://localhost/user_api/sales.php?total_only=true')
      .subscribe(
        response => {
          this.totalSalesAmount = response.totalSalesAmount;
        },
        error => {
          console.error('Error fetching total sales amount:', error);
        }
      );
  }

  fetchPendingOrdersCount() {
    this.http.get<{ order_count: number }>('http://localhost/user_api/orders.php?count=true')
      .subscribe(
        response => {
          this.pendingOrders = response.order_count;
        },
        error => {
          console.error('Error fetching order count:', error);
        }
      );
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}