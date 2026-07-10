import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
  selector: 'av-nav-item',
  standalone: true,
  imports: [RouterModule, SvgIconComponent],
  template: `
    <a
      [routerLink]="route()"
      routerLinkActive="active"
      class="nav-item"
      [class.collapsed]="collapsed()"
      [title]="collapsed() ? label() : ''"
    >
      <span class="nav-icon">
        <av-svg-icon [name]="icon()" [size]="18"/>
      </span>

      @if (!collapsed()) {
        <span class="nav-label">{{ label() }}</span>

        @if (badge()) {
          <span class="nav-badge">{{ badge() }}</span>
        }
      }
    </a>
  `,
  styles: [`
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: 10px;
      text-decoration: none;
      color: var(--nav-text, #666);
      font-size: 13.5px;
      font-weight: 500;
      transition: background 0.18s ease, color 0.18s ease, transform 0.15s ease;
      position: relative;
      white-space: nowrap;
      overflow: hidden;
    }

    .nav-item:hover {
      background: var(--nav-hover, rgba(124,58,237,0.08));
      color: var(--nav-text-hover, #111);
    }

    .nav-item.active {
      background: var(--nav-active-bg, linear-gradient(135deg,#7c3aed,#4f46e5));
      color: #fff;
      box-shadow: 0 3px 12px var(--accent-shadow, rgba(124,58,237,0.28));
    }

    .nav-item.collapsed {
      padding: 9px;
      justify-content: center;
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 20px;
      height: 20px;
    }

    .nav-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 9px;
      background: var(--accent, #7c3aed);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .nav-item.active .nav-badge {
      background: rgba(255,255,255,0.25);
    }
  `]
})
export class NavItemComponent {
  label     = input.required<string>();
  icon      = input.required<string>();
  route     = input.required<string>();
  collapsed = input<boolean>(false);
  badge     = input<string | null>(null);
}
