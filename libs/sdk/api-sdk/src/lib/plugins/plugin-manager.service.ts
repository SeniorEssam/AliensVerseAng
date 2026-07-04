import { Injectable, Inject, Optional, InjectionToken } from '@angular/core';
import { PluginManifest } from './models';
import { Route } from '@angular/router';

export const PLUGIN_MANIFESTS_TOKEN = new InjectionToken<PluginManifest[][]>('PLUGIN_MANIFESTS_TOKEN');

@Injectable({
  providedIn: 'root'
})
export class PluginManagerService {
  private manifests: PluginManifest[] = [];

  constructor(
    @Optional() @Inject(PLUGIN_MANIFESTS_TOKEN) providedManifests: PluginManifest[][] | null
  ) {
    if (providedManifests) {
      this.manifests = providedManifests.flat();
    }
  }

  getManifests(): PluginManifest[] {
    return this.manifests;
  }

  getAggregatedRoutes(): Route[] {
    return this.manifests
      .filter(m => m.routes)
      .flatMap(m => m.routes as Route[]);
  }

  getNavigationForZone(zone: string) {
    return this.manifests
      .filter(m => m.navigation)
      .flatMap(m => m.navigation!)
      .filter(nav => nav.targetZone === zone);
  }
}
