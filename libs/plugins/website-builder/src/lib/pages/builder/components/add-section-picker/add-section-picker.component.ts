import { Component, OnInit, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteBuilderService } from '../../../../services/website-builder.service';
import { SvgIconComponent } from '@aliens-verse/ui';
import { LayoutItem } from '../../../../models/builder.models';

@Component({
  selector: 'av-add-section-picker',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './add-section-picker.component.html',
  styleUrl: './add-section-picker.component.scss'
})
export class AddSectionPickerComponent implements OnInit {
  readonly builderService = inject(WebsiteBuilderService);
  readonly allLayouts = this.builderService.allLayouts;

  select = output<string>();
  close = output<void>();

  ngOnInit(): void {
    this.builderService.loadAllLayouts();
  }

  onSelect(layout: LayoutItem): void {
    this.select.emit(layout.id);
  }
}
