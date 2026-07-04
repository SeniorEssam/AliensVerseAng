import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Type,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionItem, GlobalComponentRegistryService } from '@aliens-verse/api-sdk';

type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

@Component({
  selector: 'av-section-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (section) {
      @switch (loadState) {
        @case ('loading') {
          <section class="section-host-loading" role="status" aria-label="Loading section">
            <div class="loading-placeholder">
              <div class="loading-shimmer"></div>
            </div>
          </section>
        }
        @case ('loaded') {
          @if (componentType) {
            <ng-container
              *ngComponentOutlet="
                componentType;
                inputs: { settings: section.settings, data: section.data }
              "
            ></ng-container>
          }
        }
        @case ('error') {
          <section class="section-host-error" role="alert">
            <div class="error-card">
              <span class="error-icon">⚠️</span>
              <p>تعذر تحميل هذا القسم ({{ errorComponentId }})</p>
            </div>
          </section>
        }
      }
    }
  `,
  styles: [`
    .section-host-loading {
      min-height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .loading-placeholder {
      width: 100%;
      max-width: 800px;
      height: 80px;
      border-radius: var(--radius-md, 0.5rem);
      overflow: hidden;
    }
    .loading-shimmer {
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        var(--colors-background-surface, #f1f5f9) 25%,
        var(--colors-background-surface-hover, #e2e8f0) 50%,
        var(--colors-background-surface, #f1f5f9) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .section-host-error {
      padding: var(--spacing-md, 1rem);
      text-align: center;
    }
    .error-card {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: var(--colors-background-surface, #fef2f2);
      border: 1px solid var(--colors-status-danger, #fecaca);
      border-radius: var(--radius-md, 0.5rem);
      color: var(--colors-text-secondary, #991b1b);
      font-size: var(--typography-body-small, 0.875rem);
    }
    .error-icon { font-size: 1.25rem; }
  `]
})
export class SectionHostComponent implements OnChanges {
  @Input() section: SectionItem | null = null;

  componentType: Type<unknown> | null = null;
  loadState: LoadState = 'idle';
  errorComponentId = '';

  constructor(
    private readonly registry: GlobalComponentRegistryService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    const sectionChange = changes['section'];
    if (sectionChange && this.section) {
      const identifier = this.section.component || this.section.layout;
      this.loadState = 'loading';
      this.errorComponentId = '';
      this.componentType = null;

      try {
        this.componentType = await this.registry.resolveComponent(identifier);
        this.loadState = 'loaded';
      } catch {
        // If primary identifier fails, try layout as fallback
        if (identifier !== this.section.layout) {
          try {
            this.componentType = await this.registry.resolveComponent(this.section.layout);
            this.loadState = 'loaded';
          } catch {
            this.loadState = 'error';
            this.errorComponentId = identifier;
          }
        } else {
          this.loadState = 'error';
          this.errorComponentId = identifier;
        }
      }

      this.cdr.detectChanges();
    }
  }
}
