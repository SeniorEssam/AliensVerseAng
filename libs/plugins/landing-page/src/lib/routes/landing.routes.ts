import { Route } from '@angular/router';
import { LandingPageComponent } from '../pages/landing/landing.component';

export const LANDING_ROUTES: Route[] = [
  {
    path: '',
    component: LandingPageComponent,
  },
  {
    path: ':pageSlug',
    component: LandingPageComponent,
  },
];
