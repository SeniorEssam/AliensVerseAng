import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@aliens-verse/auth-sdk';
import { TenantResolverService } from '@aliens-verse/api-sdk';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const tenantResolver = inject(TenantResolverService);

  // 1. If we don't know the status yet (e.g. initial load/refresh)
  if (authService.authStatus() === 'unknown') {
    await authService.checkSession();
  }

  // 2. Final check based on SSoT (Backend status)
  if (authService.authStatus() === 'authenticated') {
    return true;
  }

  // 3. Not authenticated, redirect to login
  // 🛡️ Preserve Tenant Context: If they tried to access /alqawmiya/erp, redirect to /alqawmiya/login
  return router.parseUrl(tenantResolver.buildUrl('login'));
};
