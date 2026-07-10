import { Routes } from '@angular/router';

export const BUILDER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/builder/builder.component').then(m => m.BuilderComponent)
  },
  {
    path: ':pageSlug',
    loadComponent: () => import('./pages/builder/builder.component').then(m => m.BuilderComponent)
  }
];
