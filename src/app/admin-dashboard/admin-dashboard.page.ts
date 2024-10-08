import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration } from 'chart.js/auto';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit, AfterViewInit {
  @ViewChild('salesChart') salesChartCanvas!: ElementRef;
  
  totalUsers: number = 0;
  totalSalesAmount: number = 0;
  pendingOrders: number = 0;
  salesChart: Chart | null = null;
  salesData: any[] = [];
  currentFilter: string = 'week';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.fetchUserCount();
    this.fetchTotalSalesAmount();
    this.fetchPendingOrdersCount();
    this.fetchSalesData(this.currentFilter);
  }

  ngAfterViewInit() {
    this.updateChart();
  }

  fetchUserCount() {
    this.http.get<{ user_count: number }>('http://localhost/user_api/register.php?count=true')
      .subscribe({
        next: (response) => {
          this.totalUsers = response.user_count;
        },
        error: (error) => {
          console.error('Error fetching user count:', error);
        }
      });
  }

  fetchTotalSalesAmount() {
    this.http.get<{ totalSalesAmount: number }>('http://localhost/user_api/sales.php?total_only=true')
      .subscribe({
        next: (response) => {
          this.totalSalesAmount = response.totalSalesAmount;
        },
        error: (error) => {
          console.error('Error fetching total sales amount:', error);
        }
      });
  }

  fetchPendingOrdersCount() {
    this.http.get<{ order_count: number }>('http://localhost/user_api/orders.php?count=true')
      .subscribe({
        next: (response) => {
          this.pendingOrders = response.order_count;
        },
        error: (error) => {
          console.error('Error fetching order count:', error);
        }
      });
  }

  fetchSalesData(filter: string) {
    this.http.get<any[]>(`http://localhost/user_api/sales.php?filter=${filter}`)
      .subscribe({
        next: (response) => {
          this.salesData = response;
          console.log('Fetched sales data:', this.salesData);
          this.updateChart();
        },
        error: (error) => {
          console.error('Error fetching sales data:', error);
        }
      });
  }

  updateChart() {
    if (!this.salesChartCanvas) return;
  
    const ctx = this.salesChartCanvas.nativeElement.getContext('2d');
  
    // Sort the data by date
    this.salesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
    const labels = this.salesData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const data = this.salesData.map(item => parseFloat(item.total_amount));
  
    const chartConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sales',
          data: data,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          pointRadius: 5,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Total Amount (R)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        }
      }
    };
  
    if (this.salesChart) {
      this.salesChart.destroy();
    }
  
    this.salesChart = new Chart(ctx, chartConfig);
  }

  changeFilter(event: CustomEvent) {
    const filter = event.detail.value;
    if (filter) {
      this.currentFilter = filter;
      this.fetchSalesData(filter);
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}