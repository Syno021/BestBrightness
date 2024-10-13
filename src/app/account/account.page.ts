import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface Order {
  order_id: number;
  user_id: number;
  total_amount: string;
  order_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  isLoggedIn: boolean = false;
  currentUser: User | null = null;
  orders: Order[] = [];
  userId: string | null = null;
  loading: boolean = true;
  ordersLoading: boolean = true;
  error: string | null = null;
  ordersError: string | null = null;
  private apiUrl = 'http://localhost/user_api/login.php';
  private ordersApiUrl = 'http://localhost/user_api/orders.php';

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.getUserId();
  }

  async getUserId() {
    this.userId = sessionStorage.getItem('userId');
    console.log('Stored userId in sessionStorage:', this.userId);  // Log the userId to check
    if (!this.userId) {
      this.isLoggedIn = false;
      await this.presentToast('You need to log in to view your account', 'warning');
      this.router.navigate(['/home']);
      return;
    }
    
    this.fetchUserDetails();
  }
  
  private fetchUserDetails() {
    if (!this.userId) return;

    this.loading = true;
    this.http.get<User>(`${this.apiUrl}?user_id=${this.userId}`).subscribe({
      next: async (user) => {
        this.currentUser = user;
        this.isLoggedIn = true;
        this.loading = false;
        await this.presentToast('User details loaded successfully', 'success');
        this.fetchOrders(); // Fetch orders after user details are loaded
      },
      error: async (error: HttpErrorResponse) => {
        this.error = 'Failed to load user details';
        this.loading = false;
        
        let errorMessage = 'An error occurred while loading user details';
        if (error.status === 404) {
          errorMessage = 'User not found';
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to the server. Please check if the server is running.';
        }
        
        await this.presentToast(errorMessage, 'danger');
        console.error('Error fetching user details:', error);
      }
    });
  }

  private fetchOrders() {
    if (!this.userId) return;
  
    this.ordersLoading = true;
    const userIdNumber = Number(this.userId);  // Convert to number
  
    console.log('Fetching orders for userId:', userIdNumber);  // Add this log
  
    this.http.get<{ orderData: Order[] }>(`${this.ordersApiUrl}?user_id=${this.userId}`).pipe(
      map(response => {
        console.log('Raw API response:', response);  // Log the full API response
        const filteredOrders = response.orderData.filter(order => order.user_id === userIdNumber);
        console.log('Filtered orders:', filteredOrders);  // Log filtered orders
        return filteredOrders;
      }),
      catchError(error => {
        console.error('Error fetching orders:', error);
        this.ordersError = 'Failed to load orders';
        return of([]); // Return an empty array on error
      })
    ).subscribe({
      next: (orders) => {
        this.orders = orders;
        if (this.orders.length === 0) {
          console.log('No orders found for this user');
          this.ordersError = 'No Orders Found';
        }
        this.ordersLoading = false;
      },
      error: (error) => {
        console.error('Error processing orders:', error);
        this.ordersError = 'Failed to load orders';
        this.ordersLoading = false;
      }
    });
  }
  
  async logout() {
    sessionStorage.removeItem('userId');
    this.isLoggedIn = false;
    this.currentUser = null;
    await this.presentToast('You have logged out successfully', 'success');
    this.router.navigate(['/login']);
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
