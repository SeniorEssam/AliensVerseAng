import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicContextService } from '@aliens-verse/api-sdk';

@Component({
  selector: 'av-hero-dark',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section [id]="settings['anchorKey'] || 'home'" class="hero-section">
      <div class="hero-glow hero-glow--left"></div>
      <div class="hero-glow hero-glow--right"></div>
      <div class="hero-inner">
        <div class="hero-content">
          <div class="hero-badge" *ngIf="settings['badge']">
            <span class="badge-dot"></span>
            <span [innerHTML]="settings['badge']"></span>
          </div>
          <h1 class="hero-title" [innerHTML]="settings['title']"></h1>
          <p class="hero-desc" [innerHTML]="settings['subtitle']"></p>
          
          <div class="hero-actions">
            <button class="btn-primary"> {{ settings['primaryButtonText'] || 'Explore Services' }} <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"></path></svg></button>
            <button class="btn-outline"> {{ settings['secondaryButtonText'] || 'Get In Touch' }} </button>
          </div>
          
          <div class="hero-stats" *ngIf="data?.stats?.length">
            <ng-container *ngFor="let stat of data.stats; let last = last">
              <div class="stat-item">
                <span class="stat-value">{{ stat.value }}</span>
                <span class="stat-label">{{ stat.label }}</span>
              </div>
              <div class="stat-divider" *ngIf="!last"></div>
            </ng-container>
          </div>
        </div>
        
        <div class="hero-visual">
          <div class="hero-card">
            <div class="card-grid-overlay"></div>
            <div class="card-header">
              <div class="card-icon"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg></div>
              <span class="card-live">LIVE</span>
            </div>
            <div class="card-body">
              <h3>{{ companyInfo()?.company_domain }}</h3>
              <p>{{ companyInfo()?.company_email }}</p>
              <div class="card-progress"><div class="card-progress-bar"></div></div>
              <div class="card-metrics">
                <div class="metric"><span class="metric-val">99.9%</span><span class="metric-key">Uptime</span></div>
                <div class="metric"><span class="metric-val">2ms</span><span class="metric-key">Latency</span></div>
                <div class="metric"><span class="metric-val">∞</span><span class="metric-key">Scale</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class HeroDarkComponent {
  @Input() settings: Record<string, string> = {};
  @Input() data: any;

  private readonly publicCtx = inject(PublicContextService);
  readonly companyInfo = this.publicCtx.companyInfo;
}
