import { ComponentRegistration } from '@aliens-verse/api-sdk';

export const LANDING_PAGE_COMPONENTS: ComponentRegistration[] = [
  {
    id: 'HeroV1Component',
    category: 'hero',
    loadComponent: () => import('./sections/hero-v1/hero-v1.component').then(m => m.HeroV1Component),
    capabilities: { supportsMobile: true }
  },
  {
    id: 'HeroV2Component',
    category: 'hero',
    loadComponent: () => import('./sections/hero-v2/hero-v2.component').then(m => m.HeroV2Component),
    capabilities: { supportsMobile: true }
  },
  {
    id: 'HeroV3Component',
    category: 'hero',
    loadComponent: () => import('./sections/hero-v3/hero-v3.component').then(m => m.HeroV3Component),
    capabilities: { supportsMobile: true }
  },
  {
    id: 'HeroDarkComponent',
    category: 'hero',
    loadComponent: () => import('./sections/hero-dark/hero-dark.component').then(m => m.HeroDarkComponent),
    capabilities: { supportsMobile: true }
  },
  {
    id: 'AboutV1Component',
    category: 'about',
    loadComponent: () => import('./sections/about-v1/about-v1.component').then(m => m.AboutV1Component),
    capabilities: { supportsMobile: true }
  },
  {
    id: 'AboutSplitComponent',
    category: 'about',
    loadComponent: () => import('./sections/about-split/about-split.component').then(m => m.AboutSplitComponent),
    capabilities: { supportsMobile: true }
  },
  {
    id: 'ServicesGridComponent',
    category: 'services',
    loadComponent: () => import('./sections/services-grid/services-grid.component').then(m => m.ServicesGridComponent),
    capabilities: { supportsMobile: true }
  },
  {
    id: 'ServicesCardsComponent',
    category: 'services',
    loadComponent: () => import('./sections/services-cards/services-cards.component').then(m => m.ServicesCardsComponent),
    capabilities: { supportsMobile: true }
  },
  {
    id: 'ServicesV1Component',
    category: 'services',
    loadComponent: () => import('./sections/services-v1/services-v1.component').then(m => m.ServicesV1Component),
    capabilities: { supportsMobile: true }
  },
  {
    id: 'PricingV1Component',
    category: 'pricing',
    loadComponent: () => import('./sections/pricing-v1/pricing-v1.component').then(m => m.PricingV1Component),
    capabilities: { supportsMobile: true }
  },
  {
    id: 'ContactV1Component',
    category: 'contact',
    loadComponent: () => import('./sections/contact-v1/contact-v1.component').then(m => m.ContactV1Component),
    capabilities: { supportsMobile: true }
  },
  {
    id: 'HeaderV1Component',
    category: 'header',
    loadComponent: () => import('./sections/header-v1/header-v1.component').then(m => m.HeaderV1Component),
    capabilities: { supportsMobile: true }
  },
  {
    id: 'FooterV1Component',
    category: 'footer',
    loadComponent: () => import('./sections/footer-v1/footer-v1.component').then(m => m.FooterV1Component),
    capabilities: { supportsMobile: true }
  }
];
