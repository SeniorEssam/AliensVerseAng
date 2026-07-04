import { PluginManifest } from '@aliens-verse/api-sdk';
import { loginRedirectGuard } from '@aliens-verse/shell';

export const AUTH_PLUGIN_MANIFEST: PluginManifest = {
  pluginId: '@aliens-verse/auth-plugin',
  routes: [
    {
      path: 'login',
      canActivate: [loginRedirectGuard],
      loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    }
  ],
  navigation: [],
  permissions: []
};
