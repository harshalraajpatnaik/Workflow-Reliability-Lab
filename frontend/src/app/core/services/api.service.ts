import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse, PageResponse, Workspace, WorkspaceMember,
  Project, Environment, Execution, ExecutionStats,
  WorkflowEvent, TraceDetail, ServiceGraph, Anomaly,
  AnomalyStats, Scenario, ScenarioRun, InvariantDefinition,
  InvariantResult, InvariantSummary, PaymentTransaction,
  PaymentWebhook, Incident, IncidentReport, ApiKey,
  ApiKeyCreatedResponse, Integration, AuditEvent, Webhook,
  WebhookDelivery
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:8085/api/v1';

  constructor(private http: HttpClient) {}

  // Workspaces
  getWorkspaces(): Observable<ApiResponse<Workspace[]>> {
    return this.http.get<ApiResponse<Workspace[]>>(`${this.baseUrl}/workspaces`);
  }

  createWorkspace(name: string): Observable<ApiResponse<Workspace>> {
    return this.http.post<ApiResponse<Workspace>>(`${this.baseUrl}/workspaces`, { name });
  }

  getWorkspaceMembers(wsId: string): Observable<ApiResponse<WorkspaceMember[]>> {
    return this.http.get<ApiResponse<WorkspaceMember[]>>(`${this.baseUrl}/workspaces/${wsId}/members`);
  }

  inviteMember(wsId: string, email: string, role: string): Observable<ApiResponse<WorkspaceMember>> {
    return this.http.post<ApiResponse<WorkspaceMember>>(`${this.baseUrl}/workspaces/${wsId}/members`, { email, role });
  }

  removeWorkspaceMember(wsId: string, userId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/workspaces/${wsId}/members/${userId}`);
  }

  updateMemberRole(wsId: string, userId: string, role: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/workspaces/${wsId}/members/${userId}`, { role });
  }

  // Projects & Environments
  getProjects(wsId: string): Observable<ApiResponse<Project[]>> {
    return this.http.get<ApiResponse<Project[]>>(`${this.baseUrl}/workspaces/${wsId}/projects`);
  }

  createProject(wsId: string, name: string, description?: string): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(`${this.baseUrl}/workspaces/${wsId}/projects`, { name, description });
  }

  createEnvironment(wsId: string, projectId: string, name: string, environmentType: string, description?: string): Observable<ApiResponse<Environment>> {
    return this.http.post<ApiResponse<Environment>>(`${this.baseUrl}/workspaces/${wsId}/projects/${projectId}/environments`, {
      name,
      environmentType,
      description
    });
  }

  // Executions
  getExecutions(wsId: string, params?: { environmentId?: string; status?: string; search?: string; page?: number; size?: number }): Observable<ApiResponse<PageResponse<Execution>>> {
    let httpParams = new HttpParams();
    if (params?.environmentId) httpParams = httpParams.set('environmentId', params.environmentId);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params?.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    return this.http.get<ApiResponse<PageResponse<Execution>>>(`${this.baseUrl}/workspaces/${wsId}/executions`, { params: httpParams });
  }

  getExecution(wsId: string, executionId: string): Observable<ApiResponse<Execution>> {
    return this.http.get<ApiResponse<Execution>>(`${this.baseUrl}/workspaces/${wsId}/executions/${executionId}`);
  }

  getExecutionStats(wsId: string): Observable<ApiResponse<ExecutionStats>> {
    return this.http.get<ApiResponse<ExecutionStats>>(`${this.baseUrl}/workspaces/${wsId}/executions/stats`);
  }

  createExecution(wsId: string, data: any): Observable<ApiResponse<Execution>> {
    return this.http.post<ApiResponse<Execution>>(`${this.baseUrl}/workspaces/${wsId}/executions`, data);
  }

  // Events
  getExecutionEvents(wsId: string, executionId: string): Observable<ApiResponse<WorkflowEvent[]>> {
    return this.http.get<ApiResponse<WorkflowEvent[]>>(`${this.baseUrl}/workspaces/${wsId}/executions/${executionId}/events`);
  }

  listWorkspaceEvents(wsId: string, page = 0, size = 20): Observable<ApiResponse<PageResponse<WorkflowEvent>>> {
    return this.http.get<ApiResponse<PageResponse<WorkflowEvent>>>(`${this.baseUrl}/workspaces/${wsId}/events?page=${page}&size=${size}`);
  }

  ingestEvent(wsId: string, data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/workspaces/${wsId}/events`, data);
  }

  // Traces
  getExecutionTraces(wsId: string, executionId: string): Observable<ApiResponse<TraceDetail[]>> {
    return this.http.get<ApiResponse<TraceDetail[]>>(`${this.baseUrl}/workspaces/${wsId}/executions/${executionId}/traces`);
  }

  getTrace(wsId: string, traceId: string): Observable<ApiResponse<TraceDetail>> {
    return this.http.get<ApiResponse<TraceDetail>>(`${this.baseUrl}/workspaces/${wsId}/traces/${traceId}`);
  }

  getServiceGraph(wsId: string): Observable<ApiResponse<ServiceGraph>> {
    return this.http.get<ApiResponse<ServiceGraph>>(`${this.baseUrl}/workspaces/${wsId}/traces/service-graph`);
  }

  listTraces(wsId: string, page = 0, size = 20): Observable<ApiResponse<PageResponse<TraceDetail>>> {
    return this.http.get<ApiResponse<PageResponse<TraceDetail>>>(`${this.baseUrl}/workspaces/${wsId}/traces?page=${page}&size=${size}`);
  }

  // Anomalies
  getAnomalies(wsId: string, page = 0, size = 20): Observable<ApiResponse<PageResponse<Anomaly>>> {
    return this.http.get<ApiResponse<PageResponse<Anomaly>>>(`${this.baseUrl}/workspaces/${wsId}/anomalies?page=${page}&size=${size}`);
  }

  getAnomalyStats(wsId: string): Observable<ApiResponse<AnomalyStats>> {
    return this.http.get<ApiResponse<AnomalyStats>>(`${this.baseUrl}/workspaces/${wsId}/anomalies/stats`);
  }

  getExecutionAnomalies(wsId: string, executionId: string): Observable<ApiResponse<Anomaly[]>> {
    return this.http.get<ApiResponse<Anomaly[]>>(`${this.baseUrl}/workspaces/${wsId}/executions/${executionId}/anomalies`);
  }

  acknowledgeAnomaly(wsId: string, anomalyId: string): Observable<ApiResponse<Anomaly>> {
    return this.http.post<ApiResponse<Anomaly>>(`${this.baseUrl}/workspaces/${wsId}/anomalies/${anomalyId}/acknowledge`, {});
  }

  // Scenarios
  getScenarios(wsId: string): Observable<ApiResponse<Scenario[]>> {
    return this.http.get<ApiResponse<Scenario[]>>(`${this.baseUrl}/workspaces/${wsId}/scenarios`);
  }

  runScenario(wsId: string, scenarioId: string, environmentId: string, customFaultConfig?: string): Observable<ApiResponse<ScenarioRun>> {
    return this.http.post<ApiResponse<ScenarioRun>>(`${this.baseUrl}/workspaces/${wsId}/scenarios/${scenarioId}/run`, {
      environmentId,
      customFaultConfig
    });
  }

  getScenarioRuns(wsId: string, page = 0, size = 20): Observable<ApiResponse<PageResponse<ScenarioRun>>> {
    return this.http.get<ApiResponse<PageResponse<ScenarioRun>>>(`${this.baseUrl}/workspaces/${wsId}/scenarios/runs?page=${page}&size=${size}`);
  }

  // Invariants
  getInvariantDefinitions(wsId: string): Observable<ApiResponse<InvariantDefinition[]>> {
    return this.http.get<ApiResponse<InvariantDefinition[]>>(`${this.baseUrl}/workspaces/${wsId}/invariants/definitions`);
  }

  getExecutionInvariants(wsId: string, executionId: string): Observable<ApiResponse<InvariantResult[]>> {
    return this.http.get<ApiResponse<InvariantResult[]>>(`${this.baseUrl}/workspaces/${wsId}/executions/${executionId}/invariants`);
  }

  getInvariantResults(wsId: string, page = 0, size = 20): Observable<ApiResponse<PageResponse<InvariantResult>>> {
    return this.http.get<ApiResponse<PageResponse<InvariantResult>>>(`${this.baseUrl}/workspaces/${wsId}/invariants/results?page=${page}&size=${size}`);
  }

  // Payments
  getPayments(wsId: string, page = 0, size = 20): Observable<ApiResponse<PageResponse<PaymentTransaction>>> {
    return this.http.get<ApiResponse<PageResponse<PaymentTransaction>>>(`${this.baseUrl}/workspaces/${wsId}/payments?page=${page}&size=${size}`);
  }

  initiatePayment(wsId: string, data: any): Observable<ApiResponse<PaymentTransaction>> {
    return this.http.post<ApiResponse<PaymentTransaction>>(`${this.baseUrl}/workspaces/${wsId}/payments/initiate`, data);
  }

  refundPayment(wsId: string, txnId: string, amount: number, reason?: string): Observable<ApiResponse<PaymentTransaction>> {
    return this.http.post<ApiResponse<PaymentTransaction>>(`${this.baseUrl}/workspaces/${wsId}/payments/${txnId}/refund`, { amount, reason });
  }

  reconcilePayment(wsId: string, txnId: string): Observable<ApiResponse<PaymentTransaction>> {
    return this.http.post<ApiResponse<PaymentTransaction>>(`${this.baseUrl}/workspaces/${wsId}/payments/${txnId}/reconcile`, {});
  }

  simulatePaymentWebhook(wsId: string, data: any): Observable<ApiResponse<PaymentWebhook>> {
    return this.http.post<ApiResponse<PaymentWebhook>>(`${this.baseUrl}/workspaces/${wsId}/payments/webhooks`, data);
  }

  // Incidents
  getIncidents(wsId: string, page = 0, size = 20): Observable<ApiResponse<PageResponse<Incident>>> {
    return this.http.get<ApiResponse<PageResponse<Incident>>>(`${this.baseUrl}/workspaces/${wsId}/incidents?page=${page}&size=${size}`);
  }

  createIncident(wsId: string, data: any): Observable<ApiResponse<Incident>> {
    return this.http.post<ApiResponse<Incident>>(`${this.baseUrl}/workspaces/${wsId}/incidents`, data);
  }

  requestAiAnalysis(wsId: string, incidentId: string): Observable<ApiResponse<Incident>> {
    return this.http.post<ApiResponse<Incident>>(`${this.baseUrl}/workspaces/${wsId}/incidents/${incidentId}/ai-analysis`, {});
  }

  generatePostmortemReport(wsId: string, incidentId: string): Observable<ApiResponse<IncidentReport>> {
    return this.http.post<ApiResponse<IncidentReport>>(`${this.baseUrl}/workspaces/${wsId}/incidents/${incidentId}/reports`, {});
  }

  // API Keys
  getApiKeys(wsId: string): Observable<ApiResponse<ApiKey[]>> {
    return this.http.get<ApiResponse<ApiKey[]>>(`${this.baseUrl}/workspaces/${wsId}/api-keys`);
  }

  createApiKey(wsId: string, name: string, scopes?: string): Observable<ApiResponse<ApiKeyCreatedResponse>> {
    return this.http.post<ApiResponse<ApiKeyCreatedResponse>>(`${this.baseUrl}/workspaces/${wsId}/api-keys`, { name, scopes });
  }

  revokeApiKey(wsId: string, keyId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/workspaces/${wsId}/api-keys/${keyId}`);
  }

  // Integrations
  getIntegrations(wsId: string): Observable<ApiResponse<Integration[]>> {
    return this.http.get<ApiResponse<Integration[]>>(`${this.baseUrl}/workspaces/${wsId}/integrations`);
  }

  configureRabbitMq(wsId: string, data: any): Observable<ApiResponse<Integration>> {
    return this.http.post<ApiResponse<Integration>>(`${this.baseUrl}/workspaces/${wsId}/integrations/rabbitmq`, data);
  }

  testRabbitMqConnection(wsId: string, data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/workspaces/${wsId}/integrations/rabbitmq/test`, data);
  }

  // Webhooks
  getWebhooks(wsId: string): Observable<ApiResponse<Webhook[]>> {
    return this.http.get<ApiResponse<Webhook[]>>(`${this.baseUrl}/workspaces/${wsId}/webhooks`);
  }

  registerWebhook(wsId: string, data: any): Observable<ApiResponse<Webhook>> {
    return this.http.post<ApiResponse<Webhook>>(`${this.baseUrl}/workspaces/${wsId}/webhooks`, data);
  }

  deleteWebhook(wsId: string, webhookId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/workspaces/${wsId}/webhooks/${webhookId}`);
  }

  // Audit
  getAuditEvents(wsId: string, page = 0, size = 20): Observable<ApiResponse<PageResponse<AuditEvent>>> {
    return this.http.get<ApiResponse<PageResponse<AuditEvent>>>(`${this.baseUrl}/workspaces/${wsId}/audit?page=${page}&size=${size}`);
  }
}
