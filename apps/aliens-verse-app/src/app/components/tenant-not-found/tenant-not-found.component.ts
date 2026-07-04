import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-tenant-not-found',
  template: `
    <div class="not-found-container">
      <h1>العنوان غير موجود</h1>
      <p>عذراً، الشركة التي تحاول الوصول إليها غير مسجلة في النظام.</p>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: system-ui, sans-serif;
      text-align: center;
      background-color: #f8f9fa;
      color: #343a40;
      direction: rtl;
    }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    p { font-size: 1.25rem; }
  `]
})
export class TenantNotFoundComponent {}
