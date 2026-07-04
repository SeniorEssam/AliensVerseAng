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
          <li *ngFor="let item of menuItems">
            <button
              class="nav-link"
              [class.active]="activeSection === item.url.substring(1)"
              (click)="scrollToSection($event, item.url)"
            >
              {{ item.label }}
            </button>
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
          <button class="hamburger">
            <span></span><span></span><span></span>
          </button>
        </div>
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

  get menuItems(): HeaderMenuItem[] {
    const dynamicItems = this.publicCtx
      .sections()
      .filter((s) => s.isVisible && s.showInMenu && s.menuTitle)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => ({
        label: s.menuTitle!,
        url: s.anchorKey
          ? `#${s.anchorKey}`
          : `#${s.menuTitle!.toLowerCase().replace(/\\s+/g, '-')}`,
      }));
    return dynamicItems;
  }

  scrollToSection(event: Event, url: string) {
    if (url.startsWith('#') && this.isBrowser) {
      event.preventDefault();
      const id = url.substring(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
