import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  private apiUrl = 'http://localhost:3000';  // Make sure this URL is correct

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    console.log('Sending registration data to server:', userData);  // Log request data
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(userData: any): Observable<any> {
    console.log('Sending login data to server:', userData);  // Log request data
    return this.http.post(`${this.apiUrl}/login`, userData);
  }
}
