import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { WorkspaceMember } from '../../core/models/models';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="team-page">
      <div class="page-header">
        <div>
          <h1>Team Members & Roles</h1>
          <p class="subtitle">Role-Based Access Control (RBAC) and workspace member authorization</p>
        </div>
        <button class="btn btn-primary" (click)="showInviteModal.set(true)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Invite Member</span>
        </button>
      </div>

      <!-- Members Table -->
      <div class="panel">
        <div class="table-container" *ngIf="members().length > 0; else noMembers">
          <table class="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Role</th>
                <th>Added Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of members()">
                <td class="font-medium">
                  <div class="member-cell">
                    <div class="avatar-small">
                      {{ m.user ? (m.user.fullName ? m.user.fullName[0].toUpperCase() : 'U') : 'U' }}
                    </div>
                    <span>{{ m.user?.fullName || 'Active Member' }}</span>
                  </div>
                </td>
                <td class="font-mono text-xs">{{ m.user?.email || '-' }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-danger': m.role === 'OWNER',
                    'badge-warning': m.role === 'ADMIN',
                    'badge-info': m.role === 'DEVELOPER',
                    'badge-primary': m.role === 'VIEWER'
                  }">
                    {{ m.role }}
                  </span>
                </td>
                <td class="text-xs text-muted">{{ m.createdAt | date:'medium' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noMembers>
          <div class="empty-state">
            <p>No members loaded for this workspace.</p>
          </div>
        </ng-template>
      </div>

      <!-- Invite Modal -->
      <div class="modal-backdrop" *ngIf="showInviteModal()">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Invite Team Member</h3>
            <button class="close-btn" (click)="showInviteModal.set(false)">✕</button>
          </div>
          <form (ngSubmit)="onInviteSubmit()" class="modal-form">
            <div class="form-group">
              <label for="invEmail">Work Email</label>
              <input 
                id="invEmail" 
                type="email" 
                class="form-control" 
                [(ngModel)]="inviteEmail" 
                name="invEmail" 
                required 
                placeholder="colleague@company.com" 
              />
            </div>
            <div class="form-group">
              <label for="invRole">Workspace Role</label>
              <select id="invRole" class="form-control" [(ngModel)]="inviteRole" name="invRole">
                <option value="DEVELOPER">DEVELOPER (Run simulations, read/write traces)</option>
                <option value="ADMIN">ADMIN (Manage integrations, API keys, members)</option>
                <option value="VIEWER">VIEWER (Read-only observation)</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showInviteModal.set(false)">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="loading() || !inviteEmail">
                {{ loading() ? 'Sending...' : 'Send Invitation' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .team-page {
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
    .member-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .avatar-small {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .empty-state {
      padding: 3rem;
      text-align: center;
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
      max-width: 460px;
      padding: 1.5rem;
      box-shadow: var(--shadow-lg);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
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
export class TeamComponent implements OnInit {
  api = inject(ApiService);
  workspaceService = inject(WorkspaceService);

  members = signal<WorkspaceMember[]>([]);
  showInviteModal = signal(false);
  inviteEmail = '';
  inviteRole = 'DEVELOPER';
  loading = signal(false);

  constructor() {
    effect(() => {
      const ws = this.workspaceService.currentWorkspace();
      if (ws) {
        this.loadMembers(ws.id);
      }
    });
  }

  ngOnInit() {
    const ws = this.workspaceService.currentWorkspace();
    if (ws) {
      this.loadMembers(ws.id);
    }
  }

  loadMembers(wsId: string) {
    this.api.getWorkspaceMembers(wsId).subscribe(res => {
      if (res.success && res.data) {
        this.members.set(res.data);
      }
    });
  }

  onInviteSubmit() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws || !this.inviteEmail) return;

    this.loading.set(true);
    this.api.inviteMember(ws.id, this.inviteEmail, this.inviteRole).subscribe({
      next: () => {
        this.loading.set(false);
        this.showInviteModal.set(false);
        this.inviteEmail = '';
        this.loadMembers(ws.id);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
