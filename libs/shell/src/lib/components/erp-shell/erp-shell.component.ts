import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '@aliens-verse/auth-sdk';
import { LookupService } from '@aliens-verse/lookup-sdk';
import {
  FeatureFlagsService,
  PluginManagerService,
  PublicContextService,
} from '@aliens-verse/api-sdk';
import {
  ThemeService,
  AppLogoComponent,
  SvgIconComponent,
  NavItemComponent,
  UserCardComponent,
} from '@aliens-verse/ui';

interface NavEntry {
  label: string;
  icon: string;
  route: string;
  feature: string | null;
}

@Component({
  selector: 'av-erp-shell',
  standalone: true,
  imports: [
    RouterModule,
    AppLogoComponent,
    SvgIconComponent,
    NavItemComponent,
    UserCardComponent,
  ],
  templateUrl: './erp-shell.component.html',
  styleUrl: './erp-shell.component.scss',
})
export class ERPShellComponent implements OnInit {
  // ─── Services ───────────────────────────────────────────────────────────────
  readonly authService = inject(AuthService);
  readonly lookupService = inject(LookupService);
  readonly publicCtx = inject(PublicContextService);
  readonly themeService = inject(ThemeService);
  readonly featureFlags = inject(FeatureFlagsService);
  readonly pluginManager = inject(PluginManagerService);

  // ─── Session Data ────────────────────────────────────────────────────────────
  session = this.authService.currentSession;
  stores = this.lookupService.stores;
  branches = this.lookupService.branches;
  languages = this.lookupService.languages;
  companyInfo = this.publicCtx.companyInfo;

  // ─── UI State ─────────────────────────────────────────────────────────────
  /** Persisted across reloads */
  sidebarCollapsed = signal<boolean>(
    localStorage.getItem('erp_sidebar_collapsed') === 'true',
  );
  isContextOpen = signal(false);
  isChangingCtx = signal(false);

  // ─── Computed Labels ─────────────────────────────────────────────────────
  currentStoreName = computed(() => {
    const s = this.stores().find((x) => x.id === this.session()?.storeId);
    return s?.name ?? '—';
  });

  currentBranchName = computed(() => {
    const b = this.branches().find((x) => x.id === this.session()?.branchId);
    return b?.name ?? '—';
  });

  currentLanguageName = computed(() => {
    const l = this.languages().find((x) => x.id === this.session()?.languageId);
    return l?.name ?? 'Language';
  });

  isDark = computed(() => this.themeService.currentTheme() === 'dark');

  // ─── Navigation Items (feature-flag-aware) ───────────────────────────────
  private readonly BASE_NAV: NavEntry[] = [
    { label: 'Dashboard', icon: 'grid', route: 'dashboard', feature: null },
  ];

  readonly navItems = computed<NavEntry[]>(() => {
    const base = this.BASE_NAV.filter(
      (item) => !item.feature || this.featureFlags.hasFeature(item.feature),
    );
    // Plugin-injected nav items (e.g. from future plugins)
    const pluginItems: NavEntry[] = this.pluginManager
      .getNavigationForZone('sidebar')
      .filter(
        (nav) =>
          !nav.permissions?.length ||
          this.featureFlags.hasFeature(nav.permissions![0]),
      )
      .map((nav) => ({
        label: nav.label,
        icon: nav.icon ?? 'grid',
        route: nav.route,
        feature: nav.permissions?.[0] ?? null,
      }));

    return [...base, ...pluginItems];
  });

  // ─── Lifecycle ───────────────────────────────────────────────────────────
  ngOnInit(): void {
    if (this.session()) {
      this.publicCtx.initContext().catch(() => {
        /* handled elsewhere */
      });
    }
  }

  // ─── Actions ─────────────────────────────────────────────────────────────
  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
    localStorage.setItem(
      'erp_sidebar_collapsed',
      String(this.sidebarCollapsed()),
    );
  }

  toggleContext(): void {
    this.isContextOpen.update((v) => !v);
  }

  closeContext(): void {
    this.isContextOpen.set(false);
  }

  async switchContext(storeId: string, branchId: string): Promise<void> {
    this.isChangingCtx.set(true);
    try {
      const ok = await this.authService.changeContext(
        branchId,
        storeId,
        this.session()?.languageId ?? '',
      );
      if (ok) this.isContextOpen.set(false);
    } finally {
      this.isChangingCtx.set(false);
    }
  }

  async switchLanguage(languageId: string): Promise<void> {
    this.isChangingCtx.set(true);
    try {
      const ok = await this.authService.changeContext(
        this.session()?.branchId ?? '',
        this.session()?.storeId ?? '',
        languageId,
      );
      if (ok) this.isContextOpen.set(false);
    } finally {
      this.isChangingCtx.set(false);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
  }
}
