import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
          <h2>Create Workspace</h2>
          <p class="auth-subtitle">Register your team's reliability engineering environment</p>
        </div>

        <div *ngIf="errorMessage()" class="alert-box alert-error">
          {{ errorMessage() }}
        </div>

        <div *ngIf="successMessage()" class="alert-box alert-success">
          {{ successMessage() }}
        </div>

        <form *ngIf="!successMessage()" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input 
              id="fullName" 
              type="text" 
              class="form-control" 
              [(ngModel)]="fullName" 
              name="fullName" 
              required 
              placeholder="Ada Lovelace"
            />
          </div>

          <div class="form-group">
            <label for="email">Work Email</label>
            <input 
              id="email" 
              type="email" 
              class="form-control" 
              [(ngModel)]="email" 
              name="email" 
              required 
              placeholder="ada@company.com"
            />
          </div>

          <div class="form-group">
            <label for="workspaceName">Workspace Name</label>
            <input 
              id="workspaceName" 
              type="text" 
              class="form-control" 
              [(ngModel)]="workspaceName" 
              name="workspaceName" 
              required 
              placeholder="Payment Platform Core"
            />
          </div>

          <div class="form-group">
            <label for="password">Password (min 8 chars, 1 digit, 1 symbol)</label>
            <input 
              id="password" 
              type="password" 
              class="form-control" 
              [(ngModel)]="password" 
              name="password" 
              required 
              placeholder="••••••••••••"
            />
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading()">
            <span *ngIf="loading()">Creating Workspace...</span>
            <span *ngIf="!loading()">Create Workspace & Account</span>
          </button>
        </form>

        <div *ngIf="successMessage()" class="login-action">
          <a routerLink="/login" class="btn btn-primary btn-block">Proceed to Sign In</a>
        </div>

        <div class="auth-footer">
          Already registered? <a routerLink="/login">Sign In</a>
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
      max-width: 460px;
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
      gap: 1.15rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
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
    .auth-footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
  `]
})
export class RegisterComponent {
  authService = inject(AuthService);
  router = inject(Router);

  fullName = '';
  email = '';
  workspaceName = '';
  password = '';
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  onSubmit() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const data = {
      fullName: this.fullName,
      email: this.email,
      workspaceName: this.workspaceName,
      password: this.password
    };

    this.authService.register(data).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.successMessage.set('Account & Workspace created successfully! A verification email has been dispatched. You may now sign in.');
        } else {
          this.errorMessage.set(res.message || 'Registration failed.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Registration failed. Please check inputs.');
      }
    });
  }
}
