import { InjectionToken } from '@angular/core';
import { ComponentRegistration } from './models';

/**
 * Injection token used by plugins to provide their components to the global registry.
 * This allows plugins to register components without directly coupling to the registry service.
 */
export const SECTION_COMPONENTS_TOKEN = new InjectionToken<ComponentRegistration[][]>('SECTION_COMPONENTS_TOKEN');
