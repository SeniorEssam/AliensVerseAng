import { Route, Routes } from '@angular/router';
import {
  tenantConfig,
  tenantMatchGuard,
  tenantActivateGuard,
  tenantActivateChildGuard,
  PluginManagerService,
} from '@aliens-verse/api-sdk';
import {
  activationGuard,
  authGuard,
  activeDeviceRedirectGuard,
  loginRedirectGuard,
  ERPShellComponent,
} from '@aliens-verse/shell';
import { TenantNotFoundComponent } from './components/tenant-not-found/tenant-not-found.component';

/**
 * Builds the application route tree.
 *
 * Plugin routes are injected via the PluginManagerService (DI).
 * The Shell itself only knows about:
 *  - The tenant wrapper
 *  - The ERP shell
 *  - Error/fallback pages
 *
 * Everything else comes from Plugin Manifests.
 */
function buildPluginRoutes(): Route[] {
  // At module-evaluation time, the injector isn't available yet.
  // Instead, we inline the manifest routes from the registered plugins.
  // The manifests are lightweight objects containing only () => import() references
  // — they don't pull in any plugin code until the route is activated.

  // Auth plugin routes
  const authRoutes: Route[] = [
    {
      path: 'login',
      canActivate: [loginRedirectGuard],
      loadComponent: () =>
        import('@aliens-verse/auth-plugin').then((m) => m.LoginComponent),
    },
  ];

  // Activation plugin routes
  const activationRoutes: Route[] = [
    {
      path: 'activation',
      canActivate: [activeDeviceRedirectGuard],
      loadChildren: () =>
        import('@aliens-verse/activation-plugin').then(
          (m) => m.ACTIVATION_ROUTES,
        ),
    },
  ];

  // Landing page plugin routes (catch-all, must be last)
  const landingRoutes: Route[] = [
    {
      path: '',
      loadChildren: () =>
        import('@aliens-verse/landing-page').then((m) => m.LANDING_ROUTES),
    },
    {
      path: ':pageSlug',
      loadChildren: () =>
        import('@aliens-verse/landing-page').then((m) => m.LANDING_ROUTES),
    },
  ];

  return [...activationRoutes, ...authRoutes, ...landingRoutes];
}

export function buildRoutes(config: typeof tenantConfig): Route[] {
  const pluginRoutes = buildPluginRoutes();

  if (config.mode === 'multi') {
    return [
      { path: '', redirectTo: config.defaultCompanySlug, pathMatch: 'full' },

      {
        path: ':companySlug',
        canMatch: [tenantMatchGuard],
        canActivate: [tenantActivateGuard],
        canActivateChild: [tenantActivateChildGuard],
        runGuardsAndResolvers: 'always',
        children: [
          {
            path: 'tenant-not-found',
            component: TenantNotFoundComponent,
            pathMatch: 'full',
          },
          {
            path: 'erp',
            component: ERPShellComponent,
            canActivate: [activationGuard, authGuard],
            children: [
              { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
              {
                path: 'dashboard',
                loadComponent: () =>
                  import('./app').then((m) => m.AppComponent),
              },
              {
                path: 'website-builder',
                loadChildren: () =>
                  import('@aliens-verse/website-builder').then(
                    (m) => m.BUILDER_ROUTES,
                  ),
              },
            ],
          },
          ...pluginRoutes,
        ],
      },

      { path: '**', redirectTo: config.defaultCompanySlug },
    ];
  } else {
    return [
      {
        path: 'tenant-not-found',
        component: TenantNotFoundComponent,
        pathMatch: 'full',
      },
      {
        path: '',
        canActivate: [tenantActivateGuard],
        canActivateChild: [tenantActivateChildGuard],
        runGuardsAndResolvers: 'always',
        children: [
          {
            path: 'erp',
            component: ERPShellComponent,
            canActivate: [activationGuard, authGuard],
            children: [
              { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
              {
                path: 'dashboard',
                loadComponent: () =>
                  import('./app').then((m) => m.AppComponent),
              },
              {
                path: 'website-builder',
                loadChildren: () =>
                  import('@aliens-verse/website-builder').then(
                    (m) => m.BUILDER_ROUTES,
                  ),
              },
              {
                path: 'settings',
                redirectTo: 'website-builder',
                pathMatch: 'full',
              },
              {
                path: 'setting',
                redirectTo: 'website-builder',
                pathMatch: 'full',
              },
            ],
          },
          ...pluginRoutes,
        ],
      },
      { path: '**', redirectTo: '' },
    ];
  }
}

export const appRoutes: Route[] = buildRoutes(tenantConfig);
