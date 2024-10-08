import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

interface User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  isLoggedIn: boolean = false;
  currentUser: User | null = null;
  userId: string | null = null;
  loading: boolean = true;
  error: string | null = null;
  private apiUrl = 'http://localhost/user_api/login.php'; // Updated to include .php extension

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.getUserId();
  }

  async getUserId() {
    this.userId = sessionStorage.getItem('userId');
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