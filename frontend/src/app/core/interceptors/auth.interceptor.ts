import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token;

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 Unauthorized and not already calling auth endpoints, attempt refresh
      if (error.status === 401 && !req.url.includes('/api/v1/auth/')) {
        return authService.refreshToken().pipe(
          switchMap(refreshRes => {
            if (refreshRes && refreshRes.success && refreshRes.data) {
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${refreshRes.data.accessToken}`
                }
              });
              return next(retryReq);
            }
            authService.logout();
            return throwError(() => error);
          }),
          catchError(err => {
            authService.logout();
            return throwError(() => err);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
