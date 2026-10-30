import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Workspace, Project } from '../models/models';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  readonly workspaces = signal<Workspace[]>([]);
  readonly currentWorkspace = signal<Workspace | null>(null);
  readonly projects = signal<Project[]>([]);
  readonly currentProject = signal<Project | null>(null);

  constructor(private api: ApiService) {
    const cachedWs = localStorage.getItem('wrl_active_workspace');
    if (cachedWs) {
      try {
        this.currentWorkspace.set(JSON.parse(cachedWs));
      } catch (e) {
        localStorage.removeItem('wrl_active_workspace');
      }
    }
  }

  loadWorkspaces() {
    return this.api.getWorkspaces().pipe(
      tap(res => {
        if (res.success && res.data && res.data.length > 0) {
          this.workspaces.set(res.data);
          if (!this.currentWorkspace()) {
            this.setActiveWorkspace(res.data[0]);
          } else {
            // Re-verify current workspace exists in list
            const found = res.data.find(w => w.id === this.currentWorkspace()?.id);
            if (found) {
              this.setActiveWorkspace(found);
            } else {
              this.setActiveWorkspace(res.data[0]);
            }
          }
        }
      })
    );
  }

  setActiveWorkspace(ws: Workspace) {
    this.currentWorkspace.set(ws);
    localStorage.setItem('wrl_active_workspace', JSON.stringify(ws));
    this.loadProjects(ws.id);
  }

  loadProjects(wsId: string) {
    this.api.getProjects(wsId).subscribe(res => {
      if (res.success && res.data) {
        this.projects.set(res.data);
        if (res.data.length > 0) {
          this.currentProject.set(res.data[0]);
        } else {
          this.currentProject.set(null);
        }
      }
    });
  }
}
