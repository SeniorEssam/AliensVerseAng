import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuilderSection, LayoutItem } from '../../../../models/builder.models';
import { SvgIconComponent } from '@aliens-verse/ui';

@Component({
  selector: 'av-layout-picker',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './layout-picker.component.html',
  styleUrl: './layout-picker.component.scss'
})
export class LayoutPickerComponent {
  section = input.required<BuilderSection>();
  select = output<string>();
  close = output<void>();

  onSelect(layout: LayoutItem): void {
    if (layout.name === this.section().layoutName) return; // Already active

    const confirmSwitch = confirm(`Are you sure you want to switch to "${layout.name}"? Your custom values for settings that exist in both layouts will be preserved, but others will be reset to default template values.`);
    if (confirmSwitch) {
      this.select.emit(layout.id);
    }
  }
}
