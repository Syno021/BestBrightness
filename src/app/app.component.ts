import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Home', url: '/home', icon: 'home' },
    { title: 'Products', url: '/products', icon: 'grid' },
    { title: 'Promotions', url: '/promotions', icon: 'pricetag' },
    { title: 'Account', url: '/account', icon: 'person' },
  ];
  
  constructor(private menu: MenuController) {}

  initializeApp() {
    this.menu.enable(true, 'first');
  }
}
