import { Component, OnInit, Renderer2, ElementRef, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, AfterViewInit {
  private lastScrollTop = 0;
  isNavbarHidden = false;
  showNavbar = false;
  
  private navbarPages = ['/home', '/contact', '/about', '/view']; // Pages where the regular navbar should appear
  private adminNavbarPages = [
    '/admin-dashboard',
    '/admin-inventory-management',
    '/admin-customer-management',
    '/admin-sales-report',
    '/admin-order-management',
    '/admin-user-management'
  ]; // Pages where the admin navbar should appear

  isOnAdminPage = false; // Flag to check if we are on an admin page

  constructor(private renderer: Renderer2, private el: ElementRef, private router: Router) {
    // Listen for route changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.url;

        // Determine if the user is on an admin page
        this.isOnAdminPage = this.adminNavbarPages.includes(currentUrl);

        // Show or hide the navbar based on whether it's an admin or regular page
        this.showNavbar = this.navbarPages.includes(currentUrl) || this.adminNavbarPages.includes(currentUrl);
      }
    });
  }

  ngAfterViewInit() {
    this.renderer.listen('window', 'scroll', () => {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > this.lastScrollTop) {
        // Scrolling down
        this.isNavbarHidden = true;
      } else {
        // Scrolling up
        this.isNavbarHidden = false;
      }
      this.lastScrollTop = st <= 0 ? 0 : st;
    });
  }

  ngOnInit() {}
}

