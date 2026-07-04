import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHostComponent } from '../section-host/section-host.component';
import { SectionItem } from '@aliens-verse/api-sdk';

@Component({
  selector: 'av-section-renderer',
  standalone: true,
  imports: [CommonModule, SectionHostComponent],
  template: `
    @if (section) {
      <section class="section-renderer" [id]="sectionId">
        <av-section-host [section]="section"></av-section-host>
      </section>
    } @else {
      <section class="section-fallback">
        <div class="fallback-card">
          <h2>Missing section</h2>
          <p>The section data is not available.</p>
        </div>
      </section>
    }
  `,
})
export class SectionRendererComponent {
  @Input() section: SectionItem | null = null;

  get sectionId(): string {
    if (!this.section) {
      return 'section-unknown';
    }
    return (
      this.section.id ||
      this.section.layout?.toLowerCase().replace(/\s+/g, '-') ||
      'section-unknown'
    );
  }
}
