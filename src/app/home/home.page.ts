import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(private menu: MenuController,
    private router: Router
  ) {}

  openMenu() {
    this.menu.open();
  }

  Signup() {
    this.router.navigate(['/signup']);
    // Add navigation logic here
  }

  browseProducts() {
    this.router.navigate(['/products']);
    // Add navigation logic here
  }

  viewPromotions() {
    this.router.navigate(['/promotions']);
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
