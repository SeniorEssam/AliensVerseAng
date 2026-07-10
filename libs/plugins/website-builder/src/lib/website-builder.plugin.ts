import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { providePluginManifest } from '@aliens-verse/api-sdk';
import { WEBSITE_BUILDER_MANIFEST } from './website-builder.manifest';

export function provideWebsiteBuilderPlugin(): EnvironmentProviders {
  return makeEnvironmentProviders([
    // Register the manifest for the App Shell
    providePluginManifest([WEBSITE_BUILDER_MANIFEST])
  ]);
}
