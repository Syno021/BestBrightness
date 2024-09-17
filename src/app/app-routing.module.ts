import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

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
  {
    path: 'pos',
    loadChildren: () => import('./pos/pos.module').then( m => m.POSPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'products',
    loadChildren: () => import('./products/products.module').then(m => m.ProductsPageModule)
  },
  {
    path: 'promotions',
    loadChildren: () => import('./promotions/promotions.module').then(m => m.PromotionsPageModule)
  },
  {
    path: 'account',
    loadChildren: () => import('./account/account.module').then(m => m.AccountPageModule)
  },
  {
    path: 'products',
    loadChildren: () => import('./products/products.module').then( m => m.ProductsPageModule)
  },
  {
    path: 'promotions',
    loadChildren: () => import('./promotions/promotions.module').then( m => m.PromotionsPageModule)
  },
  {
    path: 'account',
    loadChildren: () => import('./account/account.module').then( m => m.AccountPageModule)
  },  {
    path: 'cart',
    loadChildren: () => import('./cart/cart.module').then( m => m.CartPageModule)
  },
  {
    path: 'about-us',
    loadChildren: () => import('./about-us/about-us.module').then( m => m.AboutUsPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
    // HttpClientModule,
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
