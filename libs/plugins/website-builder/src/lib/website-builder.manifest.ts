import { PluginManifest } from '@aliens-verse/api-sdk';

export const WEBSITE_BUILDER_MANIFEST: PluginManifest = {
  pluginId: '@aliens-verse/website-builder',
  routes: [
    {
      path: 'website-builder',
      loadChildren: () => import('./website-builder.routes').then(m => m.BUILDER_ROUTES)
    }
  ],
  navigation: [
    {
      label: 'Website',
      icon: 'globe',
      route: 'website-builder',
      targetZone: 'sidebar',
      permissions: ['website_builder']
    }
  ],
  permissions: ['website_builder']
};
