import { Injectable, Inject, Optional, Type } from '@angular/core';
import { ComponentRegistration } from './models';
import { SECTION_COMPONENTS_TOKEN } from './tokens';

@Injectable({
  providedIn: 'root'
})
export class GlobalComponentRegistryService {
  private registry = new Map<string, ComponentRegistration>();

  constructor(
    @Optional() @Inject(SECTION_COMPONENTS_TOKEN) providedComponentArrays: ComponentRegistration[][] | null
  ) {
    if (providedComponentArrays) {
      // Flatten the array of arrays provided by multiple plugins
      const allComponents = providedComponentArrays.flat();
      allComponents.forEach(comp => this.register(comp));
    }
  }

  /**
   * Registers a single component manually (usually done via the injection token instead).
   */
  register(registration: ComponentRegistration): void {
    if (this.registry.has(registration.id)) {
      console.warn(`[GlobalComponentRegistryService] Component with id '${registration.id}' is already registered. Overwriting.`);
    }
    this.registry.set(registration.id, registration);
  }

  /**
   * Retrieves the lazy loader function for a component by ID.
   * Enforces exact matching, no aliases.
   */
  async resolveComponent(id: string): Promise<Type<any>> {
    const registration = this.registry.get(id);
    
    if (!registration) {
      throw new Error(`[GlobalComponentRegistryService] Component '${id}' not found in registry. Make sure the plugin providing it is loaded.`);
    }

    return registration.loadComponent();
  }

  /**
   * Optional: Expose the registry metadata for AI / Builder introspection
   */
  getRegisteredMetadata(): ComponentRegistration[] {
    return Array.from(this.registry.values());
  }
}
