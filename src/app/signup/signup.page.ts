import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  isRegister = false;
  userData = {
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  loginData = {
    email: '',
    password: ''
  };

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router // Inject Router
  ) {}

  ngOnInit() {
    // Initialize any necessary data or perform any required setup
  }

  async submitForm() {
    if (this.isRegister) {
      if (!this.validateForm()) {
        return;
      }

      const registerData = {
        ...this.userData,
        role: 'customer' // Automatically set the role to customer
      };

      // Send POST request to PHP API for registration
      this.http.post('http://localhost/user_api/register.php', registerData)
        .subscribe(
          async (response: any) => {
            if (response.status === 1) {
              await this.presentToast('Registration successful', 'success');
              this.clearFields();
            } else {
              await this.presentToast('Registration failed: ' + response.message, 'danger');
            }
          },
          async (error: HttpErrorResponse) => {
            console.error('Error during registration:', error);
            await this.presentToast('Error during registration: ' + error.message, 'danger');
          }
        );
    } else {
      // Send POST request to PHP API for login
      this.http.post('http://localhost/user_api/login.php', this.loginData)
        .subscribe(
          async (response: any) => {
            if (response.status === 1) {
              await this.presentToast('Login successful', 'success');
              
              // Navigate based on the role
              if (response.role === 'admin') {
                this.router.navigate(['/admin-dashboard']); // Navigate to admin dashboard
              } else if (response.role === 'cashier') {
                this.router.navigate(['/pos']); // Navigate to POS page
              } else {
                this.router.navigate(['/home']); // Navigate to home page for all other roles
              }
            } else {
              await this.presentToast('Login failed: ' + response.message, 'danger');
            }
          },
          async (error: HttpErrorResponse) => {
            console.error('Error during login:', error);
            await this.presentToast('Error during login: ' + error.message, 'danger');
          }
        );
    }
  }

  validateForm(): boolean {
    if (!this.userData.username || !this.userData.first_name || !this.userData.last_name || 
        !this.userData.email || !this.userData.password || !this.userData.confirmPassword) {
      this.presentToast('All fields are required', 'warning');
      return false;
    }

    if (this.userData.password !== this.userData.confirmPassword) {
      this.presentToast('Passwords do not match', 'danger');
      return false;
    }

    if (this.userData.password.length < 8) {
      this.presentToast('Password must be at least 8 characters long', 'warning');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.userData.email)) {
      this.presentToast('Invalid email format', 'warning');
      return false;
    }

    return true;
  }

  async presentToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  clearFields() {
    this.userData = {
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    this.loginData = {
      email: '',
      password: ''
    };
  }
}
