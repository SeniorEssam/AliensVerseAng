import { Type } from '@angular/core';

export interface ComponentRegistration {
  /**
   * The exact string ID returned from the backend (e.g. 'hero-v2').
   * No aliases or smart resolution allowed. This must match exactly.
   */
  id: string;

  /**
   * The category of the component (e.g. 'hero', 'about', 'services', 'erp-widget')
   */
  category: string;

  /**
   * Lazy loading function for the component
   */
  loadComponent: () => Promise<Type<any>>;

  /**
   * Tags for future AI / Builder discovery
   */
  tags?: string[];

  /**
   * Schema definition for the expected data contract (useful for AI or Builder)
   */
  schema?: Record<string, any>;

  /**
   * Capabilities of the component
   */
  capabilities?: {
    supportsMobile?: boolean;
    requiresAuth?: boolean;
    hasAnimations?: boolean;
  };
}
