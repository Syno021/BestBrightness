import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(private menu: MenuController) {}

  openMenu() {
    this.menu.open();
  }

  browseProducts() {
    console.log('Navigating to products page');
    // Add navigation logic here
  }

  viewPromotions() {
    console.log('Navigating to promotions page');
    // Add navigation logic here
  }

  viewAccount() {
    console.log('Navigating to account page');
    // Add navigation logic here
  }

  buyNow() {
    console.log('Initiating buy now process');
    // Add buy now logic here
  }
}
