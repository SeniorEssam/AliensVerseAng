import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesSectionData } from '@aliens-verse/api-sdk';

@Component({
  selector: 'av-services-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="services-cards"
      style="padding: var(--spacing-xl); background: var(--colors-background-default); color: var(--colors-text-primary);"
    >
      <h3 style="text-align: center; color: var(--colors-primary-default);">
        Medical Services (Cards Version)
      </h3>
      <div
        style="display: flex; gap: var(--spacing-md); justify-content: center; flex-wrap: wrap; margin-top: var(--spacing-lg);"
      >
        @if (data.items.length) {
          @for (item of data.items; track item.title) {
            <article
              class="service-card"
              style="padding: var(--spacing-lg); background: var(--colors-background-surface); border-radius: var(--radius-md); width: 300px;"
            >
              <h4>{{ item.title }}</h4>
              <p>{{ item.shortDescription }}</p>
            </article>
          }
        }
      </div>
    </section>
  `,
})
export class ServicesCardsComponent {
  @Input() settings: Record<string, string> = {};
  @Input() data!: ServicesSectionData;
}
