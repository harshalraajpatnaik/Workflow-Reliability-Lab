import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Create New Password</h2>
          <p class="auth-subtitle">Choose a robust password with at least 8 characters</p>
        </div>

        <div *ngIf="errorMessage()" class="alert-box alert-error">
          {{ errorMessage() }}
        </div>

        <div *ngIf="successMessage()" class="alert-box alert-success">
          {{ successMessage() }}
        </div>

        <form *ngIf="!successMessage()" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="token">Reset Token</label>
            <input 
              id="token" 
              type="text" 
              class="form-control font-mono" 
              [(ngModel)]="token" 
              name="token" 
              required 
              placeholder="Paste token or use link from email"
            />
          </div>

          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input 
              id="newPassword" 
              type="password" 
              class="form-control" 
              [(ngModel)]="newPassword" 
              name="newPassword" 
              required 
              placeholder="••••••••••••"
            />
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading()">
            <span *ngIf="loading()">Updating Password...</span>
            <span *ngIf="!loading()">Reset Password</span>
          </button>
        </form>

        <div *ngIf="successMessage()" class="login-action">
          <a routerLink="/login" class="btn btn-primary btn-block">Sign In with New Password</a>
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
    }
    .auth-header {
      text-align: center;
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
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .alert-box {
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
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
export class ResetPasswordComponent implements OnInit {
  authService = inject(AuthService);
  route = inject(ActivatedRoute);

  token = '';
  newPassword = '';
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
      }
    });
  }

  onSubmit() {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.resetPassword({ token: this.token, newPassword: this.newPassword }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.successMessage.set('Password has been successfully updated! You can now sign in.');
        } else {
          this.errorMessage.set(res.message || 'Password reset failed.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid or expired token.');
      }
    });
  }
}
