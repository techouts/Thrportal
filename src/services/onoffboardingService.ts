import { ApiResponse } from '@/types/attendance';
import type { 
  OnboardingEmployee, 
  OffboardingEmployee, 
  OffboardingChecklist, 
  OffboardingTask,
  ExitInterview,
  OffboardingDocument,
  OffboardingApproval
} from '@/types/onoffboarding';

class OnOffboardingServiceClass {
  
  // Offboarding methods
  async getOffboardingEmployees(): Promise<ApiResponse<OffboardingEmployee[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockData: OffboardingEmployee[] = [
      {
        id: '1',
        employeeId: 'EMP001',
        employeeName: 'John Doe',
        department: 'Engineering',
        lastWorkingDay: '2024-02-15',
        status: 'in_progress',
        completionPercentage: 65
      },
      {
        id: '2',
        employeeId: 'EMP002',
        employeeName: 'Jane Smith',
        department: 'Marketing',
        lastWorkingDay: '2024-02-20',
        status: 'pending_approval',
        completionPercentage: 20
      }
    ];
    
    return { 
      data: mockData, 
      success: true, 
      message: 'Success', 
      timestamp: new Date().toISOString() 
    };
  }

  async getOffboardingStats(): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      data: { 
        totalResignations: 5, 
        pendingApprovals: 2, 
        exitInterviewsCompleted: 80, 
        assetRecoveryPending: 3, 
        fnfSettlementPending: 1 
      }, 
      success: true, 
      message: 'Success', 
      timestamp: new Date().toISOString() 
    };
  }

  async getOffboardingChecklists(): Promise<ApiResponse<OffboardingChecklist[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockData: OffboardingChecklist[] = [
      {
        id: '1',
        employeeId: 'EMP001',
        employeeName: 'John Doe',
        department: 'Engineering',
        status: 'in_progress',
        completedTasks: 6,
        totalTasks: 10,
        lastWorkingDay: '2024-02-15',
        priority: 'high',
        assignedTo: 'HR Team',
        dueDate: '2024-02-10'
      }
    ];
    
    return { 
      data: mockData, 
      success: true, 
      message: 'Success', 
      timestamp: new Date().toISOString() 
    };
  }

  async getOffboardingTasks(): Promise<ApiResponse<OffboardingTask[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockData: OffboardingTask[] = [
      {
        id: '1',
        title: 'Asset Return',
        description: 'Return laptop and access cards',
        employeeId: 'EMP001',
        employeeName: 'John Doe',
        status: 'pending',
        priority: 'high',
        assignedTo: 'IT Team',
        dueDate: '2024-02-10'
      }
    ];
    
    return { 
      data: mockData, 
      success: true, 
      message: 'Success', 
      timestamp: new Date().toISOString() 
    };
  }

  async getExitInterviews(): Promise<ApiResponse<ExitInterview[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockData: ExitInterview[] = [
      {
        id: '1',
        employeeId: 'EMP001',
        employeeName: 'John Doe',
        department: 'Engineering',
        status: 'scheduled',
        scheduledDate: '2024-02-12',
        lastWorkingDay: '2024-02-15',
        interviewer: 'HR Manager',
        overallRating: 4,
        feedback: 'Great experience overall'
      }
    ];
    
    return { 
      data: mockData, 
      success: true, 
      message: 'Success', 
      timestamp: new Date().toISOString() 
    };
  }

  async getOffboardingDocuments(): Promise<ApiResponse<OffboardingDocument[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockData: OffboardingDocument[] = [
      {
        id: '1',
        employeeId: 'EMP001',
        employeeName: 'John Doe',
        department: 'Engineering',
        type: 'relieving_letter',
        status: 'generated',
        generatedDate: '2024-02-08',
        lastWorkingDay: '2024-02-15'
      }
    ];
    
    return { 
      data: mockData, 
      success: true, 
      message: 'Success', 
      timestamp: new Date().toISOString() 
    };
  }

  async getOffboardingApprovals(): Promise<ApiResponse<OffboardingApproval[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockData: OffboardingApproval[] = [
      {
        id: '1',
        employeeId: 'EMP001',
        employeeName: 'John Doe',
        department: 'Engineering',
        status: 'pending',
        submittedDate: '2024-02-01',
        lastWorkingDay: '2024-02-15',
        currentStep: 'hr',
        currentApprover: 'HR Manager',
        comments: 'Pending document submission',
        approvalSteps: [
          { step: 'manager', status: 'approved', approver: 'Team Lead', date: '2024-02-02' },
          { step: 'hr', status: 'pending' },
          { step: 'finance', status: 'pending' },
          { step: 'it', status: 'pending' }
        ]
      }
    ];
    
    return { 
      data: mockData, 
      success: true, 
      message: 'Success', 
      timestamp: new Date().toISOString() 
    };
  }

  // Onboarding methods (placeholders)
  async getOnboardingEmployees(): Promise<ApiResponse<OnboardingEmployee[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      data: [], 
      success: true, 
      message: 'Success', 
      timestamp: new Date().toISOString() 
    };
  }

  async getOnboardingStats(): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      data: { 
        pendingOnboarding: 3, 
        completedOnboarding: 15, 
        inProgressOnboarding: 7 
      }, 
      success: true, 
      message: 'Success', 
      timestamp: new Date().toISOString() 
    };
  }
}

export const OnOffboardingService = new OnOffboardingServiceClass();