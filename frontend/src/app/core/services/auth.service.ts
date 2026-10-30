import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { ApiResponse, AuthResponse, User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8085/api/v1/auth';

  private accessToken = signal<string | null>(null);
  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.accessToken() && !!this.currentUser());

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  get token(): string | null {
    return this.accessToken();
  }

  register(data: any): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/register`, data);
  }

  login(credentials: { email: string; password: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/refresh`, {}, { withCredentials: true }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      }),
      catchError(err => {
        this.clearSession();
        return of(null as any);
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  forgotPassword(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(data: { token: string; newPassword: string }): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/reset-password`, data);
  }

  verifyEmail(token: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/verify-email`, { token });
  }

  private setSession(auth: AuthResponse): void {
    this.accessToken.set(auth.accessToken);
    this.currentUser.set(auth.user);
    sessionStorage.setItem('wrl_user', JSON.stringify(auth.user));
  }

  private clearSession(): void {
    this.accessToken.set(null);
    this.currentUser.set(null);
    sessionStorage.removeItem('wrl_user');
    this.router.navigate(['/login']);
  }

  private restoreSession(): void {
    const cachedUser = sessionStorage.getItem('wrl_user');
    if (cachedUser) {
      try {
        this.currentUser.set(JSON.parse(cachedUser));
        // Silently attempt token refresh with refresh cookie
        this.refreshToken().subscribe();
      } catch (e) {
        sessionStorage.removeItem('wrl_user');
      }
    }
  }
}
