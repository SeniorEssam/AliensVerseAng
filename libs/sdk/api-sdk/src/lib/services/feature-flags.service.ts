import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private api = inject(ApiService);

  private _flags = signal<Record<string, boolean>>({});

  /** Read-only computed snapshot of all flags */
  readonly flags = computed(() => this._flags());

  /**
   * Called once during APP_INITIALIZER (parallel with initContext).
   * Silently ignores errors — defaults to all features disabled.
   */
  async loadFlags(): Promise<void> {
    try {
      const res = await firstValueFrom(this.api.get<any>('license/features'));
      this._flags.set(res?.data ?? {});
    } catch {
      // Non-critical: if the endpoint fails, all feature flags default to false.
      this._flags.set({});
    }
  }

  /**
   * Returns true if the named feature is enabled for the current company.
   * Unknown features default to false.
   */
  hasFeature(feature: string): boolean {
    return this._flags()[feature] ?? false;
  }
}
