import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { providePluginManifest, SECTION_COMPONENTS_TOKEN } from '@aliens-verse/api-sdk';
import { LANDING_PAGE_MANIFEST } from './landing-page.manifest';
import { LANDING_PAGE_COMPONENTS } from './landing-page.components';

export function provideLandingPagePlugin(): EnvironmentProviders {
  return makeEnvironmentProviders([
    // Register the manifest for the shell
    providePluginManifest([LANDING_PAGE_MANIFEST]),
    
    // Register the components for the global registry
    {
      provide: SECTION_COMPONENTS_TOKEN,
      useValue: LANDING_PAGE_COMPONENTS,
      multi: true
    }
  ]);
}
