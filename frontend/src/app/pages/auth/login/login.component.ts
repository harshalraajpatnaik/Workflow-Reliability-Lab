import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <a routerLink="/" class="auth-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" stroke="var(--accent-blue)" />
              <polyline points="2 17 12 22 22 17" stroke="var(--accent-cyan)" />
              <polyline points="2 12 12 17 22 12" stroke="var(--accent-purple)" />
            </svg>
            <span>Workflow Reliability Lab</span>
          </a>
          <h2>Welcome Back</h2>
          <p class="auth-subtitle">Sign in to your engineering workspace</p>
        </div>

        <div *ngIf="errorMessage()" class="alert-box alert-error">
          {{ errorMessage() }}
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="email">Work Email</label>
            <input 
              id="email" 
              type="email" 
              class="form-control" 
              [(ngModel)]="email" 
              name="email" 
              required 
              placeholder="lead.architect@workflowlab.dev"
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <div class="label-with-link">
              <label for="password">Password</label>
              <a routerLink="/forgot-password" class="forgot-link">Forgot password?</a>
            </div>
            <input 
              id="password" 
              type="password" 
              class="form-control" 
              [(ngModel)]="password" 
              name="password" 
              required 
              placeholder="••••••••••••"
              autocomplete="current-password"
            />
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading()">
            <span *ngIf="loading()">Signing in...</span>
            <span *ngIf="!loading()">Sign In to Console</span>
          </button>
        </form>

        <div class="demo-fill">
          <button type="button" class="btn btn-secondary btn-sm btn-block" (click)="fillDemoCredentials()">
            ⚡ Fill Demo Credentials (Lead Architect)
          </button>
        </div>

        <div class="auth-footer">
          Don't have an account? <a routerLink="/register">Create Workspace</a>
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
    .auth-logo {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--text-primary);
      text-decoration: none;
      margin-bottom: 1.25rem;
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
    .label-with-link {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .forgot-link {
      font-size: 0.8rem;
      color: var(--accent-blue);
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
    .btn-block {
      width: 100%;
    }
    .demo-fill {
      margin-top: 1rem;
    }
    .auth-footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  email = 'lead.architect@workflowlab.dev';
  password = 'Password123!@#';
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  fillDemoCredentials() {
    this.email = 'lead.architect@workflowlab.dev';
    this.password = 'Password123!@#';
  }

  onSubmit() {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.router.navigate(['/workspace/dashboard']);
        } else {
          this.errorMessage.set(res.message || 'Login failed. Please verify credentials.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid email or password.');
      }
    });
  }
}
