import { PluginManifest } from '@aliens-verse/api-sdk';
import { activeDeviceRedirectGuard } from '@aliens-verse/shell';

export const ACTIVATION_PLUGIN_MANIFEST: PluginManifest = {
  pluginId: '@aliens-verse/activation-plugin',
  routes: [
    {
      path: 'activation',
      canActivate: [activeDeviceRedirectGuard],
      loadChildren: () => import('./routes/activation.routes').then(m => m.ACTIVATION_ROUTES)
    }
  ],
  navigation: [],
  permissions: []
};
