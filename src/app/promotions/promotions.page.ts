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
      endDate: new Date('2024-08-31')
    },
    {
      id: 2,
      title: 'New Customer Discount',
      description: 'Sign up and get 15% off your first purchase!',
      discount: 15,
      endDate: new Date('2024-12-31')
    },
    {
      id: 3,
      title: 'Flash Sale',
      description: 'Limited time offer: 30% off selected items!',
      discount: 30,
      endDate: new Date('2024-09-15')
    }
  ];
    


  constructor() { }

  ngOnInit() {
  }

  isPromotionValid(endDate: Date): boolean {
    return new Date() <= endDate;
  }

  getDaysRemaining(endDate: Date): number {
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 3600 * 24));
  }
}
