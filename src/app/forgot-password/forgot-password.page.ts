import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // For making HTTP requests
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage {
  email: string = '';

  constructor(
    private http: HttpClient,
    private alertController: AlertController
  ) {}

  async sendPasswordReset(event: Event) {
    event.preventDefault();

    // POST request to the PHP API
    this.http.post('http://localhost/forgot-password.php', { email: this.email })
      .subscribe(
        async (response: any) => {
          await this.showAlert('Success', response.message);
        },
        async (error) => {
          await this.showAlert('Error', 'Something went wrong.');
        }
      );
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
