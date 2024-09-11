import { Component, OnInit, Renderer2, ElementRef, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.scss'],
})
export class AdminNavbarComponent implements OnInit, AfterViewInit {
  private lastScrollTop = 0;
  isNavbarHidden = false;
  showNavbar = false;

  // Specify the admin pages where the navbar should be shown
  private adminNavbarPages = [
    '/admin-dashboard', 
    '/admin-inventory-management', 
    '/admin-customer-management', 
    '/admin-sales-report', 
    '/admin-order-management', 
    '/admin-user-management'
  ];

  constructor(private renderer: Renderer2, private el: ElementRef, private router: Router) {
    // Listen for route changes and show/hide the navbar based on the current route
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showNavbar = this.adminNavbarPages.includes(event.url);
      }
    });
  }

  ngAfterViewInit() {
    // Navbar hides when scrolling down and reappears when scrolling up
    this.renderer.listen('window', 'scroll', () => {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > this.lastScrollTop) {
        this.isNavbarHidden = true; // Hide navbar when scrolling down
      } else {
        this.isNavbarHidden = false; // Show navbar when scrolling up
      }
      this.lastScrollTop = st <= 0 ? 0 : st; // Prevent negative scrolling
    });
  }

  ngOnInit() {}
}
