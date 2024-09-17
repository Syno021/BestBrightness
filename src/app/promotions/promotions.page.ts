import { Component, OnInit } from '@angular/core';

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: number;
  endDate: Date;
}

@Component({
  selector: 'app-promotions',
  templateUrl: './promotions.page.html',
  styleUrls: ['./promotions.page.scss'],
})
export class PromotionsPage implements OnInit {

  promotions: Promotion[] = [
    {
      id: 1,
      title: 'Summer Sale',
      description: 'Get 20% off on all summer products!',
      discount: 20,
      endDate: new Date('2024-11-30T23:59:59') // Fixed invalid date
    },
    {
      id: 2,
      title: 'New Customer Discount',
      description: 'Sign up and get 15% off your first purchase!',
      discount: 15,
      endDate: new Date('2024-12-31T23:59:59')
    },
    {
      id: 3,
      title: 'Flash Sale',
      description: 'Limited time offer: 30% off selected items!',
      discount: 30,
      endDate: new Date('2024-09-17T18:00:00')
    }
  ];

  constructor() { }

  ngOnInit() {
  }

  // Method to check if the promotion is still valid (compares current time with endDate)
  isPromotionValid(endDate: Date): boolean {
    const now = new Date();
    return now <= endDate;
  }

  // Method to get the remaining days for a promotion
  getDaysRemaining(endDate: Date): number {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 3600 * 24)); // Convert milliseconds to days
  }

}
