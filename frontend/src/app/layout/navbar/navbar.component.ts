import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { Workspace } from '../../core/models/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="navbar">
      <div class="navbar-left">
        <a routerLink="/workspace/dashboard" class="brand">
          <div class="brand-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" stroke="var(--accent-blue)" />
              <polyline points="2 17 12 22 22 17" stroke="var(--accent-cyan)" />
              <polyline points="2 12 12 17 22 12" stroke="var(--accent-purple)" />
            </svg>
          </div>
          <div class="brand-title">
            <span class="brand-name">Workflow Reliability Lab</span>
            <span class="badge badge-info text-xs">v1.0.0</span>
          </div>
        </a>

        <!-- Workspace Selector -->
        <div class="workspace-selector" *ngIf="workspaceService.workspaces().length > 0">
          <span class="ws-label">WORKSPACE:</span>
          <select 
            [value]="workspaceService.currentWorkspace()?.id" 
            (change)="onWorkspaceChange($event)"
            class="ws-select">
            <option *ngFor="let ws of workspaceService.workspaces()" [value]="ws.id">
              {{ ws.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="navbar-right">
        <a routerLink="/docs" class="nav-link" target="_blank">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <span>Docs</span>
        </a>

        <a href="http://localhost:8085/swagger-ui/index.html" class="nav-link" target="_blank">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <span>OpenAPI</span>
        </a>

        <!-- User profile -->
        <div class="user-menu" *ngIf="authService.currentUser() as user">
          <div class="avatar-circle">
            {{ user.fullName ? user.fullName[0].toUpperCase() : 'U' }}
          </div>
          <div class="user-details">
            <span class="user-name">{{ user.fullName }}</span>
            <span class="user-role">{{ user.email }}</span>
          </div>
          <button class="btn btn-secondary btn-sm" (click)="logout()" title="Logout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      height: 60px;
      background-color: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .navbar-left, .navbar-right {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: var(--radius-md);
      background-color: var(--bg-card);
      border: 1px solid var(--border);
    }
    .brand-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .brand-name {
      font-weight: 700;
      font-size: 1rem;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }
    .workspace-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 0.25rem 0.5rem;
    }
    .ws-label {
      font-size: 0.65rem;
      font-weight: 600;
      color: var(--text-muted);
      letter-spacing: 0.05em;
    }
    .ws-select {
      background: transparent;
      border: none;
      color: var(--accent-cyan);
      font-size: 0.825rem;
      font-weight: 600;
      outline: none;
      cursor: pointer;
    }
    .ws-select option {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 500;
    }
    .nav-link:hover {
      color: var(--text-primary);
    }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-left: 1px solid var(--border);
      padding-left: 1rem;
    }
    .avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.85rem;
    }
    .user-details {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.2;
    }
    .user-role {
      font-size: 0.7rem;
      color: var(--text-muted);
      line-height: 1;
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  workspaceService = inject(WorkspaceService);

  onWorkspaceChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const wsId = target.value;
    const found = this.workspaceService.workspaces().find(w => w.id === wsId);
    if (found) {
      this.workspaceService.setActiveWorkspace(found);
    }
  }

  logout() {
    this.authService.logout();
  }
}
