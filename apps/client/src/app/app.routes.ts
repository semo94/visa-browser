import { Routes } from '@angular/router';

/**
 * Application routes
 * @description Defines the routing structure for the application
 */
export const routes: Routes = [
  {
    path: 'products',
    loadComponent: () => import('./features/products/components/product-list/products.component')
      .then(m => m.ProductsComponent),
    title: 'Visa Products | sherpa°'
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/components/product-details/product-details.component')
      .then(m => m.ProductDetailsComponent),
    title: 'Product Details | sherpa°'
  },
  {
    path: '',
    redirectTo: '/products',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/products'
  }
];