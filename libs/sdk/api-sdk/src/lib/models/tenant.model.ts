export type TenantMode = 'single' | 'multi';

export interface TenantConfig {
  mode: TenantMode;
  defaultCompanySlug?: string;
}
