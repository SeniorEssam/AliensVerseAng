import { Component, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'av-logo',
  standalone: true,
  imports: [CommonModule],
  template: ` <img [src]="logoSrc()" [alt]="alt()" [class]="className()" /> `,
  styles: [
    `
      :host {
        display: block;
      }
      img {
        height: 100px;
        width: auto;
        object-fit: contain;
      }
    `,
  ],
})
export class AppLogoComponent {
  private readonly themeService = inject(ThemeService);

  readonly alt = input<string>('AliensVerse Logo');
  readonly className = input<string>('');

  // Custom Dynamic Logos Inputs
  readonly companyLogo = input<string | null | undefined>(null);
  readonly companyLogoDark = input<string | null | undefined>(null);

  // Explicit Dark Mode Override
  readonly forceDark = input<boolean>(false);

  readonly logoSrc = computed(() => {
    const isDark =
      this.forceDark() || this.themeService.currentTheme() === 'dark';

    if (isDark) {
      return (
        this.companyLogoDark() ||
        this.companyLogo() ||
        '/assets/logos/AliensVerse-DarkMode.png'
      );
    } else {
      return this.companyLogo() || '/assets/logos/AliensVerse-LightMode.png';
    }
  });
}
