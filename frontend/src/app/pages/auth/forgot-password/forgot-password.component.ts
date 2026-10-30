import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Reset Password</h2>
          <p class="auth-subtitle">Enter your registered email and we'll dispatch a secure recovery token</p>
        </div>

        <div *ngIf="errorMessage()" class="alert-box alert-error">
          {{ errorMessage() }}
        </div>

        <div *ngIf="successMessage()" class="alert-box alert-success">
          {{ successMessage() }}
        </div>

        <form *ngIf="!successMessage()" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="email">Work Email</label>
            <input 
              id="email" 
              type="email" 
              class="form-control" 
              [(ngModel)]="email" 
              name="email" 
              required 
              placeholder="user@example.com"
            />
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading()">
            <span *ngIf="loading()">Sending...</span>
            <span *ngIf="!loading()">Send Recovery Instructions</span>
          </button>
        </form>

        <div class="auth-footer">
          Remember your password? <a routerLink="/login">Sign In</a>
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
    .auth-footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
  `]
})
export class ForgotPasswordComponent {
  authService = inject(AuthService);
  email = '';
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  onSubmit() {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('If an account exists with that email address, a password reset link has been dispatched to your inbox.');
      },
      error: () => {
        this.loading.set(false);
        this.successMessage.set('If an account exists with that email address, a password reset link has been dispatched to your inbox.');
      }
    });
  }
}
