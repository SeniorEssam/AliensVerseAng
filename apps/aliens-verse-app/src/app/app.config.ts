import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { apiInterceptor } from '@aliens-verse/api-sdk';
import { APP_INITIALIZER } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import {
  PublicContextService,
  TenantResolverService,
  FeatureFlagsService,
} from '@aliens-verse/api-sdk';
import { LookupService } from '@aliens-verse/lookup-sdk';
import { AuthService, authInterceptor } from '@aliens-verse/auth-sdk';
import { provideLandingPagePlugin } from '@aliens-verse/landing-page';
import { provideWebsiteBuilderPlugin } from '@aliens-verse/website-builder';
import {
  provideClientHydration,
  withEventReplay,
  withHttpTransferCacheOptions
} from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(
      withEventReplay(),
      withHttpTransferCacheOptions({
        includePostRequests: false,
        includeRequestsWithAuthHeaders: true,
        includeHeaders: ['X-Company-Slug', 'Accept-Language', 'LanguageId'],
        filter: (req) => req.method === 'GET'
      })
    ),
    provideZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideHttpClient(withFetch(), withInterceptors([apiInterceptor, authInterceptor])),

    // ── Plugin Registration ──
    // Each plugin registers its Manifest + Components via DI.
    // This is the SINGLE SOURCE OF TRUTH for plugin configuration.
    provideLandingPagePlugin(),
    provideWebsiteBuilderPlugin(),

    // Ensure public context (company & languages) are initialized before app renders.
    {
      provide: APP_INITIALIZER,
      useFactory:
        (
          publicCtx: PublicContextService,
          auth: AuthService,
          lookup: LookupService,
          tenantResolver: TenantResolverService,
          platformLocation: PlatformLocation,
          featureFlags: FeatureFlagsService,
        ) =>
        async () => {
          // 1. Resolve the tenant early from the current URL to prevent missing headers (SSR Safe)
          tenantResolver.resolveTenant(platformLocation.pathname);

          // 2. Load context for faster startup
          await publicCtx
            .initContext()
            .catch((e) =>
              console.error('Bootstrap: failed to init public context', e),
            );
        },
      deps: [
        PublicContextService,
        AuthService,
        LookupService,
        TenantResolverService,
        PlatformLocation,
        FeatureFlagsService,
      ],
      multi: true,
    },
  ],
};
