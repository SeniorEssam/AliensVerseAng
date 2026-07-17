import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Disable SSR for ERP, Auth, and Activation routes
  {
    path: ':companySlug/erp/**',
    renderMode: RenderMode.Client,
  },
  {
    path: ':companySlug/login',
    renderMode: RenderMode.Client,
  },
  {
    path: ':companySlug/activation',
    renderMode: RenderMode.Client,
  },
  // Default to Server-Side Rendering for Landing Pages
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
