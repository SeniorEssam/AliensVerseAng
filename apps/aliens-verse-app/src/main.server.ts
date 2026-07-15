import {
  BootstrapContext,
  bootstrapApplication,
} from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { config } from './app/app.config.server';
import dns from 'node:dns';

// Fix local SSR API calls using self-signed certs (e.g., .NET dev certs) during build time
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
// Force IPv4 for localhost to avoid 4-second timeout delays with IIS Express during build time
dns.setDefaultResultOrder('ipv4first');

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(AppComponent, config, context);

export default bootstrap;
