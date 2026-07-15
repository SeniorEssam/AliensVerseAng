import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TenantResolverService } from '@aliens-verse/api-sdk';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const tenantResolver = inject(TenantResolverService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (!req.url.includes('auth/login') && !req.url.includes('auth/check') && !req.url.includes('auth/logout') && !req.url.includes('device/check')) {
          authService.authStatus.set('unauthenticated');
          authService.currentSession.set(null);
          router.navigateByUrl(tenantResolver.buildUrl('login'));
        }
      }
      return throwError(() => error);
    })
  );
};
