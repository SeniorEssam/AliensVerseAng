import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionItem } from '@aliens-verse/api-sdk';
import { SectionRendererComponent } from '../section-renderer/section-renderer.component';

@Component({
  selector: 'av-page-renderer',
  standalone: true,
  imports: [CommonModule, SectionRendererComponent],
  template: `
    <div class="page-renderer">
      @if (isLoading) {
        <div class="page-loading">Loading website...</div>
      } @else {
        @if (sections && sections.length > 0) {
          @for (section of sections; track section.id) {
            <av-section-renderer [section]="section"></av-section-renderer>
          }
        } @else {
          <section class="section empty-state">
            <div class="empty-state-card">
              <h2>No sections available</h2>
              <p>Please verify the API response contains visible sections.</p>
            </div>
          </section>
        }
      }
    </div>
  `,
})
export class PageRendererComponent {
  @Input() sections: SectionItem[] = [];
  @Input() isLoading = false;
}
