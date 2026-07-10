import { Injectable, inject, signal } from '@angular/core';
import { ApiService, FeatureFlagsService } from '@aliens-verse/api-sdk';
import { DeviceService } from '@aliens-verse/device-sdk';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

export interface UserSession {
  userId: string;
  email: string;
  branchId: string;
  storeId: string;
  languageId: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly deviceService = inject(DeviceService);
  private readonly featureFlags = inject(FeatureFlagsService);
  private readonly router = inject(Router);

  // State Signals (Isolated from LocalStorage)
  readonly authStatus = signal<AuthStatus>('unknown');
  readonly currentSession = signal<UserSession | null>(null);

  /**
   * Stateless Session Check: The single source of truth is the backend response.
   * Called on application load and in AuthGuards.
   */
  async checkSession() {
    try {
      // Ping the secure backend session verifier
      const res = await firstValueFrom(
        this.apiService.get<any>('auth/check')
      );
      
      if (res.statusCode === 200) {
        this.authStatus.set('authenticated');
        this.currentSession.set({
          userId: res.data.userId,
          email: res.data.email,
          branchId: res.data.branchId,
          storeId: res.data.storeId,
          languageId: res.data.languageId
        });
        await this.featureFlags.loadFlags();
      } else {
        this.authStatus.set('unauthenticated');
        this.currentSession.set(null);
      }
    } catch (error) {
      this.authStatus.set('unauthenticated');
      this.currentSession.set(null);
    }
  }

  async login(credentials: any) {
    const payload = {
      ...credentials,
      deviceId: this.deviceService.serverDeviceId(),
      clientDeviceId: this.deviceService.clientDeviceId(),
      deviceType: this.deviceService.isNative() ? 'mobile' : 'web'
    };

    const res = await firstValueFrom(this.apiService.post<any>('auth/login', payload));

    if (res.statusCode === 200) {
      this.authStatus.set('authenticated');
      this.currentSession.set({
        userId: res.data.userId,
        email: res.data.email,
        branchId: res.data.branchId,
        storeId: res.data.storeId,
        languageId: res.data.languageId
      });
      await this.featureFlags.loadFlags();
      return true;
    }
    return false;
  }

  async logout() {
    try {
      await firstValueFrom(this.apiService.post('auth/logout', {}));
    } finally {
      this.authStatus.set('unauthenticated');
      this.currentSession.set(null);
      this.router.navigate(['/login']);
    }
  }

  async changeContext(branchId: string, storeId: string, languageId: string) {
    const payload = {
      branchId,
      storeId,
      languageId,
      deviceId: this.deviceService.serverDeviceId(),
      clientDeviceId: this.deviceService.clientDeviceId(),
      deviceType: this.deviceService.isNative() ? 'mobile' : 'web'
    };

    const res = await firstValueFrom(this.apiService.post<any>('auth/change-context', payload));
    
    if (res.statusCode === 200) {
      // Backend automatically updates the 'av_token' HttpOnly cookie
      this.currentSession.update(s => s ? { ...s, branchId, storeId, languageId } : null);
      return true;
    }
    return false;
  }
}
