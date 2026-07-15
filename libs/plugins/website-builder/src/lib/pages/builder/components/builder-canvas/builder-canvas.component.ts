import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuilderSection } from '../../../../models/builder.models';
import { SvgIconComponent } from '@aliens-verse/ui';

@Component({
  selector: 'av-builder-canvas',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './builder-canvas.component.html',
  styleUrl: './builder-canvas.component.scss',
})
export class BuilderCanvasComponent {
  sections = input.required<BuilderSection[]>();
  selectedId = input<string | null>(null);

  sectionClick = output<string | null>();
  changeLayout = output<void>();
  visibilityToggle = output<{ id: string; visible: boolean }>();
  reorder = output<{ id: string; direction: 'up' | 'down' }>();
  deleteSection = output<string>();
  addSection = output<void>();

  onSelect(sec: BuilderSection): void {
    this.sectionClick.emit(sec.companySectionId);
  }

  onChangeLayout(sec: BuilderSection, event: Event): void {
    event.stopPropagation();
    this.sectionClick.emit(sec.companySectionId);
    this.changeLayout.emit();
  }

  toggleVisible(sec: BuilderSection, event: Event): void {
    event.stopPropagation();
    this.visibilityToggle.emit({
      id: sec.pageSectionId,
      visible: !sec.isVisible,
    });
  }

  moveUp(sec: BuilderSection, event: Event): void {
    event.stopPropagation();
    this.reorder.emit({ id: sec.companySectionId, direction: 'up' });
  }

  moveDown(sec: BuilderSection, event: Event): void {
    event.stopPropagation();
    this.reorder.emit({ id: sec.companySectionId, direction: 'down' });
  }

  deleteSec(sec: BuilderSection, event: Event): void {
    event.stopPropagation();
    this.deleteSection.emit(sec.pageSectionId);
  }
}
