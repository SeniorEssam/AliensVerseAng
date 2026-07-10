import { Component, OnChanges, SimpleChanges, computed, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BuilderSection } from '../../../../models/builder.models';
import { MediaUploadService } from '../../../../services/media-upload.service';
import { TenantResolverService } from '@aliens-verse/api-sdk';
import { LookupService } from '@aliens-verse/lookup-sdk';
import { SvgIconComponent } from '@aliens-verse/ui';

@Component({
  selector: 'av-properties-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, SvgIconComponent],
  templateUrl: './properties-panel.component.html',
  styleUrl: './properties-panel.component.scss'
})
export class PropertiesPanelComponent implements OnChanges {
  private mediaUpload = inject(MediaUploadService);
  private tenantResolver = inject(TenantResolverService);
  private lookupService = inject(LookupService);

  section = input.required<BuilderSection>();
  save = output<{ sectionId: string; settings: Record<string, string> }>();
  changeLayout = output<void>();

  isTemplateCompany = computed(() => this.tenantResolver.companySlug() === 'aliensverse');

  // Local settings model to bind form fields
  settingsModel: Record<string, string> = {};

  // Custom setting modal states
  isAddSettingModalOpen = signal<boolean>(false);
  newSettingKey = '';
  newSettingValue = '';
  newSettingLanguageId = '';
  availableLanguages = this.lookupService.languages;

  // Image upload states
  uploadingKey = signal<string | null>(null);
  uploadingItemKey = signal<string | null>(null);

  // Cached parsed list data
  private parsedLists: Record<string, any[]> = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section()) {
      // Clone settings object so editing doesn't directly mutate parent state until saved
      this.settingsModel = { ...this.section().settings };
      this.parsedLists = {}; // Clear caches
    }
  }

  isImageField(key: string): boolean {
    const k = key.toLowerCase();
    return k.includes('image') || k.includes('logo') || k.includes('banner') || k.includes('photo') || k.includes('icon');
  }

  onFileSelected(key: string, event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    if (!file) return;

    this.uploadingKey.set(key);

    this.mediaUpload.uploadTemp(file).subscribe({
      next: res => {
        this.settingsModel[key] = res.url;
        this.uploadingKey.set(null);
      },
      error: () => {
        this.uploadingKey.set(null);
        alert('File upload failed. Please try again.');
      }
    });
  }

  onSave(): void {
    this.save.emit({
      sectionId: this.section().companySectionId,
      settings: this.settingsModel
    });
  }

  // Helper to format camelCase or under_score keys into human readable labels
  formatLabel(key: string): string {
    const result = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  // Returns array of setting keys for template loop
  getSettingKeys(): string[] {
    return Object.keys(this.settingsModel);
  }

  // --- JSON Structural Lists Management ---
  parseJsonList(key: string, value: string): any[] {
    if (!value) return [];
    if (!this.parsedLists[key]) {
      try {
        this.parsedLists[key] = JSON.parse(value);
      } catch {
        this.parsedLists[key] = [];
      }
    }
    return this.parsedLists[key];
  }

  saveJsonList(key: string): void {
    const list = this.parsedLists[key] || [];
    list.forEach((item, idx) => {
      item.sort = idx + 1;
    });
    this.settingsModel[key] = JSON.stringify(list);
  }

  addItem(key: string): void {
    const list = this.parseJsonList(key, this.settingsModel[key]);
    let newItem: any = { id: '00000000-0000-0000-0000-000000000000', sort: list.length + 1 };
    
    if (key === 'slides_json') {
      newItem = {
        ...newItem,
        title: 'New Slide',
        subTitle: 'Slide Subtitle',
        description: 'Slide description goes here...',
        buttonText: 'Explore Now',
        buttonUrl: '#'
      };
    } else if (key === 'pricing_plans_json') {
      newItem = {
        ...newItem,
        planName: 'Basic Plan',
        badge: 'Popular',
        price: 'Free',
        period: 'month',
        description: 'Perfect for starters...',
        buttonText: 'Get Started',
        isFeatured: false,
        features: [
          { id: '00000000-0000-0000-0000-000000000000', featureText: 'Feature 1', isIncluded: true, sort: 1 }
        ]
      };
    } else if (key === 'testimonials_json') {
      newItem = {
        ...newItem,
        clientName: 'Client Name',
        clientPosition: 'Manager',
        clientCompany: 'Company',
        rating: 5,
        imageUrl: ''
      };
    } else if (key === 'services_json') {
      newItem = {
        ...newItem,
        serviceName: 'New Service',
        title: 'Premium Service Offering',
        shortDescription: 'We provide elite solutions...',
        imageUrl: ''
      };
    }

    list.push(newItem);
    this.saveJsonList(key);
  }

  deleteItem(key: string, index: number): void {
    const list = this.parseJsonList(key, this.settingsModel[key]);
    if (index >= 0 && index < list.length) {
      list.splice(index, 1);
      this.saveJsonList(key);
    }
  }

  moveItemUp(key: string, index: number): void {
    const list = this.parseJsonList(key, this.settingsModel[key]);
    if (index === 0) return;
    const current = list[index];
    const prev = list[index - 1];
    list[index] = prev;
    list[index - 1] = current;
    this.saveJsonList(key);
  }

  moveItemDown(key: string, index: number): void {
    const list = this.parseJsonList(key, this.settingsModel[key]);
    if (index === list.length - 1) return;
    const current = list[index];
    const next = list[index + 1];
    list[index] = next;
    list[index + 1] = current;
    this.saveJsonList(key);
  }

  // --- Pricing features list ---
  addFeature(plan: any): void {
    if (!plan.features) plan.features = [];
    plan.features.push({
      id: '00000000-0000-0000-0000-000000000000',
      featureText: 'Benefit point',
      isIncluded: true,
      sort: plan.features.length + 1
    });
    this.saveJsonList('pricing_plans_json');
  }

  deleteFeature(plan: any, index: number): void {
    if (plan.features && index >= 0 && index < plan.features.length) {
      plan.features.splice(index, 1);
      this.saveJsonList('pricing_plans_json');
    }
  }

  // --- Sub item image uploader ---
  onItemFileSelected(key: string, item: any, imageField: string, event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    if (!file) return;

    const uniqueKey = key + '-' + item.id + '-' + imageField;
    this.uploadingItemKey.set(uniqueKey);

    this.mediaUpload.uploadTemp(file).subscribe({
      next: res => {
        item[imageField] = res.url;
        this.uploadingItemKey.set(null);
        this.saveJsonList(key);
      },
      error: () => {
        this.uploadingItemKey.set(null);
        alert('File upload failed. Please try again.');
      }
    });
  }

  // --- Dynamic Custom settings Key addition/deletion for Template Admins ---
  openAddSettingModal(): void {
    this.newSettingKey = '';
    this.newSettingValue = '';
    const langs = this.availableLanguages();
    this.newSettingLanguageId = langs.length > 0 ? langs[0].id : '';
    this.isAddSettingModalOpen.set(true);
  }

  closeAddSettingModal(): void {
    this.isAddSettingModalOpen.set(false);
  }

  confirmAddSetting(): void {
    const key = this.newSettingKey.trim().replace(/\s+/g, '_');
    if (!key) {
      alert('Setting Key is required!');
      return;
    }
    if (!this.newSettingLanguageId) {
      alert('Language selection is required!');
      return;
    }
    const compositeKey = `${key}__${this.newSettingLanguageId}`;
    if (this.settingsModel[compositeKey] !== undefined) {
      alert('This setting key already exists for this language!');
      return;
    }
    this.settingsModel[compositeKey] = this.newSettingValue;
    this.closeAddSettingModal();
  }

  getSettingKeyName(key: string): string {
    if (key.includes('__')) {
      return key.split('__')[0];
    }
    return key;
  }

  getSettingLanguageId(key: string): string {
    if (key.includes('__')) {
      return key.split('__')[1];
    }
    return '';
  }

  getLanguageName(langId: string): string {
    const lang = this.availableLanguages().find(l => l.id === langId);
    return lang ? lang.name : 'Unknown';
  }

  deleteSettingKey(key: string): void {
    if (confirm(`Are you sure you want to delete the setting "${this.getSettingKeyName(key)}"?`)) {
      delete this.settingsModel[key];
    }
  }
}
