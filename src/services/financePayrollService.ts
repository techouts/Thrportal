import { ApiService } from './api';
import { ApiResponse } from '@/types/attendance';

export interface JVEntry {
  account: string;
  description: string;
  debit: number;
  credit: number;
}

export interface JVExport {
  runId: string;
  period: string;
  entries: JVEntry[];
  totalDebit: number;
  totalCredit: number;
  generatedAt: string;
  exportUrl?: string;
}

export interface BankBatch {
  id: string;
  runId: string;
  period: string;
  format: 'NEFT' | 'RTGS' | 'IMPS';
  totalAmount: number;
  employeeCount: number;
  status: 'GENERATED' | 'DOWNLOADED' | 'UPLOADED' | 'PROCESSED' | 'PAID';
  generatedAt: string;
  processedAt?: string;
  downloadUrl?: string;
  paidAt?: string;
}

export interface ReconciliationItem {
  employeeId: string;
  employeeName: string;
  payrollAmount: number;
  bankAmount: number;
  variance: number;
  status: 'MATCHED' | 'VARIANCE' | 'MISSING';
  remarks?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

class FinancePayrollServiceClass {

  // Journal Voucher Export
  async exportJV(runId: string): Promise<ApiResponse<JVExport>> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockJV: JVExport = {
      runId,
      period: '2024-04',
      entries: [
        { account: '5001 - Salary Expense', description: 'Basic Salary', debit: 30000000, credit: 0 },
        { account: '5002 - HRA Expense', description: 'House Rent Allowance', debit: 15000000, credit: 0 },
        { account: '5003 - Allowance Expense', description: 'Other Allowances', debit: 8000000, credit: 0 },
        { account: '2001 - TDS Payable', description: 'Tax Deducted at Source', debit: 0, credit: 6500000 },
        { account: '2002 - PF Payable', description: 'Provident Fund', debit: 0, credit: 3600000 },
        { account: '2003 - ESI Payable', description: 'Employee State Insurance', debit: 0, credit: 450000 },
        { account: '2004 - PT Payable', description: 'Professional Tax', debit: 0, credit: 60000 },
        { account: '1001 - Bank Account', description: 'Net Salary Payable', debit: 0, credit: 42390000 }
      ],
      totalDebit: 53000000,
      totalCredit: 53000000,
      generatedAt: new Date().toISOString(),
      exportUrl: `/api/finance/payroll/jv/${runId}/export`
    };

    return {
      data: mockJV,
      message: 'Journal voucher exported successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // Bank Batch Management
  async listBatches(): Promise<ApiResponse<BankBatch[]>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const mockBatches: BankBatch[] = [
      {
        id: 'batch_001',
        runId: 'run_2024_03',
        period: '2024-03',
        format: 'NEFT',
        totalAmount: 42390000,
        employeeCount: 255,
        status: 'PAID',
        generatedAt: '2024-04-01T10:00:00Z',
        processedAt: '2024-04-01T15:30:00Z',
        paidAt: '2024-04-02T09:00:00Z',
        downloadUrl: '/api/finance/batches/batch_001/download'
      },
      {
        id: 'batch_002',
        runId: 'run_2024_04',
        period: '2024-04',
        format: 'NEFT',
        totalAmount: 42850000,
        employeeCount: 257,
        status: 'UPLOADED',
        generatedAt: '2024-05-01T10:00:00Z',
        processedAt: '2024-05-01T14:00:00Z',
        downloadUrl: '/api/finance/batches/batch_002/download'
      }
    ];

    return {
      data: mockBatches,
      message: 'Bank batches retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async markBatchPaid(batchId: string): Promise<ApiResponse<BankBatch>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedBatch: BankBatch = {
      id: batchId,
      runId: 'run_2024_04',
      period: '2024-04',
      format: 'NEFT',
      totalAmount: 42850000,
      employeeCount: 257,
      status: 'PAID',
      generatedAt: '2024-05-01T10:00:00Z',
      processedAt: '2024-05-01T14:00:00Z',
      paidAt: new Date().toISOString(),
      downloadUrl: '/api/finance/batches/batch_002/download'
    };

    return {
      data: updatedBatch,
      message: 'Batch marked as paid successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // Reconciliation
  async reconcile(): Promise<ApiResponse<ReconciliationItem[]>> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const mockReconciliation: ReconciliationItem[] = [
      {
        employeeId: 'EMP001',
        employeeName: 'John Doe',
        payrollAmount: 85000,
        bankAmount: 85000,
        variance: 0,
        status: 'MATCHED'
      },
      {
        employeeId: 'EMP002',
        employeeName: 'Jane Smith',
        payrollAmount: 92000,
        bankAmount: 91500,
        variance: -500,
        status: 'VARIANCE',
        remarks: 'Bank charges deducted'
      },
      {
        employeeId: 'EMP003',
        employeeName: 'Mike Johnson',
        payrollAmount: 78000,
        bankAmount: 0,
        variance: -78000,
        status: 'MISSING',
        remarks: 'Payment not processed'
      }
    ];

    return {
      data: mockReconciliation,
      message: 'Reconciliation completed successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // Audit Logs
  async getAuditLogs(fromDate?: string, toDate?: string, module?: string): Promise<ApiResponse<AuditLogEntry[]>> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockLogs: AuditLogEntry[] = [
      {
        id: 'log_001',
        timestamp: '2024-04-01T10:00:00Z',
        userId: 'USR001',
        userName: 'Admin User',
        action: 'CREATE_PAYROLL_RUN',
        module: 'PAYROLL',
        entityId: 'run_2024_04',
        newValues: { period: '2024-04', status: 'DRAFT' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      {
        id: 'log_002',
        timestamp: '2024-04-01T11:30:00Z',
        userId: 'USR002',
        userName: 'HR Manager',
        action: 'APPROVE_PAYROLL_RUN',
        module: 'PAYROLL',
        entityId: 'run_2024_04',
        oldValues: { status: 'VALIDATED' },
        newValues: { status: 'APPROVED' },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      {
        id: 'log_003',
        timestamp: '2024-04-01T14:00:00Z',
        userId: 'USR003',
        userName: 'Finance User',
        action: 'EXPORT_JOURNAL_VOUCHER',
        module: 'FINANCE',
        entityId: 'run_2024_04',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    ];

    return {
      data: mockLogs,
      message: 'Audit logs retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async exportAuditLogs(filters: any): Promise<ApiResponse<{ downloadUrl: string }>> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      data: { downloadUrl: '/api/finance/audit-logs/export' },
      message: 'Audit logs export generated successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }
}

export const FinancePayrollService = new FinancePayrollServiceClass();