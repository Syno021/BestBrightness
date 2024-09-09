import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'admin-dashboard',
    loadChildren: () => import('./admin-dashboard/admin-dashboard.module').then( m => m.AdminDashboardPageModule)
  },
  {
    path: 'admin-inventory-management',
    loadChildren: () => import('./admin-inventory-management/admin-inventory-management.module').then( m => m.AdminInventoryManagementPageModule)
  },
  {
    path: 'admin-sales-report',
    loadChildren: () => import('./admin-sales-report/admin-sales-report.module').then( m => m.AdminSalesReportPageModule)
  },
  {
    path: 'admin-customer-management',
    loadChildren: () => import('./admin-customer-management/admin-customer-management.module').then( m => m.AdminCustomerManagementPageModule)
  },
  {
    path: 'admin-order-management',
    loadChildren: () => import('./admin-order-management/admin-order-management.module').then( m => m.AdminOrderManagementPageModule)
  },
  {
    path: 'admin-user-management',
    loadChildren: () => import('./admin-user-management/admin-user-management.module').then( m => m.AdminUserManagementPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./signup/signup.module').then( m => m.SignupPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
