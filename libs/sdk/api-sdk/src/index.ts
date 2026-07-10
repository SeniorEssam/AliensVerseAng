// ─── Existing exports (DO NOT REMOVE) ───
export * from './lib/services/api.service';
export * from './lib/models/api-response.model';
export * from './lib/models/section.model';
export * from './lib/interceptors/api.interceptor';
export * from './lib/services/public-context.service';
export * from './lib/services/feature-flags.service';

// Foundation Layer Exports
export * from './lib/theme/contracts';
export * from './lib/theme/theme-manager.service';
export * from './lib/registry/models';
export * from './lib/registry/tokens';
export * from './lib/registry/global-component-registry.service';
export * from './lib/plugins/models';
export * from './lib/plugins/plugin-manager.service';
export * from './lib/plugins/plugin.provider';
export * from './lib/contracts/section.contracts';

// ─── New tenant system exports ───
export * from './lib/models/tenant.model';
export * from './lib/config/tenant.config';
export * from './lib/services/tenant-resolver.service';
export * from './lib/guards/tenant.guard';

// ─── REMOVED: old guard ───
// export * from './lib/guards/company-context.guard';
