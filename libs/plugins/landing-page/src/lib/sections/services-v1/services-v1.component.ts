import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicContextService } from '@aliens-verse/api-sdk';

@Component({
  selector: 'av-services-v1',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section [id]="settings['anchorKey'] || 'services'" class="section services-section">
      <div class="section-inner">
        <div class="section-header">
          <span class="section-tag" *ngIf="settings['tag']" [innerHTML]="settings['tag']"></span>
          <h2 class="section-title" *ngIf="settings['title']" [innerHTML]="settings['title']"></h2>
          <p class="section-subtitle" *ngIf="settings['subtitle']" [innerHTML]="settings['subtitle']"></p>
        </div>
        <div class="services-grid" *ngIf="data?.items?.length">
          <div class="service-card" *ngFor="let item of data.items" [class.service-card--featured]="item.isFeatured">
            <div class="service-icon" *ngIf="item.icon" [innerHTML]="item.icon"></div>
            <span class="service-tag" *ngIf="item.tag">{{ item.tag }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <ul class="service-features" *ngIf="item.features?.length">
              <li *ngFor="let feature of item.features">{{ feature }}</li>
            </ul>
            <button class="service-link" *ngIf="item.linkText">{{ item.linkText }}</button>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ServicesV1Component {
  @Input() settings: Record<string, string> = {};
  @Input() data: any;
  
  private readonly publicCtx = inject(PublicContextService);
  readonly companyInfo = this.publicCtx.companyInfo;
}
