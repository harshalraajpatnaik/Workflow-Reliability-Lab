import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <nav class="sidebar-nav">
        <!-- Section 1 -->
        <div class="nav-section">
          <span class="section-title">OVERVIEW</span>
          <a routerLink="/workspace/dashboard" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Dashboard</span>
          </a>
          <a routerLink="/workspace/projects" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Projects & Envs</span>
          </a>
        </div>

        <!-- Section 2 -->
        <div class="nav-section">
          <span class="section-title">OBSERVABILITY</span>
          <a routerLink="/workspace/executions" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            <span>Executions</span>
          </a>
          <a routerLink="/workspace/events" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span>Event Journal</span>
          </a>
          <a routerLink="/workspace/traces" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span>Traces & Spans</span>
          </a>
          <a routerLink="/workspace/anomalies" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Anomaly Lab</span>
          </a>
        </div>

        <!-- Section 3 -->
        <div class="nav-section">
          <span class="section-title">RELIABILITY LAB</span>
          <a routerLink="/workspace/scenarios" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>Failure Scenarios</span>
          </a>
          <a routerLink="/workspace/invariants" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Invariant Engine</span>
          </a>
          <a routerLink="/workspace/payments" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            <span>Payment Simulator</span>
          </a>
          <a routerLink="/workspace/incidents" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>Incidents & Reports</span>
          </a>
        </div>

        <!-- Section 4 -->
        <div class="nav-section">
          <span class="section-title">INTEGRATIONS & CONFIG</span>
          <a routerLink="/workspace/integrations" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <span>Integrations</span>
          </a>
          <a routerLink="/workspace/api-keys" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 2l-2 2m-1-1l-3 3m-1-1l-2 2m-1-1l-3 3m-1-1l-4 4a5 5 0 1 1-7-7l4-4"></path>
            </svg>
            <span>API Keys</span>
          </a>
          <a routerLink="/workspace/webhooks" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span>Webhooks</span>
          </a>
          <a routerLink="/workspace/team" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Team Members</span>
          </a>
          <a routerLink="/workspace/audit" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Audit History</span>
          </a>
        </div>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      background-color: var(--bg-secondary);
      border-right: 1px solid var(--border);
      height: calc(100vh - 60px);
      overflow-y: auto;
      flex-shrink: 0;
    }
    .sidebar-nav {
      padding: 1.25rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .nav-section {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .section-title {
      font-size: 0.675rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.08em;
      padding: 0 0.75rem 0.35rem 0.75rem;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .nav-item:hover {
      background-color: var(--bg-card);
      color: var(--text-primary);
    }
    .nav-item.active {
      background-color: rgba(59, 130, 246, 0.12);
      color: var(--accent-blue);
      font-weight: 600;
      border-left: 3px solid var(--accent-blue);
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    .nav-icon {
      width: 17px;
      height: 17px;
      flex-shrink: 0;
    }
  `]
})
export class SidebarComponent {}
