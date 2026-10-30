import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { WorkspaceService } from '../../core/services/workspace.service';

@Component({
  selector: 'app-workspace-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="layout-container">
      <app-navbar></app-navbar>
      <div class="layout-body">
        <app-sidebar></app-sidebar>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      background-color: var(--bg-primary);
    }
    .layout-body {
      display: flex;
      flex: 1;
      height: calc(100vh - 60px);
      overflow: hidden;
    }
    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem 2rem;
      background-color: var(--bg-primary);
    }
  `]
})
export class WorkspaceLayoutComponent implements OnInit {
  workspaceService = inject(WorkspaceService);

  ngOnInit() {
    this.workspaceService.loadWorkspaces().subscribe();
  }
}
