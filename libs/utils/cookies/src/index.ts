export type SameSite = 'None' | 'Lax' | 'Strict';

export interface CookieOptions {
  days?: number;
  sameSite?: SameSite;
  secure?: boolean;
  httpOnly?: boolean; // informational: cannot be set from JS
}

export const COOKIE_NAMES = {
  AV_TOKEN: 'av_token',
  AV_REFRESH: 'av_refresh',
  COMPANY_INFO: 'av_company_info',
  THEME: 'av_theme',
  CLIENT_DEVICE: 'av_client_device',
  SERVER_DEVICE: 'av_server_device',
  LANG: 'av_lang',
  CSRF: 'csrf_token',
  COMPANY_SLUG: 'av_company_slug',
} as const;

const DEFAULTS: CookieOptions = {
  sameSite: 'None',
  secure: true,
  httpOnly: false,
};

// Central policy per cookie name
export const COOKIE_POLICIES: Record<string, CookieOptions> = {
  [COOKIE_NAMES.AV_TOKEN]: { httpOnly: true, secure: true, sameSite: 'None' },
  [COOKIE_NAMES.AV_REFRESH]: { httpOnly: true, secure: true, sameSite: 'None' },
  [COOKIE_NAMES.COMPANY_INFO]: {
    httpOnly: false,
    secure: true,
    sameSite: 'Lax',
  },
  [COOKIE_NAMES.THEME]: { httpOnly: false, secure: true, sameSite: 'Lax' },
  [COOKIE_NAMES.CLIENT_DEVICE]: {
    httpOnly: false,
    secure: true,
    sameSite: 'None',
  },
  [COOKIE_NAMES.SERVER_DEVICE]: {
    httpOnly: false,
    secure: true,
    sameSite: 'None',
  },
  [COOKIE_NAMES.LANG]: { httpOnly: false, secure: true, sameSite: 'None' },
  [COOKIE_NAMES.CSRF]: { httpOnly: false, secure: true, sameSite: 'None' },
  [COOKIE_NAMES.COMPANY_SLUG]: {
    httpOnly: false,
    secure: true,
    sameSite: 'None',
  },
};

function normalizeOpts(name: string, opts?: CookieOptions): CookieOptions {
  const policy = COOKIE_POLICIES[name] || {};
  return { ...DEFAULTS, ...policy, ...(opts || {}) };
}

export function getCookie(name: string): string | null {
  const policy = COOKIE_POLICIES[name];
  if (policy?.httpOnly) {
    console.warn(
      `[cookie.util] Attempted to read HttpOnly cookie "${name}" from JS.`,
    );
    return null;
  }
  const nameEQ = `${name}=`;
  const ca = document.cookie ? document.cookie.split(';') : [];
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0)
      return decodeURIComponent(c.substring(nameEQ.length));
  }
  return null;
}

export function setCookie(
  name: string,
  value: string,
  opts?: CookieOptions,
): void {
  const resolved = normalizeOpts(name, opts);
  if (resolved.httpOnly) {
    console.warn(
      `[cookie.util] Cookie "${name}" is HttpOnly and must be set by the server via Set-Cookie header.`,
    );
    return;
  }

  let expires = '';
  if (resolved.days) {
    const d = new Date();
    d.setTime(d.getTime() + resolved.days * 24 * 60 * 60 * 1000);
    expires = `; expires=${d.toUTCString()}`;
  }

  const sameSiteAttr = resolved.sameSite
    ? `; SameSite=${resolved.sameSite}`
    : '';
  const secureAttr = resolved.secure ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/${sameSiteAttr}${secureAttr}`;
}

export function deleteCookie(name: string): void {
  const resolved = normalizeOpts(name);
  if (resolved.httpOnly) {
    console.warn(
      `[cookie.util] HttpOnly cookie "${name}" must be deleted by the server via Set-Cookie with Max-Age=0.`,
    );
    return;
  }
  const sameSiteAttr = resolved.sameSite
    ? `; SameSite=${resolved.sameSite}`
    : '';
  const secureAttr = resolved.secure ? '; Secure' : '';
  document.cookie = `${name}=; Max-Age=0; path=/${sameSiteAttr}${secureAttr}`;
}

export function buildSetCookieHeader(
  name: string,
  value: string,
  opts?: CookieOptions,
): string {
  const resolved = normalizeOpts(name, opts);
  const parts: string[] = [];
  parts.push(`${name}=${encodeURIComponent(value)}`);
  if (resolved.days) {
    const d = new Date();
    d.setTime(d.getTime() + resolved.days * 24 * 60 * 60 * 1000);
    parts.push(`Expires=${d.toUTCString()}`);
  }
  parts.push('Path=/');
  if (resolved.sameSite) parts.push(`SameSite=${resolved.sameSite}`);
  if (resolved.secure) parts.push('Secure');
  if (resolved.httpOnly) parts.push('HttpOnly');
  return parts.join('; ');
}
