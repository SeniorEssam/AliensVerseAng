import { Component, OnInit, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SvgIconComponent } from '@aliens-verse/ui';
import { TenantResolverService } from '@aliens-verse/api-sdk';
import { PageListItem } from '../../../../models/builder.models';

@Component({
  selector: 'av-page-config-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, SvgIconComponent],
  templateUrl: './page-config-modal.component.html',
  styleUrl: './page-config-modal.component.scss'
})
export class PageConfigModalComponent implements OnInit {
  private tenantResolver = inject(TenantResolverService);
  isTemplateCompany = computed(() => this.tenantResolver.companySlug() === 'aliensverse');

  page = input<PageListItem | null>(null);

  save = output<any>();
  close = output<void>();

  // Form Fields
  pageName = '';
  slug = '';
  isInNavHeader = false;
  isInNavFooter = false;
  navLabel = '';
  sitemapPriority = 0.8;
  sitemapChangeFreq = 5; // Default Monthly
  sitemapInclude = true;
  pageStatus = 2; // Default Published
  active = true;

  // SEO & Scripts Fields
  metaTitle = '';
  metaDescription = '';
  keywords = '';
  customHeaderScript = '';
  customBodyScript = '';

  ngOnInit(): void {
    const existing = this.page();
    if (existing) {
      this.pageName = existing.pageName;
      this.slug = existing.slug;
      this.isInNavHeader = existing.isInNavHeader;
      this.isInNavFooter = existing.isInNavFooter;
      this.navLabel = existing.navLabel || '';
      this.sitemapPriority = existing.sitemapPriority;
      this.sitemapChangeFreq = existing.sitemapChangeFreq;
      this.sitemapInclude = existing.sitemapInclude;
      this.pageStatus = existing.pageStatus;
      this.active = existing.active;

      // Cast to any to read populated DTO fields
      const anyExisting = existing as any;
      this.metaTitle = anyExisting.metaTitle || '';
      this.metaDescription = anyExisting.metaDescription || '';
      this.keywords = anyExisting.keywords || '';
      this.customHeaderScript = anyExisting.customHeaderScript || '';
      this.customBodyScript = anyExisting.customBodyScript || '';
    }
  }

  onSubmit(): void {
    if (!this.pageName.trim() || !this.slug.trim()) {
      alert('Page Name and Slug/URL are required.');
      return;
    }

    this.save.emit({
      pageName: this.pageName.trim(),
      slug: this.slug.trim().toLowerCase(),
      isInNavHeader: this.isInNavHeader,
      isInNavFooter: this.isInNavFooter,
      navLabel: this.navLabel.trim() || null,
      sitemapPriority: Number(this.sitemapPriority),
      sitemapChangeFreq: Number(this.sitemapChangeFreq),
      sitemapInclude: this.sitemapInclude,
      pageStatus: Number(this.pageStatus),
      active: this.active,

      // SEO & Tracking Scripts payloads
      metaTitle: this.metaTitle.trim() || null,
      metaDescription: this.metaDescription.trim() || null,
      keywords: this.keywords.trim() || null,
      customHeaderScript: this.customHeaderScript.trim() || null,
      customBodyScript: this.customBodyScript.trim() || null
    });
  }
}
