import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  inject,
  OnInit,
  signal,
  computed,
  HostListener,
  PLATFORM_ID,
  ViewEncapsulation,
  DestroyRef,
  effect,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ThemeService } from '@aliens-verse/ui';
import {
  PublicContextService,
  TenantResolverService,
  GlobalComponentRegistryService,
} from '@aliens-verse/api-sdk';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, distinctUntilChanged } from 'rxjs';
import { PageRendererComponent } from '../../components/page-renderer/page-renderer.component';
import { ConsentBannerComponent } from '../../components/consent-banner/consent-banner.component';

@Component({
  selector: 'av-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageRendererComponent,
    ConsentBannerComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LandingPageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('starCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D | null;
  private animationId!: number;
  private stars: any[] = [];
  private platformId = inject(PLATFORM_ID);

  readonly themeService = inject(ThemeService);
  private readonly publicCtx = inject(PublicContextService);
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private tenantResolver = inject(TenantResolverService);
  private destroyRef = inject(DestroyRef);

  private readonly registry = inject(GlobalComponentRegistryService);

  readonly companyInfo = this.publicCtx.companyInfo;
  readonly languages = this.publicCtx.languages;
  readonly currentLang = this.publicCtx.currentLang;
  readonly sections = this.publicCtx.sections;

  readonly visibleSections = computed(() =>
    [...this.sections()]
      .filter((section) => section.isVisible)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );

  readonly menuSections = computed(() =>
    this.visibleSections().filter(
      (section) => section.showInMenu && !!section.menuTitle,
    ),
  );

  readonly splashTitle = computed(() => {
    const info = this.companyInfo();
    if (info?.company_slug) {
      return info.company_slug;
    }
    const slug = this.tenantResolver.companySlug();
    if (slug) {
      return this.formatSlug(slug);
    }
    return 'AliensVerse';
  });

  readonly isLanguageSwitcherVisible = computed(
    () => this.languages().length > 1,
  );
  readonly isDark = computed(() => this.themeService.currentTheme() === 'dark');

  readonly hasApiHeader = computed(() => {
    const visible = this.visibleSections();
    return visible.some(
      (section) =>
        section.type?.toLowerCase() === 'header' ||
        section.category?.toLowerCase() === 'header',
    );
  });

  readonly pageSlug = signal('');
  readonly isFetchingSections = computed(() =>
    this.publicCtx.loadingSections(),
  );
  readonly allComponentsLoaded = signal(false);

  readonly isLoading = computed(
    () =>
      this.isFetchingSections() ||
      (this.sections().length > 0 && !this.allComponentsLoaded()),
  );

  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);

  selectedPlan = signal<'starter' | 'pro' | 'enterprise'>('pro');
  readonly currentYear = new Date().getFullYear();

  constructor() {
    effect(() => {
      // Whenever fetching completes, start preloading the components
      if (!this.isFetchingSections()) {
        this.preloadComponents();
      } else {
        // Reset the loaded state when fetching starts
        this.allComponentsLoaded.set(false);
      }
    });
  }

  private async preloadComponents() {
    const sections = this.sections();
    if (sections.length === 0) {
      this.allComponentsLoaded.set(true);
      return;
    }

    const promises = sections.map(async (section) => {
      const identifier = section.component || section.layout;
      if (!identifier) return;
      try {
        await this.registry.resolveComponent(identifier);
      } catch {
        // Fallback to layout if primary fails, ignore errors to let host show fallback UI
        if (identifier !== section.layout && section.layout) {
          try {
            await this.registry.resolveComponent(section.layout);
          } catch {
            // Ignored
          }
        }
      }
    });

    await Promise.all(promises);

    // Slight delay to ensure DOM updates and no flashes
    setTimeout(() => {
      this.allComponentsLoaded.set(true);
    }, 150);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 60);
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('pageSlug') || 'home'),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((pageSlug) => {
        this.pageSlug.set(pageSlug);
        this.publicCtx.fetchSectionsForPage(pageSlug);
        this.updateTitleAndFavicon();
      });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initStars(), 100);
      this.animate();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeHandler);
      cancelAnimationFrame(this.animationId);
    }
  }

  private resizeHandler = () => this.resizeCanvas();

  private formatSlug(slug: string): string {
    if (!slug) return 'AliensVerse';
    return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private updateTitleAndFavicon() {
    const name = this.companyInfo()?.company_name || 'AliensVerse';
    const pageTitle = this.pageSlug()
      ? `${this.pageSlug()} | ${name}`
      : `${name} — Enterprise Platform`;

    this.titleService.setTitle(pageTitle);
    this.meta.updateTag({
      name: 'description',
      content: `${name} — ERP, E-commerce & Custom Software Solutions`,
    });

    const logo = this.companyInfo()?.company_logo;
    if (logo && typeof document !== 'undefined') {
      let link: HTMLLinkElement | null =
        document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = logo;
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  scrollToSection(id: string) {
    this.isMobileMenuOpen.set(false);
    this.router.navigate([], { fragment: id, queryParamsHandling: 'preserve' });
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  openEmail() {
    const email = this.companyInfo()?.company_email || 'info@aliensverse.com';
    window.location.href = `mailto:${email}`;
  }

  openPhone() {
    const phone = this.companyInfo()?.company_phone || '+1000000000';
    window.location.href = `tel:${phone}`;
  }

  openWhatsApp() {
    const phone = (this.companyInfo()?.company_phone || '+1000000000').replace(
      /\D/g,
      '',
    );
    window.open(`https://wa.me/${phone}`, '_blank');
  }

  launchErp(): void {
    const dashboardPath = this.tenantResolver.buildUrl('erp/dashboard');
    this.router.navigateByUrl(dashboardPath);
  }

  launchActivation(): void {
    const activationPath = this.tenantResolver.buildUrl('activation');
    this.router.navigateByUrl(activationPath);
  }

  changeLanguage(langId: string) {
    const selected = this.languages().find((lang) => lang.id === langId);
    if (selected) {
      this.publicCtx.setLanguage(selected);
    }
  }

  getLogoSrc(): string {
    const info = this.companyInfo();
    if (this.isDark()) {
      return (
        info?.company_logo_dark ||
        info?.company_logo ||
        '/assets/logos/AliensVerse-DarkMode.png'
      );
    }
    return info?.company_logo || '/assets/logos/AliensVerse-LightMode.png';
  }

  private initStars() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeHandler);
    this.stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.4,
      vx: Math.random() * 0.18 - 0.09,
      vy: Math.random() * 0.18 - 0.09,
      opacity: Math.random(),
    }));
  }

  private resizeCanvas() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private animate() {
    if (!this.ctx || !this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Only animate if the canvas is actually visible to save CPU
    if (canvas.style.display !== 'none') {
      const isDark = this.themeService.currentTheme() === 'dark';
      this.stars.forEach((star) => {
        this.ctx!.beginPath();
        this.ctx!.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.ctx!.fillStyle = isDark
          ? `rgba(255,255,255,${star.opacity})`
          : `rgba(100,80,200,${star.opacity * 0.4})`;
        this.ctx!.fill();
        star.x += star.vx;
        star.y += star.vy;
        if (star.x < 0 || star.x > canvas.width) star.vx = -star.vx;
        if (star.y < 0 || star.y > canvas.height) star.vy = -star.vy;
      });
    }
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}
