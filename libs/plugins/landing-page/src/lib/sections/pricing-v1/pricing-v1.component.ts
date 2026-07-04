import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicContextService } from '@aliens-verse/api-sdk';

@Component({
  selector: 'av-pricing-v1',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      [id]="settings['anchorKey'] || 'pricing'"
      class="pricing-section section"
    >
      <div class="section-inner">
        <div class="section-header">
          <span
            class="section-tag"
            *ngIf="settings['tag']"
            [innerHTML]="settings['tag']"
          ></span>
          <h2
            class="section-title"
            *ngIf="settings['title']"
            [innerHTML]="settings['title']"
          ></h2>
          <p
            class="section-subtitle"
            *ngIf="settings['subtitle']"
            [innerHTML]="settings['subtitle']"
          ></p>
        </div>
        <div class="pricing-grid" *ngIf="data?.plans?.length">
          <div
            class="pricing-card"
            *ngFor="let plan of data.plans"
            [class.pricing-card--featured]="plan.isFeatured"
            [class.selected]="plan.isFeatured"
          >
            <div class="pricing-badge" *ngIf="plan.badge">{{ plan.badge }}</div>
            <div class="pricing-header">
              <span class="plan-name">{{ plan.name }}</span>
              <div class="plan-price" *ngIf="!plan.isCustomPrice">
                <span class="price-currency">{{ plan.currency || '$' }}</span>
                <span class="price-amount">{{ plan.price }}</span>
                <span class="price-period">{{ plan.period || '/mo' }}</span>
              </div>
              <div class="plan-price" *ngIf="plan.isCustomPrice">
                <span class="price-custom">{{ plan.price }}</span>
              </div>
              <p class="plan-desc">{{ plan.description }}</p>
            </div>
            <ul class="plan-features" *ngIf="plan.features?.length">
              <li
                *ngFor="let feature of plan.features"
                [class.muted]="!feature.isIncluded"
              >
                <span class="check" *ngIf="feature.isIncluded">✓</span>
                <span class="cross" *ngIf="!feature.isIncluded">✗</span>
                {{ feature.featureText }}
              </li>
            </ul>
            <button
              class="plan-cta"
              [class.plan-cta--primary]="plan.isFeatured"
              [class.plan-cta--outline]="!plan.isFeatured"
            >
              {{ plan.buttonText || 'Get Started' }}
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class PricingV1Component {
  @Input() settings: Record<string, string> = {};
  @Input() data: any;

  private readonly publicCtx = inject(PublicContextService);
  readonly companyInfo = this.publicCtx.companyInfo;
}
