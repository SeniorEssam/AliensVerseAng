import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebProfileScriptsService } from '../../services/web-profile-scripts.service';

interface ConsentState {
  required: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = 'web-profile-consent';

@Component({
  selector: 'av-consent-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="consent-banner fixed bottom-0 left-0 right-0 z-[9999] bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 md:p-6 transition-transform">
        <div class="consent-inner max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="consent-copy text-left">
            <h3 class="text-lg font-bold text-zinc-900 dark:text-white mb-1">Privacy preferences</h3>
            <p class="text-sm text-zinc-600 dark:text-zinc-400">
              We use cookies and scripts to improve your experience. You can
              manage the categories below.
            </p>
          </div>
          <div class="consent-actions flex flex-wrap items-center gap-3">
            <button class="px-4 py-2 text-sm font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors" (click)="rejectAll()">
              Reject All
            </button>
            <button class="px-4 py-2 text-sm font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 transition-colors" (click)="customize()">
              Customize
            </button>
            <button class="px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md shadow-blue-500/20" (click)="acceptAll()">
              Accept All
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConsentBannerComponent {
  private readonly scriptService = inject(WebProfileScriptsService);

  readonly visible = signal(false);
  readonly consent = signal<ConsentState>({
    required: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  constructor() {
    this.loadConsent();
  }

  acceptAll() {
    this.applyConsent({
      required: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  }

  rejectAll() {
    this.applyConsent({
      required: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  }

  customize() {
    this.applyConsent({
      required: true,
      functional: true,
      analytics: false,
      marketing: false,
    });
  }

  private loadConsent() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const state = JSON.parse(raw) as ConsentState;
        this.consent.set({
          required: true,
          functional: !!state.functional,
          analytics: !!state.analytics,
          marketing: !!state.marketing,
        });
        this.visible.set(false);
        this.scriptService.updateConsent(this.consent());
        return;
      }
    } catch {
      // ignore malformed storage data
    }

    this.visible.set(true);
  }

  private applyConsent(state: ConsentState) {
    this.consent.set(state);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    this.visible.set(false);
    this.scriptService.updateConsent(state);
  }
}
