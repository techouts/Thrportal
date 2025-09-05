import { ApiService } from './api';
import { ApiResponse } from '@/types/attendance';

export interface ComplianceConfig {
  pf: {
    employeeRate: number;
    employerRate: number;
    ceiling: number;
    effectiveDate: string;
  };
  esi: {
    employeeRate: number;
    employerRate: number;
    ceiling: number;
    effectiveDate: string;
  };
  pt: {
    state: string;
    slabs: Array<{
      minSalary: number;
      maxSalary: number;
      amount: number;
    }>;
    effectiveDate: string;
  };
  lwf: {
    employeeAmount: number;
    employerAmount: number;
    ceiling: number;
    effectiveDate: string;
  };
  tds: {
    regime: 'OLD' | 'NEW';
    slabs: Array<{
      minIncome: number;
      maxIncome?: number;
      rate: number;
      cess: number;
    }>;
    effectiveDate: string;
  };
}

export interface SecurityRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
}

export interface SodRule {
  id: string;
  name: string;
  description: string;
  conflictingRoles: string[];
  isActive: boolean;
}

export interface Integration {
  id: string;
  name: string;
  type: 'ATTENDANCE' | 'BANK' | 'ACCOUNTING' | 'ESIGN';
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  config: Record<string, any>;
  lastSyncAt?: string;
  errorMessage?: string;
}

export interface DataBackup {
  id: string;
  type: 'FULL' | 'INCREMENTAL';
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  size?: number;
  downloadUrl?: string;
}

class AdminPayrollServiceClass {

  // Compliance Configuration
  async getCompliance(): Promise<ApiResponse<ComplianceConfig>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const mockConfig: ComplianceConfig = {
      pf: {
        employeeRate: 12,
        employerRate: 12,
        ceiling: 15000,
        effectiveDate: '2024-04-01'
      },
      esi: {
        employeeRate: 0.75,
        employerRate: 3.25,
        ceiling: 25000,
        effectiveDate: '2024-04-01'
      },
      pt: {
        state: 'Karnataka',
        slabs: [
          { minSalary: 0, maxSalary: 15000, amount: 0 },
          { minSalary: 15001, maxSalary: 25000, amount: 200 },
          { minSalary: 25001, maxSalary: 999999, amount: 300 }
        ],
        effectiveDate: '2024-04-01'
      },
      lwf: {
        employeeAmount: 20,
        employerAmount: 40,
        ceiling: 25000,
        effectiveDate: '2024-04-01'
      },
      tds: {
        regime: 'OLD',
        slabs: [
          { minIncome: 0, maxIncome: 250000, rate: 0, cess: 0 },
          { minIncome: 250001, maxIncome: 500000, rate: 5, cess: 4 },
          { minIncome: 500001, maxIncome: 1000000, rate: 20, cess: 4 },
          { minIncome: 1000001, rate: 30, cess: 4 }
        ],
        effectiveDate: '2024-04-01'
      }
    };

    return {
      data: mockConfig,
      message: 'Compliance configuration retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async updateCompliance(config: Partial<ComplianceConfig>): Promise<ApiResponse<ComplianceConfig>> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      data: config as ComplianceConfig,
      message: 'Compliance configuration updated successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // Security Management
  async getSecurityRoles(): Promise<ApiResponse<SecurityRole[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockRoles: SecurityRole[] = [
      {
        id: 'role_employee',
        name: 'Employee',
        description: 'Standard employee access',
        permissions: ['VIEW_OWN_PAYSLIP', 'SUBMIT_TAX_DECLARATION'],
        isActive: true
      },
      {
        id: 'role_hr',
        name: 'HR',
        description: 'HR personnel access',
        permissions: ['VIEW_ALL_PAYSLIPS', 'PROCESS_PAYROLL', 'MANAGE_DECLARATIONS'],
        isActive: true
      },
      {
        id: 'role_finance',
        name: 'Finance',
        description: 'Finance team access',
        permissions: ['EXPORT_JV', 'MANAGE_BANK_FILES', 'VIEW_AUDIT_LOGS'],
        isActive: true
      },
      {
        id: 'role_admin',
        name: 'Admin',
        description: 'System administrator',
        permissions: ['MANAGE_COMPLIANCE', 'MANAGE_SECURITY', 'MANAGE_INTEGRATIONS'],
        isActive: true
      }
    ];

    return {
      data: mockRoles,
      message: 'Security roles retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async getSodRules(): Promise<ApiResponse<SodRule[]>> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const mockRules: SodRule[] = [
      {
        id: 'sod_001',
        name: 'Payroll Maker-Checker',
        description: 'User cannot both create and approve payroll runs',
        conflictingRoles: ['PAYROLL_MAKER', 'PAYROLL_CHECKER'],
        isActive: true
      },
      {
        id: 'sod_002',
        name: 'Payment Authorization',
        description: 'User cannot both prepare and authorize payments',
        conflictingRoles: ['PAYMENT_PREPARER', 'PAYMENT_AUTHORIZER'],
        isActive: true
      }
    ];

    return {
      data: mockRules,
      message: 'SoD rules retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // Integration Management
  async listIntegrations(): Promise<ApiResponse<Integration[]>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const mockIntegrations: Integration[] = [
      {
        id: 'int_attendance',
        name: 'Attendance System',
        type: 'ATTENDANCE',
        status: 'ACTIVE',
        config: { apiUrl: 'https://attendance.company.com/api', apiKey: '***' },
        lastSyncAt: '2024-04-01T08:00:00Z'
      },
      {
        id: 'int_bank',
        name: 'Bank Integration',
        type: 'BANK',
        status: 'ACTIVE',
        config: { bankCode: 'HDFC', accountNumber: '***1234' },
        lastSyncAt: '2024-04-01T15:30:00Z'
      },
      {
        id: 'int_accounting',
        name: 'ERP System',
        type: 'ACCOUNTING',
        status: 'ERROR',
        config: { erpUrl: 'https://erp.company.com', username: 'api_user' },
        lastSyncAt: '2024-03-31T18:00:00Z',
        errorMessage: 'Connection timeout'
      },
      {
        id: 'int_esign',
        name: 'Digital Signature',
        type: 'ESIGN',
        status: 'INACTIVE',
        config: { provider: 'DocuSign', apiKey: '***' }
      }
    ];

    return {
      data: mockIntegrations,
      message: 'Integrations retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async testIntegration(integrationId: string): Promise<ApiResponse<{ status: 'SUCCESS' | 'FAILED'; message: string }>> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      data: { status: 'SUCCESS', message: 'Integration test completed successfully' },
      message: 'Integration test completed',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // Data Management
  async createBackup(type: 'FULL' | 'INCREMENTAL'): Promise<ApiResponse<DataBackup>> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const backup: DataBackup = {
      id: `backup_${Date.now()}`,
      type,
      status: 'RUNNING',
      startedAt: new Date().toISOString()
    };

    return {
      data: backup,
      message: 'Backup initiated successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async getBackups(): Promise<ApiResponse<DataBackup[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockBackups: DataBackup[] = [
      {
        id: 'backup_001',
        type: 'FULL',
        status: 'COMPLETED',
        startedAt: '2024-04-01T02:00:00Z',
        completedAt: '2024-04-01T04:30:00Z',
        size: 2147483648,
        downloadUrl: '/api/admin/backups/backup_001/download'
      },
      {
        id: 'backup_002',
        type: 'INCREMENTAL',
        status: 'COMPLETED',
        startedAt: '2024-04-02T02:00:00Z',
        completedAt: '2024-04-02T02:15:00Z',
        size: 104857600,
        downloadUrl: '/api/admin/backups/backup_002/download'
      }
    ];

    return {
      data: mockBackups,
      message: 'Backups retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async seedData(): Promise<ApiResponse<{ message: string }>> {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      data: { message: 'Sample data loaded successfully' },
      message: 'Data seeding completed',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async purgeData(retentionDays: number): Promise<ApiResponse<{ deletedRecords: number }>> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      data: { deletedRecords: 1250 },
      message: 'Data purge completed successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }
}

export const AdminPayrollService = new AdminPayrollServiceClass();