import { Injectable, signal, effect } from '@angular/core';
import { getCookie, setCookie, COOKIE_NAMES } from '@aliens-verse/cookies';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly currentTheme = signal<AppTheme>('dark');

  constructor() {
    this.initializeTheme();

    // Automatic effect to update document class when signal changes
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
    });
  }

  private initializeTheme() {
    // Priority: localStorage > cookie > system preference
    const localStored = localStorage.getItem(COOKIE_NAMES.THEME) as AppTheme;
    const savedTheme =
      localStored || (getCookie(COOKIE_NAMES.THEME) as AppTheme);
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
    setCookie(COOKIE_NAMES.THEME, newTheme, { days: 365 * 10 });
    localStorage.setItem(COOKIE_NAMES.THEME, newTheme);
  }

  setTheme(theme: AppTheme) {
    this.currentTheme.set(theme);
    setCookie(COOKIE_NAMES.THEME, theme, { days: 365 * 10 });
    localStorage.setItem(COOKIE_NAMES.THEME, theme);
  }

  private applyTheme(theme: AppTheme) {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  // Cookie operations delegated to libs/shell cookie util
}
