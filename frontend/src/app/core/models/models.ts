export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
  user: User;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  currentUserRole?: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'VIEWER';
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  email: string;
  fullName: string;
  role: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'VIEWER';
  joinedAt?: string;
  createdAt?: string;
  user?: {
    email?: string;
    fullName?: string;
  };
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  slug?: string;
  description: string;
  environments: Environment[];
  createdAt: string;
}

export interface Environment {
  id: string;
  projectId: string;
  name: string;
  environmentType: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' | 'SIMULATION';
  type?: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' | 'SIMULATION';
  description?: string;
  settings?: string;
  createdAt: string;
}

export interface Execution {
  id: string;
  workspaceId: string;
  environmentId: string;
  workflowName: string;
  correlationId: string;
  parentExecutionId?: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'TIMED_OUT' | 'CANCELLED' | 'COMPENSATING' | 'COMPENSATED';
  triggerSource: string;
  inputPayloadMeta?: string;
  outputPayloadMeta?: string;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  errorMessage?: string;
  isDemo: boolean;
  createdAt: string;
}

export interface ExecutionStats {
  total: number;
  completed: number;
  failed: number;
  running: number;
  timedOut: number;
  successRate: number;
  totalExecutions?: number;
  completedExecutions?: number;
  failedExecutions?: number;
  avgDurationMs?: number;
}

export interface WorkflowEvent {
  id: string;
  workspaceId: string;
  executionId: string;
  eventType: string;
  sourceService?: string;
  targetService?: string;
  sequenceNumber?: number;
  correlationId?: string;
  idempotencyKey?: string;
  payload?: string;
  payloadMetadata?: string;
  status: 'RECEIVED' | 'ACCEPTED' | 'PROCESSED' | 'RETRIED' | 'FAILED' | 'IGNORED' | 'DEAD_LETTERED';
  retryCount?: number;
  errorClass?: string;
  errorMessage?: string;
  occurredAt?: string;
  processedAt?: string;
  createdAt: string;
}

export interface Span {
  id: string;
  spanId: string;
  parentSpanId?: string;
  serviceName: string;
  name?: string;
  operationName?: string;
  spanKind?: string;
  statusCode: string;
  statusMessage?: string;
  attributes?: string;
  startedAt?: string;
  endedAt?: string;
  durationMs: number;
}

export interface TraceDetail {
  id: string;
  workspaceId: string;
  executionId?: string;
  traceId: string;
  rootService: string;
  rootOperation?: string;
  startedAt?: string;
  endedAt?: string;
  durationMs?: number;
  hasErrors: boolean;
  spans: Span[];
}

export interface ServiceNode {
  service: string;
  name?: string;
  callCount: number;
  errorCount: number;
}

export interface ServiceEdge {
  fromService: string;
  toService: string;
  callCount: number;
}

export interface ServiceGraph {
  nodes: ServiceNode[];
  edges: ServiceEdge[];
}

export interface Anomaly {
  id: string;
  workspaceId: string;
  executionId: string;
  ruleType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title?: string;
  description?: string;
  message?: string;
  evidence: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  detectedAt?: string;
  createdAt?: string;
}

export interface AnomalyStats {
  totalUnacknowledged: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface Scenario {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  severity?: string;
  preconditions?: string;
  faultConfig?: string;
  targetService?: string;
  latencyMs?: number;
  faultRate?: number;
  expectedBehavior?: string;
  detectionRule?: string;
  recoveryGuidance?: string;
  isBuiltin?: boolean;
  createdAt?: string;
}

export interface ScenarioRun {
  id: string;
  workspaceId: string;
  scenarioId: string;
  environmentId: string;
  executionId?: string;
  status: string;
  faultInjected?: string;
  observations?: string;
  passedInvariants?: boolean;
  anomaliesDetected?: number;
  startedAt?: string;
  endedAt?: string;
  runBy?: string;
  triggeredBy?: string;
  createdAt?: string;
}

export interface InvariantDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  severity: string;
  ruleType: string;
  enabled: boolean;
  isBuiltin: boolean;
  createdAt: string;
}

export interface InvariantResult {
  id: string;
  workspaceId: string;
  invariantId: string;
  invariantName: string;
  invariantCode: string;
  severity: string;
  executionId: string;
  passed: boolean;
  violationMessage?: string;
  message?: string;
  evidence: string;
  checkedAt: string;
}

export interface InvariantSummary {
  totalChecked: number;
  passedCount: number;
  violatedCount: number;
  allPassed: boolean;
}

export interface PaymentTransaction {
  id: string;
  workspaceId: string;
  executionId?: string;
  transactionReference?: string;
  idempotencyKey?: string;
  amount: number;
  currency: string;
  status: 'INITIATED' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'PENDING' | 'TIMED_OUT' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'RECONCILIATION_PENDING' | 'RECONCILED';
  provider?: string;
  capturedAmount?: number;
  refundedAmount: number;
  providerChargeId?: string;
  customerId?: string;
  errorCode?: string;
  errorMessage?: string;
  reconciliationStatus?: string;
  reconciliationNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentWebhook {
  id: string;
  workspaceId: string;
  transactionId?: string;
  providerEventId: string;
  eventType: string;
  payload: string;
  processed: boolean;
  duplicate: boolean;
  processingError?: string;
  receivedAt: string;
  processedAt?: string;
}

export interface Incident {
  id: string;
  workspaceId: string;
  executionId?: string;
  title: string;
  description?: string;
  summary?: string;
  severity: string;
  status: string;
  rootCauseHypothesis?: string;
  evidenceRefs?: string;
  aiAnalysis?: string;
  aiDiagnosis?: string;
  aiModelUsed?: string;
  remediationSteps?: string;
  createdBy?: string;
  resolvedBy?: string;
  createdAt: string;
  resolvedAt?: string;
  updatedAt?: string;
}

export interface IncidentReport {
  id: string;
  incidentId: string;
  workspaceId: string;
  reportTitle: string;
  content?: string;
  markdownContent?: string;
  generatedBy: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  workspaceId: string;
  name: string;
  keyPrefix: string;
  scopes: string;
  expiresAt?: string;
  lastUsedAt?: string;
  revoked: boolean;
  createdAt: string;
}

export interface ApiKeyCreatedResponse {
  apiKey: ApiKey;
  rawKey: string;
  warning: string;
}

export interface Integration {
  id: string;
  workspaceId: string;
  integrationType: string;
  type?: string;
  name: string;
  enabled: boolean;
  status: string;
  statusMessage?: string;
  lastConnectedAt?: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  workspaceId: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface Webhook {
  id: string;
  workspaceId: string;
  url: string;
  description?: string;
  eventTypes: string;
  enabled: boolean;
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: string;
  payload: string;
  status: string;
  attemptCount: number;
  httpStatus?: number;
  responseBody?: string;
  errorMessage?: string;
  deliveredAt?: string;
  createdAt: string;
}
