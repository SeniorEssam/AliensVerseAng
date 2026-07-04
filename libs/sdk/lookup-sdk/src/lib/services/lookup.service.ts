import { Injectable, signal } from '@angular/core';

export interface LookupItem {
  id: string;
  name: string;
  code?: string;
  isDefault?: boolean;
  logo_url?: string;
  isRTL?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LookupService {
  readonly isInitialized = signal(false);

  // State Signals
  readonly stores = signal<LookupItem[]>([]);
  readonly branches = signal<LookupItem[]>([]);
  readonly languages = signal<LookupItem[]>([]);
}
