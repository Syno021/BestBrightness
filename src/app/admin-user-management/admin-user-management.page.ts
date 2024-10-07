import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ToastController, AlertController } from '@ionic/angular';

interface User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-admin-user-management',
  templateUrl: './admin-user-management.page.html',
  styleUrls: ['./admin-user-management.page.scss'],
})
export class AdminUserManagementPage implements OnInit {
  @ViewChild(IonModal) addUserModal!: IonModal; // Using ! to ensure the modal is initialized

  // Form fields
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  role: string = 'cashier'; // Default role

  // Roles for the role selector
  roles = [
    { value: 'cashier', label: 'Cashier' },
    { value: 'admin', label: 'Admin' }
  ];

  // Search and filter variables
  searchQuery: string = '';
  selectedFilter: string = 'admin';

  users: any[] = [];
  filteredUsers: any[] = [];

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.fetchUsers();
  }

  // Method to open the modal
  async presentAddUserModal() {
    await this.addUserModal?.present();
  }

  // Method to close the modal
  dismissModal() {
    this.addUserModal?.dismiss();
  }

  // Method to handle form submission
  async submitForm() {
    if (this.firstName && this.lastName && this.email) {
      const username = this.generateUsername();
      const newUser = {
        username: username,
        first_name: this.firstName,
        last_name: this.lastName,
        email: this.email,
        password: username, // Password same as username
        role: this.role
      };
      console.log(newUser);

      this.http.post<{status: number, message: string}>('http://localhost/user_api/register.php', newUser)
        .subscribe(async (response) => {
          if (response.status === 1) {
            await this.presentToast('User added successfully', 'success');
            this.dismissModal();
            this.clearForm(); // Clear form after submission
            this.fetchUsers(); // Refresh user list
          } else {
            await this.presentToast('Error: ' + response.message, 'danger');
          }
        });
    } else {
      await this.presentToast('Please fill all the fields', 'danger');
    }
  }

  // Method to present a toast
  async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  // Method to generate a username based on the role
  generateUsername(): string {
    const prefix = this.role === 'admin' ? 'admin' : 'cashier';
    return prefix + Math.floor(1000 + Math.random() * 9000); // Generates random 4-digit number for uniqueness
  }

  // Clear form fields after submission
  clearForm() {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.role = 'cashier'; // Reset role to default
  }

  // Method to fetch users based on selected filter
  fetchUsers() {
    const role = this.selectedFilter;

    this.http.get<any[]>(`http://localhost/user_api/register.php?role=${role}`)
      .subscribe((response) => {
        if (Array.isArray(response)) {
          this.users = response;
          this.filterUsers();
        } else {
          this.presentToast('Error fetching users', 'danger');
        }
      }, (error) => {
        this.presentToast('Error fetching users', 'danger');
      });
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = 
        user.first_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesRole = this.selectedFilter === 'all' || user.role.toLowerCase() === this.selectedFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }

  // Method to delete a user
  deleteUser(userId: number) {
    this.http.delete<{status: number, message: string}>(`http://localhost/user_api/register.php?user_id=${userId}`)
      .subscribe(async (response) => {
        if (response.status === 1) {
          await this.presentToast('User deleted successfully', 'success');
          this.fetchUsers(); // Refresh user list
        } else {
          await this.presentToast('Error: ' + response.message, 'danger');
        }
      });
  }

  // Method to edit a user
  async editUser(user: User) {
    const alert = await this.alertController.create({
      header: 'Edit Customer',
      inputs: [
        { name: 'username', type: 'text', value: user.username, placeholder: 'Username' },
        { name: 'first_name', type: 'text', value: user.first_name, placeholder: 'First Name' },
        { name: 'last_name', type: 'text', value: user.last_name, placeholder: 'Last Name' },
        { name: 'email', type: 'text', value: user.email, placeholder: 'Email' },
        { name: 'role', type: 'text', value: user.role, placeholder: 'Role' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data) => {
            this.http.put<{status: number, message: string}>(`http://localhost/user_api/register.php?user_id=${user.user_id}`, data)
              .subscribe(
                async (response) => {
                  if (response.status === 1) {
                    await this.presentToast('Customer updated successfully', 'success');
                    this.fetchUsers();
                  } else {
                    await this.presentToast('Update failed: ' + response.message, 'danger');
                  }
                },
                async (error: HttpErrorResponse) => {
                  console.error('Error during update:', error);
                  await this.presentToast('Error during update: ' + error.message, 'danger');
                }
              );
          }
        }
      ]
    });
    await alert.present();
  }
}
