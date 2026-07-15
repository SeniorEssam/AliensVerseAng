import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesSectionData } from '@aliens-verse/api-sdk';

@Component({
  selector: 'av-services-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="services-grid" style="padding: var(--spacing-xl); background: var(--colors-background-default);">
      <h3>Our Services (Grid Layout)</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--spacing-md); margin-top: var(--spacing-lg);">
        @if (data.items.length) {
          @for (service of data.items; track service.title) {
            <article class="service-item" style="padding: var(--spacing-lg); background: var(--colors-background-surface); border: 1px solid var(--colors-background-surface-hover);">
              <h4>{{ service.title }}</h4>
              <p>{{ service.shortDescription }}</p>
            </article>
          }
        }
      </div>
    </section>
  `,
})
export class ServicesGridComponent {
  @Input() settings: Record<string, string> = {};
  @Input() data!: ServicesSectionData;
}
