import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionData } from '@aliens-verse/api-sdk';

@Component({
  selector: 'av-hero-v2',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="hero-v2">
      <div class="hero-container">
        @if (data?.items?.length) {
          @for (slide of data.items; track slide.title) {
            <article class="hero-slide-v2">
              <div class="hero-content">
                <h1 class="hero-title" *ngIf="slide.title">{{ slide.title }}</h1>
                <h2 class="hero-subtitle" *ngIf="slide.subTitle">{{ slide.subTitle }}</h2>
                <p class="hero-description" *ngIf="slide.description">{{ slide.description }}</p>
                
                <div class="hero-actions" *ngIf="slide.buttonText">
                  <a *ngIf="slide.buttonLink; else buttonOnly" [href]="slide.buttonLink" class="hero-button">
                    {{ slide.buttonText }}
                  </a>
                  <ng-template #buttonOnly>
                    <button class="hero-button">{{ slide.buttonText }}</button>
                  </ng-template>
                </div>
              </div>
              
              <div class="hero-image-wrapper" *ngIf="slide.heroImage">
                <img [src]="slide.heroImage" [alt]="slide.title || 'Hero Image'" class="hero-image" />
              </div>
            </article>
          }
        } @else if (settings && (settings['title'] || settings['subtitle'])) {
          <!-- Fallback to settings when items is empty -->
          <article class="hero-slide-v2">
            <div class="hero-content">
              <h1 class="hero-title" *ngIf="settings['title']">{{ settings['title'] }}</h1>
              <h2 class="hero-subtitle" *ngIf="settings['subtitle']">{{ settings['subtitle'] }}</h2>
              <p class="hero-description" *ngIf="settings['description']">{{ settings['description'] }}</p>
              
              <div class="hero-actions" *ngIf="settings['buttonText']">
                <a *ngIf="settings['buttonLink']; else buttonOnly" [href]="settings['buttonLink']" class="hero-button">
                  {{ settings['buttonText'] }}
                </a>
                <ng-template #buttonOnly>
                  <button class="hero-button">{{ settings['buttonText'] }}</button>
                </ng-template>
              </div>
            </div>
            
            <div class="hero-image-wrapper" *ngIf="settings['heroImage']">
              <img [src]="settings['heroImage']" [alt]="settings['title'] || 'Hero Image'" class="hero-image" />
            </div>
          </article>
        } @else {
          <!-- Fallback when no data items and no settings exist -->
          <div class="hero-empty">
            <div class="hero-empty-content"></div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .hero-v2 {
      width: 100%;
      min-height: calc(100vh - 80px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: linear-gradient(135deg, var(--colors-background-surface, #ffffff) 0%, var(--colors-background-surface-hover, #f8fafc) 100%);
      color: var(--colors-text-primary, #0f172a);
      position: relative;
      overflow: hidden;
    }
    
    @media (prefers-color-scheme: dark) {
      .hero-v2 {
        background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
        color: var(--colors-text-primary, #f8fafc);
      }
    }

    .hero-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: var(--spacing-xl, 4rem) 1.5rem;
    }

    .hero-slide-v2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
      min-height: 60vh;
    }

    /* If there is no image, make content take full width and center it */
    .hero-slide-v2:not(:has(.hero-image-wrapper)) {
      grid-template-columns: 1fr;
      text-align: center;
    }
    
    .hero-slide-v2:not(:has(.hero-image-wrapper)) .hero-actions {
      justify-content: center;
    }

    .hero-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      z-index: 10;
      animation: fadeInUp 0.8s ease-out forwards;
      opacity: 0;
      transform: translateY(20px);
    }

    .hero-title {
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 800;
      line-height: 1.1;
      margin: 0;
      background: linear-gradient(to right, var(--colors-primary-main, #4f46e5), var(--colors-secondary-main, #0ea5e9));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--colors-text-primary, #334155);
      margin: 0;
    }

    @media (prefers-color-scheme: dark) {
      .hero-subtitle {
        color: var(--colors-text-primary, #e2e8f0);
      }
    }

    .hero-description {
      font-size: 1.125rem;
      line-height: 1.7;
      color: var(--colors-text-secondary, #475569);
      max-width: 600px;
      margin: 0;
    }

    @media (prefers-color-scheme: dark) {
      .hero-description {
        color: var(--colors-text-secondary, #94a3b8);
      }
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .hero-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.875rem 2rem;
      font-size: 1.125rem;
      font-weight: 600;
      border-radius: 9999px;
      background: var(--colors-primary-main, #4f46e5);
      color: white;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.39);
    }

    .hero-button:hover {
      background: var(--colors-primary-dark, #4338ca);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.23);
    }

    .hero-image-wrapper {
      position: relative;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: fadeInRight 1s ease-out forwards;
      opacity: 0;
      transform: translateX(20px);
    }

    .hero-image {
      width: 100%;
      height: auto;
      object-fit: cover;
      display: block;
      transition: transform 0.5s ease;
    }

    .hero-image-wrapper:hover .hero-image {
      transform: scale(1.05);
    }

    .hero-empty {
      min-height: 40vh;
    }

    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInRight {
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @media (max-width: 1024px) {
      .hero-slide-v2 {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 2rem;
      }

      .hero-content {
        align-items: center;
      }

      .hero-description {
        margin: 0 auto;
      }

      .hero-actions {
        justify-content: center;
      }
    }
  `]
})
export class HeroV2Component {
  @Input() settings: Record<string, string> = {};
  @Input() data!: HeroSectionData;
}
