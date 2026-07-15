import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from '@aliens-verse/api-sdk';
import { Observable, firstValueFrom } from 'rxjs';
import {
  BuilderPage,
  BuilderSection,
  PageListItem,
  LayoutGroup,
} from '../models/builder.models';

@Injectable({ providedIn: 'root' })
export class WebsiteBuilderService {
  private api = inject(ApiService);

  private _page = signal<BuilderPage | null>(null);
  private _loading = signal(false);
  private _selectedId = signal<string | null>(null);
  private _pickerOpen = signal(false);
  private _currentSlug = signal('home');
  private _pages = signal<PageListItem[]>([]);
  private _allLayouts = signal<LayoutGroup[]>([]);

  readonly page = computed(() => this._page());
  readonly loading = computed(() => this._loading());
  readonly pickerOpen = computed(() => this._pickerOpen());
  readonly pages = computed(() => this._pages());
  readonly allLayouts = computed(() => this._allLayouts());
  readonly currentSlug = computed(() => this._currentSlug());
  readonly selectedSection = computed(
    () =>
      this._page()?.sections.find(
        (s) => s.companySectionId === this._selectedId(),
      ) ?? null,
  );

  loadPages(): void {
    this.api.get<any>('website-builder/pages').subscribe({
      next: (res) => this._pages.set(res?.data ?? []),
      error: () => this._pages.set([]),
    });
  }

  createPage(pageData: any): Observable<any> {
    return this.api.post<any>('website-builder/page', pageData);
  }

  updatePage(pageId: string, pageData: any): Observable<any> {
    return this.api.put<any>(`website-builder/page/${pageId}`, pageData);
  }

  deletePage(pageId: string): Observable<any> {
    return this.api.delete<any>(`website-builder/page/${pageId}`);
  }

  loadAllLayouts(): void {
    this.api.get<any>('website-builder/layouts').subscribe({
      next: (res) => this._allLayouts.set(res?.data ?? []),
      error: () => this._allLayouts.set([]),
    });
  }

  addSection(pageId: string, layoutId: string): Observable<any> {
    return this.api.post<any>(`website-builder/page/${pageId}/section`, {
      layoutId,
    });
  }

  deleteSection(pageSectionId: string): Observable<any> {
    return this.api.delete<any>(`website-builder/section/${pageSectionId}`);
  }

  loadPage(slug: string): void {
    this._currentSlug.set(slug);
    this._loading.set(true);
    this.api.get<any>(`website-builder/page/${slug}`).subscribe({
      next: (res) => {
        this._page.set(res?.data ?? null);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  selectSection(id: string | null): void {
    this._selectedId.set(id);
  }

  openPicker(): void {
    this._pickerOpen.set(true);
  }

  closePicker(): void {
    this._pickerOpen.set(false);
  }

  switchLayout(sectionId: string, newLayoutId: string): void {
    this.api
      .patch<any>('website-builder/switch-layout', {
        companySectionId: sectionId,
        newLayoutId,
      })
      .subscribe(() => {
        this.closePicker();
        this.loadPage(this._currentSlug());
      });
  }

  saveSettings(sectionId: string, settings: Record<string, string>): void {
    this.api
      .patch<any>(`website-builder/section/${sectionId}/settings`, settings)
      .subscribe({
        next: () => {
          // Optimistically update the UI settings
          this._page.update((page) => {
            if (!page) return page;
            return {
              ...page,
              sections: page.sections.map((s) =>
                s.companySectionId === sectionId ? { ...s, settings } : s,
              ),
            };
          });
        },
      });
  }

  toggleVisibility(pageSectionId: string, isVisible: boolean): void {
    this.api
      .post<any>(
        `website-builder/section/${pageSectionId}/visibility`,
        isVisible,
      )
      .subscribe({
        next: () => {
          this._page.update((page) => {
            if (!page) return page;
            return {
              ...page,
              sections: page.sections.map((s) =>
                s.pageSectionId === pageSectionId ? { ...s, isVisible } : s,
              ),
            };
          });
        },
      });
  }

  reorder(moveData: { id: string; direction: 'up' | 'down' }): void {
    const pageId = this._page()?.pageId;
    if (!pageId) return;

    const currentSections = this._page()?.sections ?? [];
    const currentIndex = currentSections.findIndex(
      (s) => s.companySectionId === moveData.id,
    );

    if (currentIndex === -1) return;

    // Determine swap index based on direction
    const swapIndex =
      moveData.direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (swapIndex < 0 || swapIndex >= currentSections.length) return;

    // Create reorder payload with updated sort values
    const items = currentSections.map((s, idx) => ({
      sectionId: s.companySectionId,
      sort:
        idx === currentIndex
          ? swapIndex
          : idx === swapIndex
            ? currentIndex
            : idx,
    }));

    this.api
      .patch<any>(`website-builder/page/${pageId}/reorder`, items)
      .subscribe({
        next: () => {
          this._page.update((page) => {
            if (!page) return page;
            const newSections = [...page.sections];
            [newSections[currentIndex], newSections[swapIndex]] = [
              newSections[swapIndex],
              newSections[currentIndex],
            ];
            return { ...page, sections: newSections };
          });
        },
      });
  }
}
