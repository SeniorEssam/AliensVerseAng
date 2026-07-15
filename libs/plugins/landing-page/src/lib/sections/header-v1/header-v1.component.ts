import {
  Component,
  Input,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
  PLATFORM_ID,
  computed,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  PublicContextService,
  TenantResolverService,
} from '@aliens-verse/api-sdk';
import { ThemeService } from '@aliens-verse/ui';
import { Router } from '@angular/router';

interface HeaderMenuItem {
  label: string;
  url: string;
}

@Component({
  selector: 'av-header-v1',
  standalone: true,
  imports: [CommonModule],
  template: `
    <canvas
      #starCanvas
      class="star-canvas"
      [style.display]="isDarkMode ? 'block' : 'none'"
    ></canvas>
    <nav class="navbar" [class.scrolled]="isScrolled">
      <div class="nav-inner">
        <a [href]="companyInfo()?.company_domain || '#'" class="nav-logo">
          <img
            *ngIf="logoUrl"
            [src]="logoUrl"
            [alt]="companyInfo()?.company_name || 'Logo'"
            class="logo-img"
          />
          <span class="logo-text" *ngIf="!logoUrl">{{
            companyInfo()?.company_name || 'Aliens Verse'
          }}</span>
        </a>
        <ul class="nav-links">
          <li *ngFor="let item of sectionItems">
            <a
              class="nav-link"
              [class.active]="activeSection === item.url.substring(1)"
              [href]="buildLink(item.url)"
              (click)="scrollToSection($event, item.url)"
            >
              {{ item.label }}
            </a>
          </li>
          
          <li class="nav-dropdown" *ngIf="pageItems.length > 0" (mouseenter)="isDropdownOpen = true" (mouseleave)="isDropdownOpen = false" style="position: relative; display: flex; align-items: center; height: 72px;">
            <button class="nav-link dropdown-toggle" style="display: flex; align-items: center; gap: 4px; padding-right: 8px;">
              Pages
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div class="dropdown-menu" *ngIf="isDropdownOpen" style="position: absolute; top: 100%; left: 0; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 8px; min-width: 160px; box-shadow: var(--shadow); z-index: 1000; display: flex; flex-direction: column; gap: 4px; margin-top: 0px;">
              <a *ngFor="let page of pageItems" class="nav-link" style="text-align: left; width: 100%; justify-content: flex-start; display: flex; text-decoration: none;" [href]="buildLink(page.url)" (click)="scrollToSection($event, page.url); isDropdownOpen = false;">
                {{ page.label }}
              </a>
            </div>
          </li>
        </ul>
        <div class="nav-actions">
          <button
            class="theme-toggle"
            (click)="toggleTheme()"
            [title]="isDarkMode ? 'Light Mode' : 'Dark Mode'"
          >
            <svg
              *ngIf="!isDarkMode"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            <svg
              *ngIf="isDarkMode"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </button>
          <button class="nav-cta" (click)="launchErp()">Launch ERP ›</button>
          <button class="hamburger" (click)="toggleMobileMenu()">
            <span [class.open]="isMobileMenuOpen"></span>
            <span [class.open]="isMobileMenuOpen"></span>
            <span [class.open]="isMobileMenuOpen"></span>
          </button>
        </div>
      </div>
      
      <!-- Mobile Menu -->
      <div class="mobile-menu" *ngIf="isMobileMenuOpen">
        <a class="mobile-link" style="text-decoration: none;" *ngFor="let item of sectionItems" [href]="buildLink(item.url)" (click)="scrollToSection($event, item.url); isMobileMenuOpen = false;">
          {{ item.label }}
        </a>
        <ng-container *ngIf="pageItems.length > 0">
          <div style="padding: 12px 8px 4px 8px; font-weight: 700; color: var(--text-primary); font-size: 0.9rem; letter-spacing: 0.05em; text-transform: uppercase;">
            Pages
          </div>
          <a class="mobile-link" style="padding-left: 20px; font-weight: 400; text-decoration: none;" *ngFor="let page of pageItems" [href]="buildLink(page.url)" (click)="scrollToSection($event, page.url); isMobileMenuOpen = false;">
            {{ page.label }}
          </a>
        </ng-container>
      </div>
    </nav>
  `,
  styles: [
    `
      .nav-link.active {
        color: #00d2ff !important;
        text-shadow: 0 0 10px rgba(0, 210, 255, 0.5);
      }
    `,
  ],
})
export class HeaderV1Component implements OnInit, AfterViewInit {
  @Input() settings: Record<string, string> = {};
  @Input() data: any;

  @ViewChild('starCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly publicCtx = inject(PublicContextService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly themeService = inject(ThemeService);

  private readonly tenantResolver = inject(TenantResolverService);
  private readonly router = inject(Router);

  readonly companyInfo = this.publicCtx.companyInfo;

  isScrolled = false;
  activeSection = '';

  get isDarkMode(): boolean {
    return this.themeService.currentTheme() === 'dark';
  }

  ngOnInit() {
    if (this.isBrowser) {
      window.addEventListener('scroll', () => {
        this.isScrolled = window.scrollY > 20;

        let currentSection = '';
        const sections = document.querySelectorAll('section[id]');
        sections.forEach((section) => {
          const sectionTop = (section as HTMLElement).offsetTop;
          if (window.scrollY >= sectionTop - 150) {
            currentSection = section.getAttribute('id') || '';
          }
        });
        this.activeSection = currentSection;
      });
      // Set initial dark mode on body
      if (this.isDarkMode) {
        document.body.classList.add('dark');
        const root = document.querySelector('.landing-root');
        if (root) root.classList.add('dark');
      }
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.initCanvas();
    }
  }

  get logoUrl(): string {
    const info = this.companyInfo();
    if (!info) return '';
    return this.isDarkMode
      ? info.company_logo_dark || info.company_logo
      : info.company_logo || info.company_logo_dark;
  }

  // reactive logo source that updates when theme or companyInfo change
  readonly logoSrc = computed(() => {
    const info = this.companyInfo();
    if (!info) return '';
    const isDark = this.themeService.currentTheme() === 'dark';
    return isDark
      ? info.company_logo_dark || info.company_logo
      : info.company_logo || info.company_logo_dark;
  });

  isMobileMenuOpen = false;
  isDropdownOpen = false;

  get sectionItems(): HeaderMenuItem[] {
    return this.publicCtx
      .sections()
      .filter((s) => s.isVisible && s.showInMenu && s.menuTitle)
      .sort((a, b) => (a.sort ?? a.sortOrder ?? a.sort_order ?? a.order ?? 0) - (b.sortOrder ?? b.sort ?? b.sort_order ?? b.order ?? 0))
      .map((s) => ({
        label: s.menuTitle!,
        url: s.anchorKey
          ? `#${s.anchorKey}`
          : `#${s.menuTitle!.toLowerCase().replace(/\s+/g, '-')}`,
      }));
  }

  get pageItems(): HeaderMenuItem[] {
    return this.publicCtx.pages()
      .filter((p: any) => p.isInNavHeader && !p.isHomePage)
      .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((p: any) => ({
        label: p.navLabel || p.name,
        url: `/${p.slug}`,
      }));
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  buildLink(url: string): string {
    if (url.startsWith('#')) {
      return this.router.url.split('#')[0] + url;
    }
    return url === '/' ? this.tenantResolver.buildUrl('') : this.tenantResolver.buildUrl(url.substring(1));
  }

  scrollToSection(event: Event, url: string) {
    if (url.startsWith('#')) {
      if (this.isBrowser) {
        event.preventDefault();
        const id = url.substring(1);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } else {
      // Allow default link behavior for middle-click or Ctrl+click
      const mouseEvent = event as MouseEvent;
      if (mouseEvent.ctrlKey || mouseEvent.metaKey || mouseEvent.button === 1) {
        return; // Browser will handle opening in new tab
      }
      
      event.preventDefault();
      const path = url === '/' ? this.tenantResolver.buildUrl('') : this.tenantResolver.buildUrl(url.substring(1));
      this.router.navigateByUrl(path);
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  launchErp() {
    const path = this.tenantResolver.buildUrl('erp');
    this.router.navigateByUrl(path);
  }

  // Simple Canvas Starfield
  initCanvas() {
    if (!this.isBrowser) return;

    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: any[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5,
        vx: Math.floor(Math.random() * 50) - 25,
        vy: Math.floor(Math.random() * 50) - 25,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        ctx.moveTo(star.x, star.y);
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2, true);
      }
      ctx.fill();
    };

    draw();
  }
}
