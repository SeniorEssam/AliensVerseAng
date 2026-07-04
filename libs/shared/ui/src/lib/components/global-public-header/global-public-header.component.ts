import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicContextService, LanguageItem } from '@aliens-verse/api-sdk';
import { AppLogoComponent } from '../app-logo/app-logo.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'av-global-public-header',
  standalone: true,
  imports: [CommonModule, RouterLink, AppLogoComponent],
  templateUrl: './global-public-header.component.html',
  styleUrl: './global-public-header.component.scss'
})
export class GlobalPublicHeaderComponent implements OnInit {
  private readonly publicCtx = inject(PublicContextService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly companyInfo = this.publicCtx.companyInfo;
  readonly languages = this.publicCtx.languages;
  readonly currentLang = this.publicCtx.currentLang;

  isLangDropdownOpen = false;

  async ngOnInit() {
    await this.publicCtx.initContext();
  }

  toggleDropdown() {
    this.isLangDropdownOpen = !this.isLangDropdownOpen;
  }

  selectLanguage(lang: LanguageItem) {
    this.publicCtx.setLanguage(lang);
    this.isLangDropdownOpen = false;
  }

  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
