import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionData } from '@aliens-verse/api-sdk';

@Component({
  selector: 'av-hero-v3',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="hero-v3" style="background: var(--colors-background-surface); color: var(--colors-text-primary); padding: var(--spacing-xl); text-align: center;">
      <h3>Hero Version 3</h3>
      @if (data.items?.length) {
        @for (slide of data.items; track slide.title) {
          <article class="hero-slide-v3">
            <h1>{{ slide.title }}</h1>
            <h2>{{ slide.subTitle }}</h2>
            <p>{{ slide.description }}</p>
            <button>{{ slide.buttonText }}</button>
          </article>
        }
      }
    </section>
  `,
})
export class HeroV3Component {
  @Input() settings: Record<string, string> = {};
  @Input() data!: HeroSectionData;
}
