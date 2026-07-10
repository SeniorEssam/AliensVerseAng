import { Route } from '@angular/router';

export interface PluginNavItem {
  label: string;
  route: string;
  icon?: string;
  permissions?: string[];
  /**
   * Defines where this nav item should be injected (e.g., 'sidebar', 'header', 'footer')
   */
  targetZone?: string;
}

export interface PluginManifest {
  /**
   * Unique identifier for the plugin (e.g. '@company/landing-page-plugin')
   */
  pluginId: string;

  /**
   * Routes provided by this plugin. Will be lazy-loaded by the App Shell.
   */
  routes?: Route[];

  /**
   * Navigation items that this plugin wants to inject into the App Shell.
   */
  navigation?: PluginNavItem[];

  /**
   * Any specific permissions required by this plugin to be activated.
   */
  permissions?: string[];

  /**
   * Feature flag controlled dynamically to toggle visibility.
   */
  featureFlag?: string;
}
