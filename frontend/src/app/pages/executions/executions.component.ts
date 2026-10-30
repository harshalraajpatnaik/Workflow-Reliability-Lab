import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { Execution, Environment } from '../../core/models/models';

@Component({
  selector: 'app-executions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="executions-page">
      <div class="page-header">
        <div>
          <h1>Workflow Executions</h1>
          <p class="subtitle">Search, filter, and inspect distributed execution traces & timelines</p>
        </div>
        <div class="header-actions">
          <a routerLink="/workspace/scenarios" class="btn btn-primary">
            <span>+ Simulate Execution</span>
          </a>
          <button class="btn btn-secondary" (click)="loadExecutions()">
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="filters-card">
        <div class="search-box">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Search by workflow name, correlation ID or ID..."
            [(ngModel)]="searchQuery" 
            (ngModelChange)="onSearchChange()"
          />
        </div>
        <div class="env-filter-box">
          <select class="form-control env-select" [(ngModel)]="selectedEnvId" (ngModelChange)="onEnvChange()">
            <option value="">All Environments</option>
            <option *ngFor="let env of allEnvironments()" [value]="env.id">
              {{ env.name }} ({{ env.environmentType || env.type }})
            </option>
          </select>
        </div>
        <div class="status-filters">
          <button 
            *ngFor="let s of statuses" 
            class="filter-pill" 
            [class.active]="selectedStatus === s.value"
            (click)="setStatus(s.value)">
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- Executions Table -->
      <div class="panel">
        <div class="table-container" *ngIf="executions().length > 0; else noExecutions">
          <table class="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Workflow Name</th>
                <th>Environment</th>
                <th>Correlation ID</th>
                <th>Trigger Source</th>
                <th>Duration</th>
                <th>Started At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let exec of executions()">
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-success': exec.status === 'COMPLETED',
                    'badge-danger': exec.status === 'FAILED',
                    'badge-warning': exec.status === 'RUNNING',
                    'badge-info': exec.status === 'PENDING'
                  }">
                    {{ exec.status }}
                  </span>
                </td>
                <td class="font-medium">
                  <a [routerLink]="['/workspace/executions', exec.id]" class="exec-link">
                    {{ exec.workflowName }}
                  </a>
                </td>
                <td>
                  <span class="badge" [ngClass]="getEnvBadgeClass(exec.environmentId)">
                    {{ getEnvName(exec.environmentId) }}
                  </span>
                </td>
                <td class="font-mono text-muted text-xs">{{ exec.correlationId || '-' }}</td>
                <td><span class="badge badge-info text-xs">{{ exec.triggerSource }}</span></td>
                <td class="font-mono text-xs">{{ formatDuration(exec.durationMs) }}</td>
                <td class="text-xs text-muted">{{ exec.createdAt | date:'medium' }}</td>
                <td>
                  <a [routerLink]="['/workspace/executions', exec.id]" class="btn btn-secondary btn-sm">
                    Inspect ↗
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #noExecutions>
          <div class="empty-state">
            <p>No executions found matching criteria.</p>
          </div>
        </ng-template>

        <!-- Pagination -->
        <div class="pagination-bar" *ngIf="totalPages() > 1">
          <button class="btn btn-secondary btn-sm" [disabled]="page() === 0" (click)="changePage(page() - 1)">
            Previous
          </button>
          <span class="page-info">Page {{ page() + 1 }} of {{ totalPages() }}</span>
          <button class="btn btn-secondary btn-sm" [disabled]="page() >= totalPages() - 1" (click)="changePage(page() + 1)">
            Next
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .executions-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .page-header h1 {
      font-size: 1.6rem;
      font-weight: 700;
    }
    .subtitle {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
    .header-actions {
      display: flex;
      gap: 0.75rem;
    }
    .filters-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1rem 1.25rem;
      display: flex;
      gap: 1.25rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .search-box {
      flex: 1;
      min-width: 240px;
    }
    .env-filter-box {
      min-width: 180px;
    }
    .env-select {
      font-size: 0.825rem;
      padding: 0.45rem 0.75rem;
    }
    .status-filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .filter-pill {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .filter-pill:hover {
      border-color: var(--accent-blue);
      color: var(--text-primary);
    }
    .filter-pill.active {
      background: var(--accent-blue);
      border-color: var(--accent-blue);
      color: white;
    }
    .panel {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .table-container {
      overflow-x: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.825rem;
    }
    .data-table th, .data-table td {
      padding: 0.85rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    .data-table th {
      background: var(--bg-secondary);
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.7rem;
      text-transform: uppercase;
    }
    .exec-link {
      color: var(--accent-blue);
      font-weight: 600;
    }
    .exec-link:hover {
      text-decoration: underline;
    }
    .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
    }
    .pagination-bar {
      padding: 0.85rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border);
    }
    .page-info {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
  `]
})
export class ExecutionsComponent implements OnInit {
  api = inject(ApiService);
  workspaceService = inject(WorkspaceService);

  executions = signal<Execution[]>([]);
  page = signal(0);
  totalPages = signal(0);
  searchQuery = '';
  selectedStatus = '';
  selectedEnvId = '';

  allEnvironments = computed(() => {
    return this.workspaceService.projects().flatMap(p => p.environments || []);
  });

  statuses = [
    { label: 'All Statuses', value: '' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Failed', value: 'FAILED' },
    { label: 'Running', value: 'RUNNING' },
    { label: 'Pending', value: 'PENDING' }
  ];

  constructor() {
    effect(() => {
      const ws = this.workspaceService.currentWorkspace();
      if (ws) {
        this.loadExecutions();
      }
    });
  }

  ngOnInit() {
    const ws = this.workspaceService.currentWorkspace();
    if (ws) {
      this.loadExecutions();
    }
  }

  loadExecutions() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws) return;

    this.api.getExecutions(ws.id, {
      environmentId: this.selectedEnvId || undefined,
      status: this.selectedStatus || undefined,
      search: this.searchQuery || undefined,
      page: this.page(),
      size: 15
    }).subscribe(res => {
      if (res.success && res.data) {
        this.executions.set(res.data.content);
        this.totalPages.set(res.data.totalPages);
      }
    });
  }

  setStatus(status: string) {
    this.selectedStatus = status;
    this.page.set(0);
    this.loadExecutions();
  }

  onEnvChange() {
    this.page.set(0);
    this.loadExecutions();
  }

  onSearchChange() {
    this.page.set(0);
    this.loadExecutions();
  }

  changePage(newPage: number) {
    this.page.set(newPage);
    this.loadExecutions();
  }

  getEnvName(envId?: string): string {
    if (!envId) return 'Simulation';
    const env = this.allEnvironments().find(e => e.id === envId);
    return env ? env.name : 'Simulation';
  }

  getEnvBadgeClass(envId?: string): string {
    if (!envId) return 'badge-primary';
    const env = this.allEnvironments().find(e => e.id === envId);
    if (!env) return 'badge-primary';
    const type = env.environmentType || env.type;
    switch (type) {
      case 'PRODUCTION': return 'badge-danger';
      case 'STAGING': return 'badge-warning';
      case 'DEVELOPMENT': return 'badge-info';
      default: return 'badge-primary';
    }
  }

  formatDuration(ms?: number): string {
    if (!ms) return '0ms';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }
}
