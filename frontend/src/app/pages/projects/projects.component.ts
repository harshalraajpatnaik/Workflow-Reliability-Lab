import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { Project, Environment } from '../../core/models/models';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="projects-page">
      <div class="page-header">
        <div>
          <h1>Projects & Environments</h1>
          <p class="subtitle">Organize services, workflows, and deployment stages</p>
        </div>
        <button class="btn btn-primary" (click)="showCreateModal.set(true)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Create Project</span>
        </button>
      </div>

      <!-- Projects Grid -->
      <div class="projects-list" *ngIf="projects().length > 0; else noProjects">
        <div class="project-card" *ngFor="let p of projects()">
          <div class="project-header">
            <div class="p-title-group">
              <span class="p-icon">📂</span>
              <h3>{{ p.name }}</h3>
            </div>
            <span class="badge badge-info">{{ p.slug }}</span>
          </div>
          <p class="project-desc">{{ p.description || 'No description provided.' }}</p>

          <!-- Environments List -->
          <div class="envs-section">
            <span class="envs-title">ENVIRONMENTS</span>
            <div class="envs-grid">
              <div class="env-item" *ngFor="let env of p.environments">
                <div class="env-top">
                  <span class="env-name">{{ env.name }}</span>
                  <span class="badge" [ngClass]="{
                    'badge-danger': env.type === 'PRODUCTION',
                    'badge-warning': env.type === 'STAGING',
                    'badge-info': env.type === 'DEVELOPMENT',
                    'badge-primary': env.type === 'SIMULATION'
                  }">
                    {{ env.type }}
                  </span>
                </div>
                <div class="env-id font-mono text-xs text-muted">ID: {{ env.id }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #noProjects>
        <div class="empty-state-card">
          <p>No projects configured in this workspace yet.</p>
          <button class="btn btn-primary btn-sm" (click)="showCreateModal.set(true)">Create First Project</button>
        </div>
      </ng-template>

      <!-- Create Project Modal -->
      <div class="modal-backdrop" *ngIf="showCreateModal()">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Create New Project</h3>
            <button class="close-btn" (click)="showCreateModal.set(false)">✕</button>
          </div>
          <form (ngSubmit)="onCreateProject()" class="modal-form">
            <div class="form-group">
              <label for="pName">Project Name</label>
              <input 
                id="pName" 
                type="text" 
                class="form-control" 
                [(ngModel)]="newProjectName" 
                name="pName" 
                required 
                placeholder="e.g. Order Fulfillment Saga"
              />
            </div>
            <div class="form-group">
              <label for="pDesc">Description</label>
              <textarea 
                id="pDesc" 
                class="form-control" 
                [(ngModel)]="newProjectDesc" 
                name="pDesc" 
                rows="3" 
                placeholder="Core payment orchestration and distributed inventory services"
              ></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showCreateModal.set(false)">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="loading() || !newProjectName">
                {{ loading() ? 'Creating...' : 'Create Project' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .projects-page {
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
    .projects-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .project-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .p-title-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .p-title-group h3 {
      font-size: 1.2rem;
      font-weight: 600;
    }
    .project-desc {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .envs-section {
      border-top: 1px solid var(--border);
      padding-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .envs-title {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.05em;
    }
    .envs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .env-item {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .env-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .env-name {
      font-weight: 600;
      font-size: 0.875rem;
    }
    .empty-state-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 3rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: var(--text-muted);
    }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    .modal-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 480px;
      padding: 1.5rem;
      box-shadow: var(--shadow-lg);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.2rem;
      cursor: pointer;
    }
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
    }
  `]
})
export class ProjectsComponent implements OnInit {
  api = inject(ApiService);
  workspaceService = inject(WorkspaceService);

  projects = signal<Project[]>([]);
  showCreateModal = signal(false);
  newProjectName = '';
  newProjectDesc = '';
  loading = signal(false);

  constructor() {
    effect(() => {
      const ws = this.workspaceService.currentWorkspace();
      if (ws) {
        this.loadProjects(ws.id);
      }
    });
  }

  ngOnInit() {
    const ws = this.workspaceService.currentWorkspace();
    if (ws) {
      this.loadProjects(ws.id);
    }
  }

  loadProjects(wsId: string) {
    this.api.getProjects(wsId).subscribe(res => {
      if (res.success && res.data) {
        this.projects.set(res.data);
      }
    });
  }

  onCreateProject() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws || !this.newProjectName) return;

    this.loading.set(true);
    this.api.createProject(ws.id, this.newProjectName, this.newProjectDesc).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.showCreateModal.set(false);
        this.newProjectName = '';
        this.newProjectDesc = '';
        this.loadProjects(ws.id);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
