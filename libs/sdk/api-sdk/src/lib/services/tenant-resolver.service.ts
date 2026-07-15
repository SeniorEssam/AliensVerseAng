import { Injectable, signal, computed } from '@angular/core';
import { tenantConfig } from '../config/tenant.config';
import { TenantMode } from '../models/tenant.model';

@Injectable({
  providedIn: 'root',
})
export class TenantResolverService {
  private _mode = signal<TenantMode>(tenantConfig.mode);
  private _companySlug = signal<string | null>(null);
  private _currentPage = signal<string>('home');
  private _tenantVersionToken = signal<string>(this.generateToken());

  // Exposed read-only state signals
  readonly mode = computed(() => this._mode());
  readonly companySlug = computed(() => this._companySlug());
  readonly currentPage = computed(() => this._currentPage());
  readonly tenantVersionToken = computed(() => this._tenantVersionToken());

  constructor() {
    this.validateConfiguration();
  }

  private validateConfiguration(): void {
    if (this._mode() === 'multi' && !tenantConfig.defaultCompanySlug) {
      throw new Error(
        'defaultCompanySlug must be configured in multi tenant mode',
      );
    }
  }

  resolveTenant(path: string): void {
    const cleanPath = path.split('?')[0].split('#')[0];
    const segments = cleanPath.split('/').filter(Boolean);
    const previousSlug = this._companySlug();

    if (this._mode() === 'multi') {
      const slug = segments[0] || tenantConfig.defaultCompanySlug || null;
      this._companySlug.set(slug);
      this._currentPage.set(segments.slice(1).join('/') || 'home');
    } else {
      this._companySlug.set(tenantConfig.defaultCompanySlug || null);
      this._currentPage.set(segments.join('/') || 'home');
    }

    // Update version token on actual tenant switches to discard stale requests
    if (this._companySlug() !== previousSlug) {
      this._tenantVersionToken.set(this.generateToken());
    }
  }

  buildUrl(path = ''): string {
    const normalized = path.replace(/^\/+/, '');
    if (this._mode() === 'multi') {
      const slug = this._companySlug() || tenantConfig.defaultCompanySlug || '';
      return normalized ? `/${slug}/${normalized}` : `/${slug}`;
    }
    return normalized ? `/${normalized}` : '/';
  }

  getCompanySlugForHeader(): string | null {
    return this._mode() === 'multi' ? this._companySlug() : null;
  }

  private generateToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    );
  }
}
