import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { apiInterceptor } from '@aliens-verse/api-sdk';
import { APP_INITIALIZER } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { PublicContextService, TenantResolverService } from '@aliens-verse/api-sdk';
import { LookupService } from '@aliens-verse/lookup-sdk';
import { AuthService } from '@aliens-verse/auth-sdk';
import { provideLandingPagePlugin } from '@aliens-verse/landing-page';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([apiInterceptor])),

    // ── Plugin Registration ──
    // Each plugin registers its Manifest + Components via DI.
    // This is the SINGLE SOURCE OF TRUTH for plugin configuration.
    provideLandingPagePlugin(),

    // Ensure public context (company & languages) are initialized before app renders.
    {
      provide: APP_INITIALIZER,
      useFactory:
        (
          publicCtx: PublicContextService,
          auth: AuthService,
          lookup: LookupService,
          tenantResolver: TenantResolverService,
          platformLocation: PlatformLocation
        ) =>
        async () => {
          // 1. Resolve the tenant early from the current URL to prevent missing headers (SSR Safe)
          tenantResolver.resolveTenant(platformLocation.pathname);

          // No longer fetching lookups explicitly.
          // They are fetched inside publicCtx.initContext() from CompanyProfile/Profile.
          try {
            await publicCtx.initContext();
          } catch (e) {
            console.error('Bootstrap: failed to init public context', e);
          }
        },
      deps: [PublicContextService, AuthService, LookupService, TenantResolverService, PlatformLocation],
      multi: true,
    },
  ],
};
