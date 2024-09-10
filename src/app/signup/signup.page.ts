import { Component, OnInit } from '@angular/core';
import { SignupService } from '../signup.service';
import { AlertController } from '@ionic/angular';

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

  constructor(private signUpService: SignupService, private alertController: AlertController) { }

  ngOnInit() {
  }

  async submitForm() {
    try {
      if (this.isRegister) {
        const response = await this.signUpService.register(this.userData).toPromise();
        await this.showAlert('Success', 'Registration successful!');
      } else {
        const response = await this.signUpService.login(this.userData).toPromise();
        await this.showAlert('Success', 'Login successful!');
      }
    } catch (error) {
      let errorMessage = 'An error occurred';
      
      // Type narrowing to check if error has a message property
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = JSON.stringify(error);
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
