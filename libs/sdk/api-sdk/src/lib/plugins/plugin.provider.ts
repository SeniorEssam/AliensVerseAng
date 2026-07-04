import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { PluginManifest } from './models';
import { PLUGIN_MANIFESTS_TOKEN } from './plugin-manager.service';

/**
 * A helper function for plugins to register their manifests in the DI container.
 * Usage in App Shell:
 * providers: [
 *   providePluginManifest([myLandingPageManifest])
 * ]
 */
export function providePluginManifest(manifests: PluginManifest[]): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: PLUGIN_MANIFESTS_TOKEN,
      useValue: manifests,
      multi: true
    }
  ]);
}
