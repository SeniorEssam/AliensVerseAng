import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicContextService } from '@aliens-verse/api-sdk';

@Component({
  selector: 'av-about-v1',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      [id]="settings['anchorKey'] || 'about'"
      class="section about-section"
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
        <div class="about-grid">
          <div class="about-main">
            <div
              *ngIf="settings['description']"
              class="about-text"
              [innerHTML]="settings['description']"
            ></div>

            <div class="about-highlights" *ngIf="data?.highlights?.length">
              <div class="highlight" *ngFor="let item of data.highlights">
                <span class="highlight-icon" *ngIf="item.icon">{{
                  item.icon
                }}</span>
                <div>
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.description }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="about-visual">
            <div class="about-card">
              <div class="about-glow"></div>
              <div class="about-card-inner">
                <div class="tech-list" *ngIf="data?.techStack?.length">
                  <span
                    class="tech-badge"
                    *ngFor="let tech of data.techStack"
                    >{{ tech }}</span
                  >
                </div>
                <div class="about-metric-big" *ngFor="let stat of data?.stats">
                  <span class="big-val">{{ stat.value }}</span>
                  <span class="big-label">{{ stat.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AboutV1Component {
  @Input() settings: Record<string, string> = {};
  @Input() data: any;

  private readonly publicCtx = inject(PublicContextService);
  readonly companyInfo = this.publicCtx.companyInfo;
}
