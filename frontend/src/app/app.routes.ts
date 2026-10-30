import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public Routes
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./pages/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
  },
  {
    path: 'docs',
    loadComponent: () => import('./pages/docs/docs.component').then(m => m.DocsComponent)
  },

  // Authenticated Workspace Routes
  {
    path: 'workspace',
    loadComponent: () => import('./layout/workspace-layout/workspace-layout.component').then(m => m.WorkspaceLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent)
      },
      {
        path: 'executions',
        loadComponent: () => import('./pages/executions/executions.component').then(m => m.ExecutionsComponent)
      },
      {
        path: 'executions/:id',
        loadComponent: () => import('./pages/executions/execution-detail/execution-detail.component').then(m => m.ExecutionDetailComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('./pages/events/events.component').then(m => m.EventsComponent)
      },
      {
        path: 'traces',
        loadComponent: () => import('./pages/traces/traces.component').then(m => m.TracesComponent)
      },
      {
        path: 'anomalies',
        loadComponent: () => import('./pages/anomalies/anomalies.component').then(m => m.AnomaliesComponent)
      },
      {
        path: 'scenarios',
        loadComponent: () => import('./pages/scenarios/scenarios.component').then(m => m.ScenariosComponent)
      },
      {
        path: 'invariants',
        loadComponent: () => import('./pages/invariants/invariants.component').then(m => m.InvariantsComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./pages/payments/payments.component').then(m => m.PaymentsComponent)
      },
      {
        path: 'incidents',
        loadComponent: () => import('./pages/incidents/incidents.component').then(m => m.IncidentsComponent)
      },
      {
        path: 'incidents/:id',
        loadComponent: () => import('./pages/incidents/incident-detail/incident-detail.component').then(m => m.IncidentDetailComponent)
      },
      {
        path: 'integrations',
        loadComponent: () => import('./pages/integrations/integrations.component').then(m => m.IntegrationsComponent)
      },
      {
        path: 'api-keys',
        loadComponent: () => import('./pages/api-keys/api-keys.component').then(m => m.ApiKeysComponent)
      },
      {
        path: 'webhooks',
        loadComponent: () => import('./pages/webhooks/webhooks.component').then(m => m.WebhooksComponent)
      },
      {
        path: 'team',
        loadComponent: () => import('./pages/team/team.component').then(m => m.TeamComponent)
      },
      {
        path: 'audit',
        loadComponent: () => import('./pages/audit/audit.component').then(m => m.AuditComponent)
      }
    ]
  },

  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
