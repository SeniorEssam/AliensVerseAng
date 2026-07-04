import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ThemeConfiguration, PlatformThemeContract, DEFAULT_THEME, deepMergeTheme } from './contracts';

@Injectable({
  providedIn: 'root'
})
export class ThemeManagerService {
  private currentTheme: PlatformThemeContract = DEFAULT_THEME;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    // Apply default theme immediately so the platform always has usable styles
    if (isPlatformBrowser(this.platformId)) {
      this.injectCssVariables(this.currentTheme);
    }
  }

  /**
   * Applies a theme configuration. Handles:
   * 1. Version migration (future-proof)
   * 2. Deep-merge with defaults (missing values won't break anything)
   * 3. SSR safety (skips DOM manipulation on server)
   */
  applyTheme(config: ThemeConfiguration | Partial<PlatformThemeContract> | null | undefined): void {
    if (!config) return;

    // Accept both { version, theme } wrapper and raw PlatformThemeContract
    let incoming: Partial<PlatformThemeContract>;
    if (this.isThemeConfiguration(config)) {
      incoming = this.migrateThemeToLatest(config);
    } else {
      incoming = config as Partial<PlatformThemeContract>;
    }

    // Deep merge with defaults — any missing token gets a safe fallback
    this.currentTheme = deepMergeTheme(DEFAULT_THEME, incoming);

    if (isPlatformBrowser(this.platformId)) {
      this.injectCssVariables(this.currentTheme);
    }
  }

  /**
   * Returns the currently active theme (useful for programmatic access).
   */
  getCurrentTheme(): PlatformThemeContract {
    return this.currentTheme;
  }

  /**
   * Type guard to distinguish ThemeConfiguration wrapper from raw theme.
   */
  private isThemeConfiguration(obj: any): obj is ThemeConfiguration {
    return obj && typeof obj.version === 'number' && obj.theme !== undefined;
  }

  /**
   * Future: migrate V1 → V2, V2 → V3, etc.
   * Currently a passthrough since only V1 exists.
   */
  private migrateThemeToLatest(config: ThemeConfiguration): Partial<PlatformThemeContract> {
    // When V2 is introduced:
    // if (config.version === 1) { return migrateV1toV2(config.theme); }
    return config.theme;
  }

  /**
   * Recursively flattens the theme object into CSS custom properties.
   * 
   * Example: { colors: { primary: { default: '#6366f1' } } }
   * Becomes: --colors-primary-default: #6366f1
   * 
   * This means ANY new token added to PlatformThemeContract
   * is automatically injected without modifying this code.
   */
  private injectCssVariables(theme: PlatformThemeContract): void {
    const root = this.document.documentElement;
    this.flattenAndInject(theme, '--', root);
  }

  private flattenAndInject(obj: Record<string, any>, prefix: string, root: HTMLElement): void {
    for (const [key, value] of Object.entries(obj)) {
      const varName = `${prefix}${this.toKebabCase(key)}`;
      if (typeof value === 'object' && value !== null) {
        this.flattenAndInject(value, `${varName}-`, root);
      } else {
        root.style.setProperty(varName, String(value));
      }
    }
  }

  private toKebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }
}
