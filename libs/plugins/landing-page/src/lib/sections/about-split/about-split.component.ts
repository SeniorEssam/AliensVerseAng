import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutSectionData } from '@aliens-verse/api-sdk';

@Component({
  selector: 'av-about-split',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="about-split" style="display: flex; padding: var(--spacing-xl); background: var(--colors-background-default);">
      <div style="flex: 1; padding-right: var(--spacing-xl);">
        <h2>{{ data.title }}</h2>
        <p class="short-desc">{{ data.shortDescription }}</p>
        <p class="long-desc">{{ data.longDescription }}</p>
        <div class="mission-vision">
          <div><strong>Mission:</strong> {{ data.mission }}</div>
          <div><strong>Vision:</strong> {{ data.vision }}</div>
        </div>
      </div>
      <div style="flex: 1; background: var(--colors-background-surface);">
        <!-- Split image placeholder -->
      </div>
    </section>
  `,
})
export class AboutSplitComponent {
  @Input() settings: Record<string, string> = {};
  @Input() data!: AboutSectionData;
}
