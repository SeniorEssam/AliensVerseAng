import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DeviceService } from '@aliens-verse/device-sdk';
import { TenantResolverService } from '@aliens-verse/api-sdk';

export const activationGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const deviceService = inject(DeviceService);
  const tenantResolver = inject(TenantResolverService);
  const isActivated = await deviceService.checkDeviceStatus();

  if (!isActivated) {
    // Device not activated, redirect to activation plugin
    // 🛡️ Ensure tenant context is preserved if applicable
    return router.parseUrl(tenantResolver.buildUrl('activation'));
  }

  return true;
};
