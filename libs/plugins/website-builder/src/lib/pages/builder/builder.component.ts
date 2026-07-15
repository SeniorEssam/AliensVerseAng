import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map } from 'rxjs/operators';
import { WebsiteBuilderService } from '../../services/website-builder.service';

// Import subcomponents
import { BuilderCanvasComponent } from './components/builder-canvas/builder-canvas.component';
import { PropertiesPanelComponent } from './components/properties-panel/properties-panel.component';
import { LayoutPickerComponent } from './components/layout-picker/layout-picker.component';
import { AddSectionPickerComponent } from './components/add-section-picker/add-section-picker.component';
import { PageConfigModalComponent } from './components/page-config-modal/page-config-modal.component';
import { SvgIconComponent } from '../../../../../../shared/ui/src';
import { TenantResolverService } from '@aliens-verse/api-sdk';

@Component({
  selector: 'av-website-builder',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SvgIconComponent,
    BuilderCanvasComponent,
    PropertiesPanelComponent,
    LayoutPickerComponent,
    AddSectionPickerComponent,
    PageConfigModalComponent,
  ],
  templateUrl: './builder.component.html',
  styleUrl: './builder.component.scss',
})
export class BuilderComponent implements OnInit {
  readonly builderService = inject(WebsiteBuilderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tenantResolver = inject(TenantResolverService);

  readonly page = this.builderService.page;
  readonly loading = this.builderService.loading;
  readonly selectedSection = this.builderService.selectedSection;
  readonly layoutPickerOpen = this.builderService.pickerOpen;
  readonly pages = this.builderService.pages;

  readonly addSectionOpen = signal(false);
  readonly pageConfigOpen = signal(false);
  readonly selectedPageToEdit = signal<any | null>(null);

  ngOnInit(): void {
    this.builderService.loadPages();

    this.route.paramMap
      .pipe(map((params) => params.get('pageSlug') || 'home'))
      .subscribe((slug) => {
        this.builderService.loadPage(slug);
      });
  }

  onPageChange(event: Event): void {
    const slug = (event.target as HTMLSelectElement).value;
    if (slug) {
      const parentPath = this.route.snapshot.params['pageSlug'] ? '../' : './';
      this.router.navigate([parentPath, slug], { relativeTo: this.route });
    }
  }

  showCreatePage(): void {
    this.selectedPageToEdit.set(null);
    this.pageConfigOpen.set(true);
  }

  showEditPage(): void {
    const currentPage = this.page();
    if (!currentPage) return;

    const pageDetails = this.pages().find((p) => p.id === currentPage.pageId);
    if (pageDetails) {
      this.selectedPageToEdit.set(pageDetails);
      this.pageConfigOpen.set(true);
    }
  }

  savePageConfig(payload: any): void {
    const editPage = this.selectedPageToEdit();
    const parentPath = this.route.snapshot.params['pageSlug'] ? '../' : './';
    if (editPage) {
      // Update existing page
      this.builderService.updatePage(editPage.id, payload).subscribe({
        next: () => {
          this.pageConfigOpen.set(false);
          this.builderService.loadPages();
          this.router.navigate([parentPath, payload.slug], {
            relativeTo: this.route,
          });
        },
        error: (err) =>
          alert(err.error?.message || 'Failed to update page settings.'),
      });
    } else {
      // Create new page
      this.builderService.createPage(payload).subscribe({
        next: (res) => {
          this.pageConfigOpen.set(false);
          this.builderService.loadPages();
          this.router.navigate([parentPath, res.data.slug], {
            relativeTo: this.route,
          });
        },
        error: (err) => alert(err.error?.message || 'Failed to create page.'),
      });
    }
  }

  deletePage(): void {
    const page = this.page();
    if (!page) return;

    const confirmDel = confirm(
      `Are you sure you want to delete the page "${page.pageName}"? All its section mappings will be removed.`,
    );
    if (!confirmDel) return;

    this.builderService.deletePage(page.pageId).subscribe({
      next: () => {
        this.builderService.loadPages();
        const parentPath = this.route.snapshot.params['pageSlug']
          ? '../'
          : './';
        this.router.navigate([parentPath, 'home'], { relativeTo: this.route });
      },
      error: (err) => alert(err.error?.message || 'Failed to delete page.'),
    });
  }

  addSection(layoutId: string): void {
    const page = this.page();
    if (!page) return;

    this.builderService.addSection(page.pageId, layoutId).subscribe({
      next: () => {
        this.addSectionOpen.set(false);
        this.builderService.loadPage(page.pageName);
      },
      error: (err) => alert(err.error?.message || 'Failed to add section.'),
    });
  }

  // ...existing code...

  deleteSection(pageSectionId: string): void {
    const page = this.page();
    if (!page) return;

    const confirmDel = confirm(
      'Are you sure you want to delete this section from the page? Any settings you configured will be preserved if you add this layout section again later.',
    );
    if (!confirmDel) return;

    this.builderService.deleteSection(pageSectionId).subscribe({
      next: () => {
        this.builderService.loadPage(page.pageName);
      },
      error: (err) => alert(err.error?.message || 'Failed to delete section.'),
    });
  }

  onReorder(moveData: { id: string; direction: 'up' | 'down' }): void {
    this.builderService.reorder(moveData);
  }

  previewPage(): void {
    const slug = this.builderService.currentSlug();
    const path = slug === 'home' ? '' : slug;
    const url = this.tenantResolver.buildUrl(path);
    window.open(url, '_blank');
  }

  saveAll(): void {
    const page = this.page();
    if (!page) return;
    this.builderService.loadPage(page.pageName);
  }
}
