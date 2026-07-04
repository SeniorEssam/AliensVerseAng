import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '@aliens-verse/api-sdk';
import { firstValueFrom } from 'rxjs';
import { Device } from '@capacitor/device';
import { getCookie, setCookie, COOKIE_NAMES } from '@aliens-verse/cookies';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiService = inject(ApiService);

  // Signals for device state
  readonly clientDeviceId = signal<string | null>(null);
  readonly serverDeviceId = signal<string | null>(null);
  readonly isNative = signal<boolean>(false);
  readonly isInitialized = signal<boolean>(false);
  readonly isDeviceActivated = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeDevice();
    }
  }

  private async initializeDevice() {
    try {
      const info = await Device.getInfo();
      this.isNative.set(info.platform !== 'web');

      // 1. Handle Client Device ID (UUID v4)
      // MUST be generated ONLY once and stored in a non-HttpOnly cookie
      let cId = getCookie(COOKIE_NAMES.CLIENT_DEVICE);

      if (!cId) {
        cId = crypto.randomUUID();
        // Store in a persistent cookie for 1 year via central util
        setCookie(COOKIE_NAMES.CLIENT_DEVICE, cId, { days: 365 });
      }
      this.clientDeviceId.set(cId);

      // 2. Handle Server Device ID
      if (this.isNative()) {
        // On Mobile/Desktop, use Capacitor's immutable Hardware ID
        const id = await Device.getId();
        this.serverDeviceId.set(id.identifier);
      } else {
        // On Web, rely on the backend-issued HttpOnly cookie 'av_server_device'
        let sId = getCookie(COOKIE_NAMES.SERVER_DEVICE);
        if (!sId) sId = crypto.randomUUID(); // Fallback UUID if cookie is missing (should not happen if backend sets it correctly)
        this.serverDeviceId.set(sId);
      }

      this.isInitialized.set(true);
    } catch (error) {
      console.error('Core Device Identity Failure:', error);
    }
  }

  async checkDeviceStatus(): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.apiService.get<{ deviceId?: string }>('device/check'),
      );
      if (res.statusCode === 200) {
        this.isDeviceActivated.set(true);
        if (res.data?.deviceId) {
          this.serverDeviceId.set(res.data.deviceId);
        }
        return true;
      }
      this.isDeviceActivated.set(false);
      return false;
    } catch {
      this.isDeviceActivated.set(false);
      return false;
    }
  }

  // Cookie operations are delegated to libs/shell cookie.util
}
