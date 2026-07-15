import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { getCookie, setCookie, COOKIE_NAMES } from '@aliens-verse/cookies';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly currentTheme = signal<AppTheme>('dark');
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.initializeTheme();

    // Automatic effect to update document class when signal changes
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
    });
  }

  private initializeTheme() {
    let savedTheme: AppTheme | null = null;
    
    if (isPlatformBrowser(this.platformId)) {
      // Priority: localStorage > cookie > system preference
      const localStored = localStorage.getItem(COOKIE_NAMES.THEME) as AppTheme;
      savedTheme = localStored || (getCookie(COOKIE_NAMES.THEME) as AppTheme);
    } else {
      // On server, fallback to cookie if available
      savedTheme = getCookie(COOKIE_NAMES.THEME) as AppTheme;
    }

    if (savedTheme === 'light' || savedTheme === 'dark') {
      this.currentTheme.set(savedTheme);
    } else {
      // Default to dark mode as specified in requirements
      this.currentTheme.set('dark');
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.currentTheme.set(newTheme);
    
    if (isPlatformBrowser(this.platformId)) {
      setCookie(COOKIE_NAMES.THEME, newTheme, { days: 365 * 10 });
      localStorage.setItem(COOKIE_NAMES.THEME, newTheme);
    }
  }

  setTheme(theme: AppTheme) {
    this.currentTheme.set(theme);
    
    if (isPlatformBrowser(this.platformId)) {
      setCookie(COOKIE_NAMES.THEME, theme, { days: 365 * 10 });
      localStorage.setItem(COOKIE_NAMES.THEME, theme);
    }
  }

  private applyTheme(theme: AppTheme) {
    if (isPlatformBrowser(this.platformId)) {
      const html = document.documentElement;
      if (theme === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }

  // Cookie operations delegated to libs/shell cookie util
}
