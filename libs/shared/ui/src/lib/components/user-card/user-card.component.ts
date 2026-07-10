import { Component, input, output } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
  selector: 'av-user-card',
  standalone: true,
  imports: [SvgIconComponent],
  template: `
    <div class="user-card" [class.collapsed]="collapsed()">
      <!-- Avatar -->
      <div class="user-avatar" [title]="userName()">
        {{ initial() }}
      </div>

      @if (!collapsed()) {
        <!-- User Info -->
        <div class="user-info">
          <span class="user-name">{{ userName() }}</span>
          @if (storeName() || branchName()) {
            <span class="user-ctx">{{ storeName() }}{{ branchName() ? ' · ' + branchName() : '' }}</span>
          }
        </div>

        <!-- Logout Button -->
        <button
          class="logout-btn"
          (click)="logout.emit()"
          title="Sign out"
          type="button"
        >
          <av-svg-icon name="logout" [size]="16"/>
        </button>
      }
    </div>
  `,
  styles: [`
    .user-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid var(--sidebar-border, rgba(0,0,0,0.07));
      margin: 8px;
      transition: background 0.2s;
    }

    .user-card:hover { background: var(--nav-hover, rgba(124,58,237,0.06)); }

    .user-card.collapsed {
      justify-content: center;
      padding: 8px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      user-select: none;
    }

    .user-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #111);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-ctx {
      font-size: 11px;
      color: var(--text-secondary, #888);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .logout-btn {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: var(--text-secondary, #888);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s, color 0.15s;
    }

    .logout-btn:hover {
      background: rgba(239,68,68,0.1);
      color: #ef4444;
    }
  `]
})
export class UserCardComponent {
  userName   = input.required<string>();
  storeName  = input<string>('');
  branchName = input<string>('');
  collapsed  = input<boolean>(false);
  logout     = output<void>();

  get initial(): () => string {
    return () => (this.userName() || 'U').charAt(0).toUpperCase();
  }
}
