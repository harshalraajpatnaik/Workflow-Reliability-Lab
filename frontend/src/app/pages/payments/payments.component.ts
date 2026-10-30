import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { PaymentTransaction } from '../../core/models/models';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="payments-page">
      <div class="page-header">
        <div>
          <h1>Financial & Payment Reliability Simulator</h1>
          <p class="subtitle">Strict state machine validation, idempotency testing, and refund ceiling protection</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="showInitiateModal.set(true)">
            <span>+ Initiate New Payment</span>
          </button>
          <button class="btn btn-secondary" (click)="loadPayments()">
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- State Machine Visual Card -->
      <div class="state-machine-card">
        <span class="sm-title">FORMAL PAYMENT STATE MACHINE</span>
        <div class="sm-diagram">
          <div class="sm-node">
            <span class="badge badge-info">PENDING</span>
            <span class="sm-sub">Created</span>
          </div>
          <div class="sm-arrow">➔</div>
          <div class="sm-node">
            <span class="badge badge-warning">AUTHORIZED</span>
            <span class="sm-sub">Hold placed</span>
          </div>
          <div class="sm-arrow">➔</div>
          <div class="sm-node">
            <span class="badge badge-success">CAPTURED</span>
            <span class="sm-sub">Funds settled</span>
          </div>
          <div class="sm-arrow">➔</div>
          <div class="sm-node">
            <span class="badge badge-primary">REFUNDED</span>
            <span class="sm-sub">Ceiling verified</span>
          </div>
          <div class="sm-node failed-node">
            <span class="badge badge-danger">FAILED</span>
            <span class="sm-sub">Terminal drop</span>
          </div>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="panel">
        <div class="panel-header">
          <h3>Payment Transactions</h3>
          <span class="text-xs text-muted">Protected by INV-004 (Balance Zero-Sum) & INV-005 (Refund Ceiling)</span>
        </div>

        <div class="table-container" *ngIf="payments().length > 0; else noPayments">
          <table class="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Refunded</th>
                <th>Customer</th>
                <th>Idempotency Key</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let txn of payments()">
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-success': txn.status === 'CAPTURED',
                    'badge-primary': txn.status === 'REFUNDED',
                    'badge-warning': txn.status === 'AUTHORIZED' || txn.status === 'PENDING',
                    'badge-danger': txn.status === 'FAILED'
                  }">
                    {{ txn.status }}
                  </span>
                </td>
                <td class="font-mono text-cyan font-bold">{{ txn.id.substring(0, 12) }}...</td>
                <td class="font-mono font-bold">{{ txn.currency }} {{ txn.amount.toFixed(2) }}</td>
                <td class="font-mono text-xs">{{ txn.currency }} {{ txn.refundedAmount.toFixed(2) }}</td>
                <td class="text-xs">{{ txn.customerId || 'cust_anon' }}</td>
                <td class="font-mono text-xs text-muted">{{ txn.idempotencyKey || '-' }}</td>
                <td class="text-xs text-muted">{{ txn.createdAt | date:'shortTime' }}</td>
                <td>
                  <div class="action-buttons">
                    <button 
                      *ngIf="txn.status === 'CAPTURED'" 
                      class="btn btn-secondary btn-sm" 
                      (click)="openRefundModal(txn)">
                      Refund
                    </button>
                    <button 
                      class="btn btn-secondary btn-sm" 
                      (click)="reconcile(txn.id)" 
                      title="Reconcile against ledger">
                      Reconcile
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #noPayments>
          <div class="empty-state">
            <p>No payment transactions recorded yet. Initiate a new simulated payment above!</p>
          </div>
        </ng-template>
      </div>

      <!-- Initiate Payment Modal -->
      <div class="modal-backdrop" *ngIf="showInitiateModal()">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Initiate Simulated Payment</h3>
            <button class="close-btn" (click)="showInitiateModal.set(false)">✕</button>
          </div>
          <form (ngSubmit)="onInitiatePayment()" class="modal-form">
            <div class="form-group">
              <label for="payAmount">Amount ($ USD)</label>
              <input 
                id="payAmount" 
                type="number" 
                step="0.01" 
                class="form-control font-mono" 
                [(ngModel)]="amount" 
                name="payAmount" 
                required 
              />
            </div>
            <div class="form-group">
              <label for="faultSelector">Fault Injection Mode</label>
              <select id="faultSelector" class="form-control" [(ngModel)]="faultMode" name="faultSelector">
                <option value="NONE">NONE (Clean Successful Settlement)</option>
                <option value="GATEWAY_TIMEOUT">GATEWAY_TIMEOUT (Simulate 504 Gateway Latency)</option>
                <option value="GATEWAY_DECLINE">GATEWAY_DECLINE (Simulate Insufficient Funds)</option>
                <option value="DUPLICATE_WEBHOOK">DUPLICATE_WEBHOOK (Simulate At-Least-Once Webhook Replay)</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showInitiateModal.set(false)">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="loading()">
                {{ loading() ? 'Executing...' : 'Submit Payment' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Refund Modal -->
      <div class="modal-backdrop" *ngIf="selectedTxnForRefund()">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Issue Refund</h3>
            <button class="close-btn" (click)="selectedTxnForRefund.set(null)">✕</button>
          </div>
          <form (ngSubmit)="onRefundSubmit()" class="modal-form">
            <p class="text-xs text-muted">
              Transaction: <span class="font-mono text-cyan">{{ selectedTxnForRefund()!.id }}</span><br>
              Total Captured: <span class="font-bold">{{ selectedTxnForRefund()!.amount }} {{ selectedTxnForRefund()!.currency }}</span><br>
              Already Refunded: <span class="font-mono">{{ selectedTxnForRefund()!.refundedAmount }}</span>
            </p>
            <div class="form-group">
              <label for="refAmount">Refund Amount ($)</label>
              <input 
                id="refAmount" 
                type="number" 
                step="0.01" 
                class="form-control font-mono" 
                [(ngModel)]="refundAmount" 
                name="refAmount" 
                required 
              />
            </div>
            <div class="form-group">
              <label for="refReason">Reason</label>
              <input 
                id="refReason" 
                type="text" 
                class="form-control" 
                [(ngModel)]="refundReason" 
                name="refReason" 
                placeholder="Customer return" 
              />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="selectedTxnForRefund.set(null)">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="loading()">
                {{ loading() ? 'Processing...' : 'Process Refund' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payments-page {
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
    .state-machine-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .sm-title {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.05em;
    }
    .sm-diagram {
      display: flex;
      align-items: center;
      gap: 1rem;
      overflow-x: auto;
      padding: 0.5rem 0;
    }
    .sm-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      padding: 0.5rem 0.85rem;
      border-radius: var(--radius-md);
      min-width: 100px;
    }
    .failed-node {
      margin-left: auto;
      border-color: rgba(239, 68, 68, 0.4);
    }
    .sm-sub {
      font-size: 0.65rem;
      color: var(--text-muted);
    }
    .sm-arrow {
      color: var(--text-muted);
      font-weight: 700;
    }
    .panel {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .panel-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .panel-header h3 {
      font-size: 1rem;
      font-weight: 600;
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
    .action-buttons {
      display: flex;
      gap: 0.4rem;
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
export class PaymentsComponent implements OnInit {
  api = inject(ApiService);
  workspaceService = inject(WorkspaceService);

  payments = signal<PaymentTransaction[]>([]);
  showInitiateModal = signal(false);
  selectedTxnForRefund = signal<PaymentTransaction | null>(null);

  amount = 125.00;
  faultMode = 'NONE';
  refundAmount = 50.00;
  refundReason = '';
  loading = signal(false);

  constructor() {
    effect(() => {
      const ws = this.workspaceService.currentWorkspace();
      if (ws) {
        this.loadPayments();
      }
    });
  }

  ngOnInit() {
    const ws = this.workspaceService.currentWorkspace();
    if (ws) {
      this.loadPayments();
    }
  }

  loadPayments() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws) return;

    this.api.getPayments(ws.id, 0, 20).subscribe(res => {
      if (res.success && res.data) {
        this.payments.set(res.data.content);
      }
    });
  }

  onInitiatePayment() {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws) return;

    this.loading.set(true);
    const data = {
      amount: this.amount,
      currency: 'USD',
      customerId: 'cust_sandbox_99',
      faultMode: this.faultMode
    };

    this.api.initiatePayment(ws.id, data).subscribe({
      next: () => {
        this.loading.set(false);
        this.showInitiateModal.set(false);
        this.loadPayments();
      },
      error: (err) => {
        this.loading.set(false);
        alert(err.error?.message || 'Failed to initiate payment.');
      }
    });
  }

  openRefundModal(txn: PaymentTransaction) {
    this.selectedTxnForRefund.set(txn);
    this.refundAmount = txn.amount - txn.refundedAmount;
  }

  onRefundSubmit() {
    const ws = this.workspaceService.currentWorkspace();
    const txn = this.selectedTxnForRefund();
    if (!ws || !txn) return;

    this.loading.set(true);
    this.api.refundPayment(ws.id, txn.id, this.refundAmount, this.refundReason).subscribe({
      next: () => {
        this.loading.set(false);
        this.selectedTxnForRefund.set(null);
        this.loadPayments();
      },
      error: (err) => {
        this.loading.set(false);
        alert(err.error?.message || 'Refund rejected by invariant check.');
      }
    });
  }

  reconcile(txnId: string) {
    const ws = this.workspaceService.currentWorkspace();
    if (!ws) return;

    this.api.reconcilePayment(ws.id, txnId).subscribe({
      next: () => {
        alert('Payment successfully reconciled against ledger.');
        this.loadPayments();
      }
    });
  }
}
