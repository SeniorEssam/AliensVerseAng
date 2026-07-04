import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@aliens-verse/auth-sdk';
import { DeviceService } from '@aliens-verse/device-sdk';
import { TenantResolverService } from '@aliens-verse/api-sdk';

export const activeDeviceRedirectGuard: CanActivateFn = async (
  route,
  state,
) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const deviceService = inject(DeviceService);
  const tenantResolver = inject(TenantResolverService);
  const isActivated = await deviceService.checkDeviceStatus();

  if (!isActivated) {
    return true;
  }

  if (authService.authStatus() === 'unknown') {
    await authService.checkSession();
  }

  if (authService.authStatus() === 'authenticated') {
    return router.parseUrl(tenantResolver.buildUrl('erp'));
  } else {
    return router.parseUrl(tenantResolver.buildUrl('login'));
  }
};
