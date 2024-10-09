import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController, IonModal } from '@ionic/angular';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-cashier',
  templateUrl: './cashier.page.html',
  styleUrls: ['./cashier.page.scss'],
})
export class CashierPage implements OnInit {
  @ViewChild('updateStatusModal') updateStatusModal!: IonModal;
  
  orderData: any[] = [];
  selectedStatus: string = '';
  currentOrder: any = null;

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.http.get<{ orderData: any[] }>('http://localhost/user_api/orders.php')
      .subscribe(
        response => {
          this.orderData = response.orderData;
        },
        error => {
          console.error('Error fetching orders:', error);
          this.presentToast('Failed to fetch orders', 'danger');
        }
      );
  }

  async viewOrderDetails(order: any) {
    const alert = await this.alertController.create({
      header: 'Order Details',
      message: `Order ID: ${order.order_id}<br>
                User ID: ${order.user_id}<br>
                Amount: ${order.total_amount}<br>
                Status: ${order.status}<br>
                Date: ${order.created_at}`,
      buttons: ['OK']
    });

    await alert.present();
  }

  async openUpdateStatusModal(order: any) {
    this.currentOrder = order;
    this.selectedStatus = order.status;
    this.updateStatusModal.present();
  }

  updateOrderStatus() {
    if (!this.currentOrder || !this.selectedStatus) {
      this.presentToast('Please select a status', 'danger');
      return;
    }

    const updateData = {
      status: this.selectedStatus
    };

    this.http.put(`http://localhost/user_api/orders.php?id=${this.currentOrder.order_id}`, updateData)
      .pipe(
        catchError(error => {
          console.error('Error updating order status:', error);
          this.presentToast('Failed to update order status', 'danger');
          return throwError(() => error);
        })
      )
      .subscribe((response: any) => {
        if (response.success) {
          this.presentToast('Order status updated successfully', 'success');
          this.fetchOrders();
          this.updateStatusModal.dismiss();
        } else {
          this.presentToast(response.message || 'Failed to update order status', 'danger');
        }
      });
  }

  async deleteOrder(order: any) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this order?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.http.delete(`http://localhost/user_api/orders.php?id=${order.order_id}`)
              .pipe(
                catchError(error => {
                  console.error('Error deleting order:', error);
                  this.presentToast('Failed to delete order', 'danger');
                  return throwError(() => error);
                })
              )
              .subscribe((response: any) => {
                if (response.success) {
                  this.presentToast('Order deleted successfully', 'success');
                  this.fetchOrders();
                } else {
                  this.presentToast(response.message || 'Failed to delete order', 'danger');
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  private async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}