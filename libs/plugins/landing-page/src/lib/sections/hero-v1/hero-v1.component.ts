import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionData } from '@aliens-verse/api-sdk';

@Component({
  selector: 'av-hero-v1',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="hero-v1">
      @if (data?.slides?.length > 0) {
        @for (slide of data.slides; track slide.title) {
          <article class="hero-slide">
            @if (slide.image) {
              <img
                class="hero-image"
                [src]="slide.image"
                [alt]="slide.title || 'Hero image'"
              />
            }
            @if (slide.video) {
              <video
                class="hero-video"
                autoplay
                muted
                loop
                [src]="slide.video"
              ></video>
            }
            <div class="hero-copy">
              @if (slide.title) {
                <h1>{{ slide.title }}</h1>
              }
              @if (slide.subtitle) {
                <h2>{{ slide.subtitle }}</h2>
              }
              @if (slide.description) {
                <div
                  class="hero-description"
                  [innerHTML]="slide.description"
                ></div>
              }
              @if (slide.buttonText && slide.buttonUrl) {
                <a class="hero-button" [href]="slide.buttonUrl">{{
                  slide.buttonText
                }}</a>
              }
            </div>
          </article>
        }
      } @else {
        <div class="hero-empty">No hero slides configured.</div>
      }
    </section>
  `,
})
export class HeroV1Component {
  @Input() settings: Record<string, string> = {};
  @Input() data: HeroSectionData | any;
}
