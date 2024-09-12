import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-admin-user-management',
  templateUrl: './admin-user-management.page.html',
  styleUrls: ['./admin-user-management.page.scss'],
})
export class AdminUserManagementPage implements OnInit {
  @ViewChild('addUserModal') addUserModal?: IonModal;
  
  username: string = '';
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  role: string = 'cashier'; // Default role

  roles = [
    { value: 'cashier', label: 'Cashier' },
    { value: 'admin', label: 'Admin' }
  ];

  constructor(private http: HttpClient, private toastController: ToastController) {}

  ngOnInit() {}

  async presentAddUserModal() {
    await this.addUserModal?.present();
  }

  dismissModal() {
    this.addUserModal?.dismiss();
  }

  async submitForm() {
    const newUser = {
      username: this.generateUsername(),
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      password: this.generateUsername(), // Password same as username
      role: this.role
    };

    this.http.post<{status: number, message: string}>('http://localhost/user_api/add_user.php', newUser)
      .subscribe(async (response) => {
        if (response.status === 1) {
          await this.presentToast('User added successfully', 'success');
          this.dismissModal();
        } else {
          await this.presentToast('Error: ' + response.message, 'danger');
        }
      });
  }

  async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  generateUsername(): string {
    const prefix = this.role === 'admin' ? 'admin' : 'cashier';
    return prefix + '01'; // Simplified for demonstration; you can add uniqueness check
  }
}
