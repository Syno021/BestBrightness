import { Component, OnInit } from '@angular/core';

interface User {
  id: number;
  name: string;
  email: string;
}


@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  isLoggedIn: boolean = false;
  currentUser: User | null = null;
  segment: 'login' | 'signup' = 'login';

  loginForm = {
    email: '',
    password: ''
  };

  signupForm = {
    name: '',
    email: '',
    password: ''
  };


  constructor() { }

  ngOnInit() {

    // / Check if user is logged in (you'd typically use a service for this)
    // For demo purposes, we'll assume the user is not logged in initially
    this.isLoggedIn = false;
  }

  login() {
    // Implement login logic here
    console.log('Login attempt with:', this.loginForm);
    // For demo purposes, we'll simulate a successful login
    this.isLoggedIn = true;
    this.currentUser = {
      id: 1,
      name: 'John Doe',
      email: this.loginForm.email
    };
  }

  signup() {
    // Implement signup logic here
    console.log('Signup attempt with:', this.signupForm);
    // For demo purposes, we'll simulate a successful signup and login
    this.isLoggedIn = true;
    this.currentUser = {
      id: 1,
      name: this.signupForm.name,
      email: this.signupForm.email
    };
  }

  logout() {
    // Implement logout logic here
    this.isLoggedIn = false;
    this.currentUser = null;
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

}
