import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from './api.service';
import { TenantResolverService } from './tenant-resolver.service';
import { ThemeManagerService } from '../theme/theme-manager.service';
import { firstValueFrom } from 'rxjs';
import { LookupService } from '@aliens-verse/lookup-sdk';

// snake_case to match existing templates (header-v1, footer-v1, landing.component.html)
export interface CompanyInfo {
  id: string;
  company_name: string;
  company_logo: string;
  company_logo_dark: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  company_domain?: string;
  company_slug?: string;
  longitude?: number | null;
  latitude?: number | null;
}

// 🔧 FIX: Added logo_url and isRTL for backward compat with app.config.ts and LandingPageComponent
export interface Language {
  id: string;
  name: string;
  code: string;
  isDefault?: boolean;
  logo_url: string;
  isRTL: boolean;
}

// 🔧 FIX: Added backward compatibility alias for LanguageItem
export type LanguageItem = Language;

@Injectable({
  providedIn: 'root'
})
export class PublicContextService {
  private api = inject(ApiService);
  private tenantResolver = inject(TenantResolverService);
  private themeManager = inject(ThemeManagerService);
  private platformId = inject(PLATFORM_ID);
  private lookupService = inject(LookupService);

  // Reactive state signals
  private _companyInfo = signal<CompanyInfo | null>(null);
  private _languages = signal<Language[]>([]);
  private _currentLang = signal<Language | null>(null);
  private _sections = signal<any[]>([]);
  private _loadingSections = signal<boolean>(false);
  private _themeApplied = signal<boolean>(false);

  readonly themeApplied = computed(() => this._themeApplied());

  // Exposed read-only states
  readonly companyInfo = computed(() => this._companyInfo());
  readonly languages = computed(() => this._languages());
  readonly currentLang = computed(() => this._currentLang());
  readonly sections = computed(() => this._sections());
  readonly loadingSections = computed(() => this._loadingSections());

  private profileRequestId = 0;
  private sectionRequestId = 0;
  private profileRequestPromise: Promise<void> | null = null;

  /**
   * 🔧 FIX: Preserved for backward compatibility with APP_INITIALIZER in app.config.ts
   * Delegates to fetchCompanyProfile() internally.
   */
  async initContext(): Promise<void> {
    if (!this._companyInfo()) {
      await this.fetchCompanyProfile();
    }
  }

  async fetchCompanyProfile(): Promise<void> {
    // Deduplicate concurrent profile requests
    if (this.profileRequestPromise) {
      return this.profileRequestPromise;
    }

    const requestId = ++this.profileRequestId;
    const versionToken = this.tenantResolver.tenantVersionToken();

    this.profileRequestPromise = (async () => {
      try {
        const response = await firstValueFrom(this.api.get<any>('CompanyProfile/profile'));

        // Concurrency and Tenant version token checks
        if (requestId !== this.profileRequestId || versionToken !== this.tenantResolver.tenantVersionToken()) {
          return;
        }

        if (!response || !response.data) {
          throw new Error('Company profile response missing data');
        }

        const rawData = response.data;

        // 🔧 FIX: Map to snake_case CompanyInfo to match existing templates
        const mappedInfo: CompanyInfo = {
          id: rawData.id,
          company_slug: rawData.slug || rawData.company_slug,
          company_name: rawData.name || rawData.company_name,
          company_logo: rawData.logo || rawData.company_logo,
          company_logo_dark: rawData.logoDark || rawData.company_logo_dark,
          company_email: rawData.companyInfo?.email || rawData.company_email,
          company_phone: rawData.companyInfo?.phone || rawData.company_phone,
          company_address: rawData.companyInfo?.address || rawData.company_address,
          company_domain: rawData.domain || rawData.company_domain,
          longitude: rawData.longitude != null ? Number(rawData.longitude) : null,
          latitude: rawData.latitude != null ? Number(rawData.latitude) : null
        };

        this._companyInfo.set(mappedInfo);

        if (rawData.stores && Array.isArray(rawData.stores)) {
          this.lookupService.stores.set(
            rawData.stores.map((s: any) => ({
              id: s.id,
              name: s.name || s.store_name || 'Unknown Store',
            }))
          );
        }

        if (rawData.branches && Array.isArray(rawData.branches)) {
          this.lookupService.branches.set(
            rawData.branches.map((b: any) => ({
              id: b.id,
              name: b.name || b.branch_name || 'Unknown Branch',
            }))
          );
        }

        // Apply theme separately (Theme is Platform Configuration, not Company Info)
        const rawThemeJson = rawData.themeSettingsJson || rawData.theme_settings_json;
        if (rawThemeJson) {
          try {
            const parsedTheme = JSON.parse(rawThemeJson);
            this.themeManager.applyTheme(parsedTheme);
            this._themeApplied.set(true);
          } catch (e) {
            console.warn('Theme JSON parse failed, using defaults:', e);
            // ThemeManager already applied DEFAULT_THEME in constructor — UI is safe
          }
        }

        if (rawData.languages && rawData.languages.length > 0) {
          const mappedLangs: Language[] = rawData.languages.map((l: any) => ({
            id: l.id,
            name: l.name,
            code: l.code,
            isDefault: l.isDefault ?? false,
            logo_url: l.logo_url || l.logoUrl || '',
            isRTL: l.isRTL ?? false
          }));
          this._languages.set(mappedLangs);
          this.lookupService.languages.set(mappedLangs);
          const defaultLang = mappedLangs.find(l => l.isDefault) || mappedLangs[0];
          this._currentLang.set(defaultLang);
        }
      } catch (err) {
        if (requestId === this.profileRequestId && versionToken === this.tenantResolver.tenantVersionToken()) {
          throw err; // Re-throw so guard handles fallback redirect
        }
      } finally {
        this.profileRequestPromise = null;
      }
    })();

    return this.profileRequestPromise;
  }

  fetchSectionsForPage(pageSlug: string): void {
    const requestId = ++this.sectionRequestId;
    const tenantSlug = this.tenantResolver.companySlug();
    const versionToken = this.tenantResolver.tenantVersionToken();

    this._loadingSections.set(true);

    this.api.get<any>(`sectionengine/sections/${pageSlug}`).subscribe({
      next: (res: any) => {
        // Concurrency, Tenancy, and version token checks
        if (
          requestId !== this.sectionRequestId ||
          tenantSlug !== this.tenantResolver.companySlug() ||
          versionToken !== this.tenantResolver.tenantVersionToken()
        ) {
          return;
        }
        this._sections.set(res.data || []);
        this._loadingSections.set(false);
      },
      error: (err) => {
        if (
          requestId === this.sectionRequestId &&
          tenantSlug === this.tenantResolver.companySlug() &&
          versionToken === this.tenantResolver.tenantVersionToken()
        ) {
          console.error(`Failed to load page sections: ${pageSlug}`, err);
          this._sections.set([]);
          this._loadingSections.set(false);
        }
      }
    });
  }

  clearCompanyState(): void {
    // Invalidate any outstanding asynchronous profile or section requests
    this.profileRequestId++;
    this.sectionRequestId++;
    this.profileRequestPromise = null;

    this._companyInfo.set(null);
    this._languages.set([]);
    this._currentLang.set(null);
    this._sections.set([]);
    this._loadingSections.set(false);
  }

  /**
   * 🔧 FIX: Preserved for backward compatibility with APP_INITIALIZER in app.config.ts
   * Called from app.config.ts to inject languages from LookupService before profile fetch.
   */
  setLanguages(items: { id: string; name: string; code?: string; logo_url?: string; isRTL?: boolean }[]): void {
    if (!items || items.length === 0) return;

    const mapped: Language[] = items.map(item => ({
      id: item.id,
      name: item.name,
      code: item.code || 'en-US',
      logo_url: item.logo_url || '',
      isRTL: item.isRTL ?? false,
      isDefault: false
    }));

    this._languages.set(mapped);
    this.lookupService.languages.set(mapped);

    // Try to restore saved language from cookie
    if (isPlatformBrowser(this.platformId)) {
      const cv = this.readCookieValue('av_lang');
      if (cv) {
        const [id] = cv.split('|');
        const found = mapped.find(lang => lang.id === id);
        if (found) {
          this._currentLang.set(found);
          return;
        }
      }
    }

    this._currentLang.set(mapped[0]);
  }

  setLanguage(lang: Language): void {
    this._currentLang.set(lang);
    if (isPlatformBrowser(this.platformId)) {
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `av_lang=${lang.id}|${lang.code}; path=/; SameSite=Lax${secure}`;
      window.location.reload();
    }
  }

  private readCookieValue(name: string): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const nameLenPlus = name.length + 1;
    return document.cookie
      .split(';')
      .map(c => c.trim())
      .filter(cookie => cookie.substring(0, nameLenPlus) === `${name}=`)
      .map(cookie => decodeURIComponent(cookie.substring(nameLenPlus)))[0] || null;
  }
}
