import { Component, OnInit } from '@angular/core';
import { SignupService } from '../signup.service';
import { AlertController } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  isRegister = false;  // Toggle between registration and login

  userData = {
    name: '',
    surname: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private signUpService: SignupService, private alertController: AlertController) { }

  ngOnInit() {}

  async submitForm() {
    try {
      if (this.isRegister) {
        console.log('Attempting registration...');
        const response = await this.signUpService.register(this.userData).toPromise();
        console.log('Registration successful:', response);  // Log success response
        await this.showAlert('Success', 'Registration successful!');
      } else {
        console.log('Attempting login...');
        const response = await this.signUpService.login(this.userData).toPromise();
        console.log('Login successful:', response);  // Log success response
        await this.showAlert('Success', 'Login successful!');
      }
    } catch (error: unknown) {
      // Type narrowing: identify if it's an error or ProgressEvent
      console.error('Error during form submission:', error);  // Log error
  
      let errorMessage = 'An error occurred';
  
      if (error instanceof HttpErrorResponse) {
        errorMessage = `HTTP Error: ${error.status} - ${error.statusText}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error instanceof ProgressEvent) {
        errorMessage = 'Network error. Please check the backend server.';
      } else {
        errorMessage = 'An unexpected error occurred';
      }
  
      await this.showAlert('Error', errorMessage);
    }
  }
  

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }
}
