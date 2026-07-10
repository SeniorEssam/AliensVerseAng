import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuilderSection } from '../../../../models/builder.models';
import { SvgIconComponent } from '@aliens-verse/ui';

@Component({
  selector: 'av-layers-panel',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './layers-panel.component.html',
  styleUrl: './layers-panel.component.scss'
})
export class LayersPanelComponent {
  sections = input.required<BuilderSection[]>();
  selectedId = input<string | null>(null);

  select = output<string | null>();
  visibilityToggle = output<{ id: string; visible: boolean }>();
  reorder = output<{ sectionId: string; sort: number }[]>();
  deleteSection = output<string>();
  addSection = output<void>();

  deleteSec(sec: BuilderSection, event: Event): void {
    event.stopPropagation();
    this.deleteSection.emit(sec.pageSectionId);
  }

  moveUp(index: number, event: Event): void {
    event.stopPropagation();
    if (index === 0) return;

    const list = [...this.sections()];
    const current = list[index];
    const prev = list[index - 1];

    list[index] = prev;
    list[index - 1] = current;

    this.emitReorder(list);
  }

  moveDown(index: number, event: Event): void {
    event.stopPropagation();
    if (index === this.sections().length - 1) return;

    const list = [...this.sections()];
    const current = list[index];
    const next = list[index + 1];

    list[index] = next;
    list[index + 1] = current;

    this.emitReorder(list);
  }

  toggleVisible(sec: BuilderSection, event: Event): void {
    event.stopPropagation();
    this.visibilityToggle.emit({
      id: sec.pageSectionId,
      visible: !sec.isVisible
    });
  }

  private emitReorder(list: BuilderSection[]): void {
    const payloads = list.map((sec, idx) => ({
      sectionId: sec.companySectionId,
      sort: idx + 1
    }));
    this.reorder.emit(payloads);
  }
}
