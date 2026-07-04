import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicContextService } from '@aliens-verse/api-sdk';
import { ThemeService } from '@aliens-verse/ui';

@Component({
  selector: 'av-footer-v1',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer [id]="settings['anchorKey'] || 'footer'" class="footer">
      <div class="footer-inner">
        <div class="footer-top">
          <div class="footer-brand">
            <img
              [alt]="companyInfo()?.company_name || 'Logo'"
              class="footer-logo"
              [src]="logoUrl"
              *ngIf="logoUrl"
            />
            <span class="footer-brand-name">{{
              companyInfo()?.company_name || 'Aliens Verse'
            }}</span>
            <p class="footer-brand-desc">
              {{
                settings['description'] ||
                  'Enterprise-grade cloud infrastructure and custom software solutions tailored for modern businesses worldwide.'
              }}
            </p>
            <div class="footer-contact-quick">
              <button
                class="footer-contact-btn"
                *ngIf="companyInfo()?.company_email"
              >
                ✉ {{ companyInfo()?.company_email }}
              </button>
              <button
                class="footer-contact-btn"
                *ngIf="companyInfo()?.company_phone"
              >
                📞 {{ companyInfo()?.company_phone }}
              </button>
            </div>
          </div>
          <div class="footer-cols" *ngIf="data?.columns?.length">
            <div class="footer-col" *ngFor="let col of data.columns">
              <h4>{{ col.title }}</h4>
              <ul *ngIf="col.links?.length">
                <li *ngFor="let link of col.links">
                  <a *ngIf="link.url" [href]="link.url">{{ link.label }}</a>
                  <button *ngIf="!link.url">{{ link.label }}</button>
                </li>
              </ul>
            </div>
          </div>
          <!-- Fallback columns if none provided from DB -->
          <div class="footer-cols" *ngIf="!data?.columns?.length">
            <div class="footer-col">
              <h4>Company</h4>
              <ul>
                <li><button>About</button></li>
                <li><button>Services</button></li>
                <li><button>Our Work</button></li>
                <li><button>Pricing</button></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Solutions</h4>
              <ul>
                <li><button>ERP Systems</button></li>
                <li><button>E-commerce</button></li>
                <li><button>Custom Software</button></li>
                <li><button>Cloud &amp; DevOps</button></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Connect</h4>
              <ul>
                <li><a href="https://linkedin.com">in LinkedIn</a></li>
                <li><a href="https://twitter.com">𝕏 Twitter</a></li>
                <li><a href="https://wa.me/">💬 WhatsApp</a></li>
                <li><button>📧 Contact Sales</button></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span
            >&copy; {{ currentYear }}
            {{ companyInfo()?.company_name || 'Aliens Verse' }}. All rights
            reserved.</span
          >
        </div>
      </div>
    </footer>
  `,
})
export class FooterV1Component {
  @Input() settings: Record<string, string> = {};
  @Input() data: any;

  private readonly publicCtx = inject(PublicContextService);
  private readonly themeService = inject(ThemeService);
  readonly companyInfo = this.publicCtx.companyInfo;

  get currentYear(): number {
    return new Date().getFullYear();
  }

  get logoUrl(): string {
    const info = this.companyInfo();
    if (!info) return '';
    // Choose logo based on current theme
    const isDark = this.themeService.currentTheme() === 'dark';
    if (isDark) return info.company_logo_dark || info.company_logo || '';
    return info.company_logo || info.company_logo_dark || '';
  }
}
