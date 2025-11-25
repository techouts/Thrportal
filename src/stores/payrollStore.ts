import { create } from 'zustand';
import { PayrollService } from '@/services/payrollService';

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

export interface ExceptionBucket {
  missingPan: PayrollException[];
  invalidBank: PayrollException[];
  negativeNet: PayrollException[];
  validationErrors: PayrollException[];
}

export interface PayrollRunStore {
  runs: PayrollRun[];
  currentRun?: PayrollRun;
  exceptions: ExceptionBucket;
  loading: boolean;
  
  // Actions
  loadRuns: (period?: string) => Promise<void>;
  createRun: (period: string) => Promise<void>;
  simulateRun: (id: string) => Promise<void>;
  validateRun: (id: string) => Promise<void>;
  approveRun: (id: string) => Promise<void>;
  lockRun: (id: string) => Promise<void>;
  loadExceptions: (runId: string) => Promise<void>;
  clearExceptions: () => void;
}

export const usePayrollRunStore = create<PayrollRunStore>((set, get) => ({
  runs: [],
  exceptions: {
    missingPan: [],
    invalidBank: [],
    negativeNet: [],
    validationErrors: []
  },
  loading: false,

  loadRuns: async (period) => {
    set({ loading: true });
    try {
      const response = await PayrollService.listRuns(period);
      if (response.success) {
        set({ runs: response.data });
      }
    } catch (error) {
      console.error('Failed to load payroll runs:', error);
    } finally {
      set({ loading: false });
    }
  },

  createRun: async (period) => {
    set({ loading: true });
    try {
      const response = await PayrollService.createRun(period);
      if (response.success) {
        set({ currentRun: response.data });
        get().loadRuns();
      }
    } catch (error) {
      console.error('Failed to create payroll run:', error);
    } finally {
      set({ loading: false });
    }
  },

  simulateRun: async (id) => {
    set({ loading: true });
    try {
      const response = await PayrollService.simulate(id);
      if (response.success) {
        set({ currentRun: response.data });
        get().loadRuns();
      }
    } catch (error) {
      console.error('Failed to simulate payroll run:', error);
    } finally {
      set({ loading: false });
    }
  },

  validateRun: async (id) => {
    set({ loading: true });
    try {
      const response = await PayrollService.validate(id);
      if (response.success) {
        set({ currentRun: response.data });
        get().loadExceptions(id);
        get().loadRuns();
      }
    } catch (error) {
      console.error('Failed to validate payroll run:', error);
    } finally {
      set({ loading: false });
    }
  },

  approveRun: async (id) => {
    set({ loading: true });
    try {
      const response = await PayrollService.approve(id);
      if (response.success) {
        set({ currentRun: response.data });
        get().loadRuns();
      }
    } catch (error) {
      console.error('Failed to approve payroll run:', error);
    } finally {
      set({ loading: false });
    }
  },

  lockRun: async (id) => {
    set({ loading: true });
    try {
      const response = await PayrollService.lockRun(id);
      if (response.success) {
        set({ currentRun: response.data });
        get().loadRuns();
      }
    } catch (error) {
      console.error('Failed to lock payroll run:', error);
    } finally {
      set({ loading: false });
    }
  },

  loadExceptions: async (runId) => {
    try {
      const response = await PayrollService.getExceptions(runId);
      if (response.success) {
        const exceptions = response.data.reduce((acc: ExceptionBucket, exception: PayrollException) => {
          switch (exception.type) {
            case 'MISSING_PAN':
              acc.missingPan.push(exception);
              break;
            case 'INVALID_BANK':
              acc.invalidBank.push(exception);
              break;
            case 'NEGATIVE_NET':
              acc.negativeNet.push(exception);
              break;
            default:
              acc.validationErrors.push(exception);
          }
          return acc;
        }, { missingPan: [], invalidBank: [], negativeNet: [], validationErrors: [] });
        
        set({ exceptions });
      }
    } catch (error) {
      console.error('Failed to load exceptions:', error);
    }
  },

  clearExceptions: () => {
    set({
      exceptions: {
        missingPan: [],
        invalidBank: [],
        negativeNet: [],
        validationErrors: []
      }
    });
  }
}));