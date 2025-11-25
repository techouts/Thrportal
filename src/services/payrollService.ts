import { ApiService } from './api';
import { ApiResponse } from '@/types/attendance';

export interface PayrollRun {
  id: string;
  period: string;
  status: 'DRAFT' | 'SIMULATED' | 'VALIDATED' | 'APPROVED' | 'LOCKED' | 'PAID';
  createdAt: string;
  processedAt?: string;
  employeeCount: number;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  exceptionCount: number;
}

export interface PayrollException {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'MISSING_PAN' | 'INVALID_BANK' | 'NEGATIVE_NET' | 'VALIDATION_ERROR';
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface BankBatch {
  id: string;
  runId: string;
  format: 'NEFT' | 'RTGS' | 'IMPS';
  totalAmount: number;
  employeeCount: number;
  status: 'GENERATED' | 'DOWNLOADED' | 'UPLOADED' | 'PROCESSED' | 'PAID';
  generatedAt: string;
  processedAt?: string;
  downloadUrl?: string;
}

class PayrollServiceClass {

  // Payroll Run Management
  async listRuns(period?: string): Promise<ApiResponse<PayrollRun[]>> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockRuns: PayrollRun[] = [
      {
        id: 'run_2024_01',
        period: '2024-01',
        status: 'PAID',
        createdAt: '2024-01-28T10:00:00Z',
        processedAt: '2024-02-01T15:30:00Z',
        employeeCount: 250,
        totalGross: 75000000,
        totalNet: 62500000,
        totalDeductions: 12500000,
        exceptionCount: 0
      },
      {
        id: 'run_2024_02',
        period: '2024-02',
        status: 'APPROVED',
        createdAt: '2024-02-28T10:00:00Z',
        processedAt: '2024-03-01T14:00:00Z',
        employeeCount: 252,
        totalGross: 75600000,
        totalNet: 63000000,
        totalDeductions: 12600000,
        exceptionCount: 3
      },
      {
        id: 'run_2024_03',
        period: '2024-03',
        status: 'VALIDATED',
        createdAt: '2024-03-29T09:30:00Z',
        employeeCount: 255,
        totalGross: 76500000,
        totalNet: 63750000,
        totalDeductions: 12750000,
        exceptionCount: 5
      }
    ];

    return {
      data: period ? mockRuns.filter(r => r.period === period) : mockRuns,
      message: 'Payroll runs retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async createRun(period: string): Promise<ApiResponse<PayrollRun>> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newRun: PayrollRun = {
      id: `run_${period.replace('-', '_')}`,
      period,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      employeeCount: 255,
      totalGross: 0,
      totalNet: 0,
      totalDeductions: 0,
      exceptionCount: 0
    };

    return {
      data: newRun,
      message: 'Payroll run created successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async simulate(id: string): Promise<ApiResponse<PayrollRun>> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const simulatedRun: PayrollRun = {
      id,
      period: '2024-04',
      status: 'SIMULATED',
      createdAt: '2024-04-01T10:00:00Z',
      processedAt: new Date().toISOString(),
      employeeCount: 255,
      totalGross: 76500000,
      totalNet: 63750000,
      totalDeductions: 12750000,
      exceptionCount: 8
    };

    return {
      data: simulatedRun,
      message: 'Payroll simulation completed successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async validate(id: string): Promise<ApiResponse<PayrollRun>> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const validatedRun: PayrollRun = {
      id,
      period: '2024-04',
      status: 'VALIDATED',
      createdAt: '2024-04-01T10:00:00Z',
      processedAt: new Date().toISOString(),
      employeeCount: 255,
      totalGross: 76500000,
      totalNet: 63750000,
      totalDeductions: 12750000,
      exceptionCount: 2
    };

    return {
      data: validatedRun,
      message: 'Payroll validation completed successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async approve(id: string): Promise<ApiResponse<PayrollRun>> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const approvedRun: PayrollRun = {
      id,
      period: '2024-04',
      status: 'APPROVED',
      createdAt: '2024-04-01T10:00:00Z',
      processedAt: new Date().toISOString(),
      employeeCount: 255,
      totalGross: 76500000,
      totalNet: 63750000,
      totalDeductions: 12750000,
      exceptionCount: 0
    };

    return {
      data: approvedRun,
      message: 'Payroll run approved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async lockRun(id: string): Promise<ApiResponse<PayrollRun>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const lockedRun: PayrollRun = {
      id,
      period: '2024-04',
      status: 'LOCKED',
      createdAt: '2024-04-01T10:00:00Z',
      processedAt: new Date().toISOString(),
      employeeCount: 255,
      totalGross: 76500000,
      totalNet: 63750000,
      totalDeductions: 12750000,
      exceptionCount: 0
    };

    return {
      data: lockedRun,
      message: 'Payroll run locked successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async getExceptions(runId: string): Promise<ApiResponse<PayrollException[]>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const mockExceptions: PayrollException[] = [
      {
        id: 'exc_001',
        employeeId: 'EMP001',
        employeeName: 'John Doe',
        type: 'MISSING_PAN',
        description: 'PAN number not provided',
        severity: 'HIGH'
      },
      {
        id: 'exc_002',
        employeeId: 'EMP045',
        employeeName: 'Jane Smith',
        type: 'INVALID_BANK',
        description: 'Invalid bank account number format',
        severity: 'HIGH'
      },
      {
        id: 'exc_003',
        employeeId: 'EMP078',
        employeeName: 'Mike Johnson',
        type: 'NEGATIVE_NET',
        description: 'Net salary is negative due to excessive deductions',
        severity: 'MEDIUM'
      }
    ];

    return {
      data: mockExceptions,
      message: 'Payroll exceptions retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // Bank File Generation
  async bankFile(id: string, format: string): Promise<ApiResponse<BankBatch>> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const batch: BankBatch = {
      id: `batch_${Date.now()}`,
      runId: id,
      format: format as 'NEFT' | 'RTGS' | 'IMPS',
      totalAmount: 63750000,
      employeeCount: 255,
      status: 'GENERATED',
      generatedAt: new Date().toISOString(),
      downloadUrl: `/api/payroll/batches/batch_${Date.now()}/download`
    };

    return {
      data: batch,
      message: 'Bank file generated successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // Statutory Reports
  async generateStatutoryFile(type: 'PF' | 'ESI' | 'PT' | 'LWF' | 'TDS', runId: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      data: { downloadUrl: `/api/payroll/statutory/${type.toLowerCase()}/${runId}/download` },
      message: `${type} file generated successfully`,
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // F&F Settlement
  async calculateFnF(employeeId: string, lastWorkingDay: string): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const fnfCalculation = {
      employeeId,
      lastWorkingDay,
      basicSalary: 50000,
      pendingLeaves: 5,
      leaveEncashment: 15000,
      gratuity: 125000,
      noticePay: 50000,
      totalPayable: 240000,
      recoveries: 10000,
      netPayable: 230000
    };

    return {
      data: fnfCalculation,
      message: 'F&F calculation completed successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }
}

export const PayrollService = new PayrollServiceClass();