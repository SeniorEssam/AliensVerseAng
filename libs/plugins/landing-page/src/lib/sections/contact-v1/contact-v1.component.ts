import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicContextService } from '@aliens-verse/api-sdk';

@Component({
  selector: 'av-contact-v1',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section [id]="settings['anchorKey'] || 'contact'" class="section contact-section">
      <div class="section-inner">
        <div class="section-header">
          <span class="section-tag" *ngIf="settings['tag']" [innerHTML]="settings['tag']"></span>
          <h2 class="section-title" *ngIf="settings['title']" [innerHTML]="settings['title']"></h2>
          <p class="section-subtitle" *ngIf="settings['subtitle']" [innerHTML]="settings['subtitle']"></p>
        </div>
        <div class="contact-grid">
          <div class="contact-card">
            <div class="contact-icon contact-icon--email">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div class="contact-info">
              <strong>{{ settings['emailLabel'] || 'Email Support' }}</strong>
              <span>{{ companyInfo()?.company_email || 'hello@aliensverse.com' }}</span>
              <small>{{ settings['emailSubLabel'] || '24/7 Support' }}</small>
            </div>
          </div>
          <div class="contact-card">
            <div class="contact-icon contact-icon--phone">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <div class="contact-info">
              <strong>{{ settings['phoneLabel'] || 'Call Us' }}</strong>
              <span>{{ companyInfo()?.company_phone || '+1 (555) 000-0000' }}</span>
              <small>{{ settings['phoneSubLabel'] || 'Mon-Fri, 9am-6pm' }}</small>
            </div>
          </div>
          <div class="contact-card" *ngFor="let item of data?.items">
            <div class="contact-icon" *ngIf="item.icon" [innerHTML]="item.icon"></div>
            <div class="contact-info">
              <strong>{{ item.title }}</strong>
              <span>{{ item.value }}</span>
              <small *ngIf="item.subtitle">{{ item.subtitle }}</small>
            </div>
          </div>
        </div>
        <div class="contact-cta-box">
          <h3 [innerHTML]="settings['ctaTitle'] || 'Ready to start your digital transformation?'"></h3>
          <p [innerHTML]="settings['ctaSubtitle'] || 'Our experts are ready to build your custom ERP, e-commerce, and software solutions.'"></p>
          <div class="contact-cta-actions">
            <button class="btn-primary">{{ settings['primaryButtonText'] || 'Start a Project' }}</button>
            <button class="btn-outline">{{ settings['secondaryButtonText'] || 'View Portfolio' }}</button>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ContactV1Component {
  @Input() settings: Record<string, string> = {};
  @Input() data: any;

  private readonly publicCtx = inject(PublicContextService);
  readonly companyInfo = this.publicCtx.companyInfo;
}
