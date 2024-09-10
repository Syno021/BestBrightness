import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  isRegister = false;
  userData = {
    name: '',
    surname: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Initialize any necessary data or perform any required setup
  }

  async submitForm() {
    if (this.isRegister) {
      if (!this.validateForm()) {
        return;
      }

      // Send POST request to PHP API
      this.http.post('http://localhost/user_api/register.php', this.userData)
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
      await this.presentToast('Login functionality not implemented yet', 'warning');
    }
  }

  validateForm(): boolean {
    if (!this.userData.name || !this.userData.surname || !this.userData.email || 
        !this.userData.address || !this.userData.password || !this.userData.confirmPassword) {
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
      name: '',
      surname: '',
      email: '',
      address: '',
      password: '',
      confirmPassword: ''
    };
  }
}