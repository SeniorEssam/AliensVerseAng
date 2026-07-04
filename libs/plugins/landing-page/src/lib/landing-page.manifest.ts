import { PluginManifest } from '@aliens-verse/api-sdk';

export const LANDING_PAGE_MANIFEST: PluginManifest = {
  pluginId: '@aliens-verse/landing-page-plugin',
  routes: [
    {
      path: '',
      loadChildren: () => import('./routes/landing.routes').then(m => m.LANDING_ROUTES)
    }
  ],
  navigation: [],
  permissions: []
};
