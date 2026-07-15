import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID, REQUEST } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TenantResolverService } from '../services/tenant-resolver.service';
import { PublicContextService } from '../services/public-context.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantResolver = inject(TenantResolverService);
  const publicContext = inject(PublicContextService);
  const platformId = inject(PLATFORM_ID);

  let headers = req.headers;
  const slug = tenantResolver.getCompanySlugForHeader();

  const serverRequest: any = inject(REQUEST, { optional: true });

  let cookieString = '';
  if (isPlatformBrowser(platformId)) {
    cookieString = document.cookie || '';
  } else if (serverRequest) {
    if (typeof serverRequest.headers?.get === 'function') {
      cookieString = serverRequest.headers.get('cookie') || '';
    } else if (serverRequest.headers?.cookie) {
      cookieString = serverRequest.headers.cookie || '';
    }
  }

  const getCookie = (name: string): string | null => {
    if (!cookieString) return null;
    const nameLenPlus = (name.length + 1);
    return cookieString
      .split(';')
      .map(c => c.trim())
      .filter(cookie => cookie.substring(0, nameLenPlus) === `${name}=`)
      .map(cookie => decodeURIComponent(cookie.substring(nameLenPlus)))[0] || null;
  };

  const setCookie = (name: string, value: string): void => {
    if (!isPlatformBrowser(platformId)) return;
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${value}; path=/; SameSite=Lax${secure}`;
  };

  // 🔧 FIX: Added SameSite=Lax and secure flag to match setCookie and guard behavior
  const deleteCookie = (name: string): void => {
    if (!isPlatformBrowser(platformId)) return;
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax${secure}`;
  };

  const currentCookie = getCookie('av_company_slug');

  // Attach company slug headers and write cookies (with browser platform safety check)
  if (slug) {
    headers = headers.set('X-Company-Slug', slug);
    if (currentCookie !== slug) {
      setCookie('av_company_slug', slug);
    }
  } else {
    if (currentCookie) {
      deleteCookie('av_company_slug');
    }
  }

  // Attach Language configs
  const currentLang = publicContext.currentLang();
  if (currentLang) {
    headers = headers
      .set('Accept-Language', currentLang.code)
      .set('LanguageId', String(currentLang.id));
  }

  // CSRF token configuration
  const csrfToken = getCookie('csrf_token');
  if (csrfToken) {
    headers = headers.set('X-CSRF-Token', csrfToken);
  }

  // On the server, we MUST forward all cookies to the API manually
  if (!isPlatformBrowser(platformId) && cookieString) {
    headers = headers.set('Cookie', cookieString);
  }

  const clonedRequest = req.clone({
    headers,
    withCredentials: true
  });

  return next(clonedRequest);
};
