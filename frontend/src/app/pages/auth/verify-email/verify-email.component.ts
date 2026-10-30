import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Email Verification</h2>
          <p class="auth-subtitle">Validating your email address and activating workspace</p>
        </div>

        <div *ngIf="loading()" class="status-box">
          <div class="spinner"></div>
          <p>Verifying your verification token...</p>
        </div>

        <div *ngIf="successMessage()" class="alert-box alert-success">
          {{ successMessage() }}
        </div>

        <div *ngIf="errorMessage()" class="alert-box alert-error">
          {{ errorMessage() }}
        </div>

        <div class="login-action" *ngIf="!loading()">
          <a routerLink="/login" class="btn btn-primary btn-block">Go to Sign In</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top, #161f30 0%, #0b0f19 100%);
      padding: 1.5rem;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2.25rem;
      box-shadow: var(--shadow-lg);
      text-align: center;
    }
    .auth-header {
      margin-bottom: 2rem;
    }
    .auth-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.35rem;
    }
    .auth-subtitle {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
    .status-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem 0;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(59, 130, 246, 0.2);
      border-top-color: var(--accent-blue);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .alert-box {
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
      text-align: left;
    }
    .alert-error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }
    .alert-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #6ee7b7;
    }
    .btn-block {
      width: 100%;
    }
    .login-action {
      margin-top: 1.25rem;
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  authService = inject(AuthService);
  route = inject(ActivatedRoute);

  loading = signal(true);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.verify(token);
      } else {
        this.loading.set(false);
        this.errorMessage.set('No verification token provided in URL.');
      }
    });
  }

  private verify(token: string) {
    this.authService.verifyEmail(token).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.successMessage.set('Your email has been successfully verified! You may now log in to your workspace.');
        } else {
          this.errorMessage.set(res.message || 'Verification failed.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Verification token is invalid or has expired.');
      }
    });
  }
}
