import { inject, PLATFORM_ID } from '@angular/core';
import { CanMatchFn, CanActivateFn, CanActivateChildFn, Router, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { TenantResolverService } from '../services/tenant-resolver.service';
import { PublicContextService } from '../services/public-context.service';
import { ApiService } from '../services/api.service';
import { tenantConfig } from '../config/tenant.config';
import { firstValueFrom } from 'rxjs';

/**
 * Shared helper to resolve context, detect tenant switches, and load profiles.
 * IMPORTANT: All inject() calls MUST be before any await to stay in injection context.
 */
async function activateTenant(stateUrl: string): Promise<boolean | UrlTree> {
  // All inject() calls are synchronous and before any await — this is required by Angular DI
  const tenantResolver = inject(TenantResolverService);
  const publicContext = inject(PublicContextService);
  const api = inject(ApiService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  tenantResolver.resolveTenant(stateUrl);

  // Bypass profile fetching for the tenant-not-found route to prevent infinite loops
  if (stateUrl.includes('tenant-not-found')) {
    return true;
  }

  const resolvedSlug = tenantResolver.companySlug();
  const loadedSlug = publicContext.companyInfo()?.company_slug; // 🔧 FIX: snake_case

  if (tenantResolver.mode() === 'multi') {
    // Check if slug changed
    if (resolvedSlug !== loadedSlug) {
      if (loadedSlug) {
        // Switch context: flush session on backend ONLY if switching from a loaded slug.
        try {
          await firstValueFrom(api.post('CompanyProfile/clear-session', {}));
        } catch (err) {
          console.warn('Session clean during tenant switch failed', err);
        }
      }

      if (isPlatformBrowser(platformId)) {
        clearTenancyCookies(platformId);
      }
      publicContext.clearCompanyState();

      try {
        await publicContext.fetchCompanyProfile();
      } catch (err) {
        console.error('Tenant profile loading failed', err);
        return handleFailedTenantRedirect(router, resolvedSlug);
      }
    } else if (!publicContext.companyInfo()) {
      try {
        await publicContext.fetchCompanyProfile();
      } catch (err) {
        console.error('Tenant profile loading failed', err);
        return handleFailedTenantRedirect(router, resolvedSlug);
      }
    }
  } else {
    // Single tenant mode
    if (!publicContext.companyInfo()) {
      try {
        await publicContext.fetchCompanyProfile();
      } catch (err) {
        console.error('Dedicated profile loading failed', err);
        return router.parseUrl('/tenant-not-found');
      }
    }
  }

  return true;
}

/**
 * Guard executing during match phase (initial route match).
 * Keeps canMatch pure - only parses/checks route formats, does not perform API loading calls.
 */
export const tenantMatchGuard: CanMatchFn = (route, segments) => {
  const tenantResolver = inject(TenantResolverService);
  const path = '/' + segments.map(s => s.path).join('/');

  tenantResolver.resolveTenant(path);
  return true;
};

/**
 * Guard executing during parent path activation.
 */
export const tenantActivateGuard: CanActivateFn = (route, state) => {
  return activateTenant(state.url);
};

/**
 * Guard executing during nested path transitions.
 */
export const tenantActivateChildGuard: CanActivateChildFn = (childRoute, state) => {
  return activateTenant(state.url);
};

/**
 * Handles redirects when tenant profile is missing. Prevents infinite redirect loops
 * when the defaultCompanySlug itself fails to load.
 */
function handleFailedTenantRedirect(router: Router, resolvedSlug: string | null): UrlTree {
  if (resolvedSlug === tenantConfig.defaultCompanySlug) {
    return router.parseUrl(`/${tenantConfig.defaultCompanySlug}/tenant-not-found`);
  }
  return router.parseUrl(`/${tenantConfig.defaultCompanySlug}`);
}

function clearTenancyCookies(platformId: any): void {
  if (!isPlatformBrowser(platformId)) return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const cookies = ['av_company_slug', 'av_company_info'];
  cookies.forEach(name => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax${secure}`;
  });
}
