import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@aliens-verse/auth-sdk';
import { LookupService } from '@aliens-verse/lookup-sdk';
import { PublicContextService } from '@aliens-verse/api-sdk';
import { ThemeService, AppLogoComponent } from '@aliens-verse/ui';

@Component({
  selector: 'av-erp-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, AppLogoComponent],
  templateUrl: './erp-shell.component.html',
  styleUrl: './erp-shell.component.scss',
})
export class ERPShellComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly lookupService = inject(LookupService);
  readonly publicCtx = inject(PublicContextService);
  readonly themeService = inject(ThemeService);

  // UI State
  isSidebarOpen = signal(true);
  isHamburgerOpen = signal(false);
  isChangingContext = signal(false);

  // Current Session Data
  session = this.authService.currentSession;
  stores = this.lookupService.stores;
  branches = this.lookupService.branches;
  languages = this.lookupService.languages;
  companyInfo = this.publicCtx.companyInfo;

  currentStoreName = computed(() => {
    const s = this.stores().find((x) => x.id === this.session()?.storeId);
    return s?.name || 'Loading...';
  });

  currentBranchName = computed(() => {
    const b = this.branches().find((x) => x.id === this.session()?.branchId);
    return b?.name || 'Loading...';
  });

  currentLanguageName = computed(() => {
    const lang = this.languages().find(
      (x) => x.id === this.session()?.languageId,
    );
    return lang?.name || 'Language';
  });

  ngOnInit() {
    if (this.session()) {
      Promise.all([
        this.publicCtx.initContext(),
      ]).catch(() => {
        // Ignore: auth or load failure handling happens elsewhere.
      });
    }
  }

  toggleSidebar() {
    this.isSidebarOpen.update((v) => !v);
  }

  toggleHamburger() {
    this.isHamburgerOpen.update((v) => !v);
  }

  async switchContext(storeId: string, branchId: string) {
    this.isChangingContext.set(true);
    try {
      const success = await this.authService.changeContext(
        branchId,
        storeId,
        this.session()?.languageId || '',
      );
      if (success) {
        this.isHamburgerOpen.set(false);
      }
    } finally {
      this.isChangingContext.set(false);
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
  }
}
