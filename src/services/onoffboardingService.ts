import { ApiResponse } from '@/types/attendance';
import type { 
  OnboardingEmployee, 
  OnboardingCandidate,
  BGVCase,
  OffboardingEmployee, 
  OffboardingChecklist, 
  OffboardingTask,
  ExitInterview,
  OffboardingDocument,
  OffboardingApproval,
  OnboardingStats,
  OffboardingStats
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

  // Onboarding methods
  async getOnboardingEmployees(): Promise<ApiResponse<OnboardingEmployee[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockData: OnboardingEmployee[] = [
      {
        id: '1',
        employeeId: 'EMP101',
        employeeName: 'Rajesh Kumar',
        department: 'Engineering',
        joiningDate: '2024-02-12',
        status: 'in_progress',
        completionPercentage: 75,
        assignedTo: 'HR Team'
      },
      {
        id: '2',
        employeeId: 'EMP102',
        employeeName: 'Priya Sharma',
        department: 'Marketing',
        joiningDate: '2024-02-08',
        status: 'completed',
        completionPercentage: 100,
        assignedTo: 'HR Team'
      },
      {
        id: '3',
        employeeId: 'EMP103',
        employeeName: 'Amit Patel',
        department: 'Sales',
        joiningDate: '2024-02-15',
        status: 'pending',
        completionPercentage: 25,
        assignedTo: 'Manager'
      }
    ];
    
    return { 
      data: mockData, 
      success: true, 
      message: 'Success', 
      timestamp: new Date().toISOString() 
    };
  }

  async getOnboardingStats(): Promise<ApiResponse<OnboardingStats>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      data: { 
        totalCandidates: 45,
        pendingOnboarding: 3, 
        completedOnboarding: 15, 
        inProgressOnboarding: 7,
        droppedOut: 5,
        bgvPending: 8,
        bgvFailed: 2,
        slaBreaches: 2,
        avgCompletionDays: 14,
        dropoutRate: 11.1,
        dropoutReasons: {
          'better_offer': 2,
          'compensation': 1,
          'bgv_fail': 1,
          'no_show': 1
        },
        monthlyTrends: [
          { month: 'Jan', offers: 15, joins: 12, dropouts: 3 },
          { month: 'Feb', offers: 18, joins: 14, dropouts: 4 },
          { month: 'Mar', offers: 12, joins: 10, dropouts: 2 }
        ]
      }, 
      success: true, 
      message: 'Success', 
      timestamp: new Date().toISOString() 
    };
  }

  // Candidate Pipeline methods
  async getOnboardingCandidates(): Promise<ApiResponse<OnboardingCandidate[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockData: OnboardingCandidate[] = [
      {
        id: '1',
        candidateId: 'CAND001',
        candidateName: 'Rajesh Kumar',
        email: 'rajesh.kumar@email.com',
        phone: '+91-9876543210',
        position: 'Senior Software Engineer',
        department: 'Engineering',
        hiringManager: 'Suresh Patel',
        joiningDate: '2024-02-15',
        stage: 'bgv',
        status: 'in_progress',
        completionPercentage: 65,
        assignedTo: 'HR Team',
        bgvStatus: 'in_progress',
        documentsUploaded: 7,
        totalDocuments: 10,
        complianceChecks: {
          pan: true,
          aadhaar: true,
          pfUan: false,
          esic: false,
          posh: true,
          dpdp: true
        },
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-02-10T15:30:00Z'
      },
      {
        id: '2',
        candidateId: 'CAND002',
        candidateName: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        phone: '+91-9876543211',
        position: 'Marketing Manager',
        department: 'Marketing',
        hiringManager: 'Amit Singh',
        joiningDate: '2024-02-08',
        actualJoiningDate: '2024-02-08',
        stage: 'completed',
        status: 'completed',
        completionPercentage: 100,
        assignedTo: 'HR Team',
        bgvStatus: 'verified',
        documentsUploaded: 10,
        totalDocuments: 10,
        complianceChecks: {
          pan: true,
          aadhaar: true,
          pfUan: true,
          esic: true,
          posh: true,
          dpdp: true
        },
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-02-08T17:00:00Z'
      },
      {
        id: '3',
        candidateId: 'CAND003',
        candidateName: 'Amit Patel',
        email: 'amit.patel@email.com',
        phone: '+91-9876543212',
        position: 'Sales Executive',
        department: 'Sales',
        hiringManager: 'Neha Gupta',
        joiningDate: '2024-02-20',
        stage: 'dropout',
        status: 'dropped_out',
        completionPercentage: 30,
        assignedTo: 'HR Team',
        dropoutReason: 'better_offer',
        dropoutComments: 'Received a better offer from competitor with 30% higher salary',
        dropoutDate: '2024-02-12',
        bgvStatus: 'not_started',
        documentsUploaded: 3,
        totalDocuments: 10,
        complianceChecks: {
          pan: true,
          aadhaar: false,
          pfUan: false,
          esic: false,
          posh: false,
          dpdp: false
        },
        createdAt: '2024-02-05T10:00:00Z',
        updatedAt: '2024-02-12T11:30:00Z'
      }
    ];
    
    return { 
      data: mockData, 
      success: true, 
      message: 'Success', 
      timestamp: new Date().toISOString() 
    };
  }

  async markCandidateDropout(
    candidateId: string, 
    reason: 'better_offer' | 'compensation' | 'relocation' | 'bgv_fail' | 'candidate_declined' | 'no_show' | 'other',
    comments?: string
  ): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate API call to mark dropout and sync with Hiring Pipeline
    console.log('Marking candidate as dropout:', { candidateId, reason, comments });
    
    return {
      data: undefined,
      success: true,
      message: 'Candidate marked as dropout and synced with Hiring Pipeline',
      timestamp: new Date().toISOString()
    };
  }

  // BGV methods
  async getBGVCases(): Promise<ApiResponse<BGVCase[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockData: BGVCase[] = [
      {
        id: '1',
        candidateId: 'CAND001',
        candidateName: 'Rajesh Kumar',
        email: 'rajesh.kumar@email.com',
        position: 'Senior Software Engineer',
        department: 'Engineering',
        status: 'in_progress',
        vendor: 'AuthBridge',
        package: 'Standard Package',
        initiatedDate: '2024-02-05',
        tat: 7,
        cost: 2500,
        checks: {
          identity: 'clear',
          education: 'clear',
          employment: 'pending',
          criminal: 'pending',
          reference: 'clear',
          address: 'clear'
        },
        overallResult: 'pending',
        escalated: false
      },
      {
        id: '2',
        candidateId: 'CAND004',
        candidateName: 'Sneha Reddy',
        email: 'sneha.reddy@email.com',
        position: 'Data Analyst',
        department: 'Analytics',
        status: 'verified',
        vendor: 'IDfy',
        package: 'Basic Package',
        initiatedDate: '2024-02-01',
        completedDate: '2024-02-06',
        tat: 5,
        cost: 1800,
        checks: {
          identity: 'clear',
          education: 'clear',
          employment: 'clear',
          criminal: 'clear',
          reference: 'clear',
          address: 'clear'
        },
        overallResult: 'clear',
        escalated: false
      },
      {
        id: '3',
        candidateId: 'CAND005',
        candidateName: 'Vikram Singh',
        email: 'vikram.singh@email.com',
        position: 'DevOps Engineer',
        department: 'Engineering',
        status: 'failed',
        vendor: 'SpringVerify',
        package: 'Comprehensive Package',
        initiatedDate: '2024-01-28',
        completedDate: '2024-02-04',
        tat: 7,
        cost: 3200,
        checks: {
          identity: 'clear',
          education: 'adverse',
          employment: 'clear',
          criminal: 'clear',
          reference: 'clear',
          address: 'clear'
        },
        overallResult: 'adverse',
        comments: 'Education verification failed - degree certificate could not be verified',
        escalated: true
      }
    ];
    
    return { 
      data: mockData, 
      success: true, 
      message: 'Success', 
      timestamp: new Date().toISOString() 
    };
  }

  async getBGVStats(): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: {
        pendingVerifications: 12,
        pendingIncrease: -8,
        avgTAT: 6.2,
        failureRate: 15,
        failedCases: 3,
        totalCases: 20,
        totalCost: 45000,
        avgCostPerCase: 2250,
        vendorPerformance: [
          {
            name: 'AuthBridge',
            casesHandled: 8,
            avgTAT: 6,
            avgCost: 2400,
            successRate: 87.5
          },
          {
            name: 'IDfy',
            casesHandled: 7,
            avgTAT: 5.5,
            avgCost: 1900,
            successRate: 85.7
          },
          {
            name: 'SpringVerify',
            casesHandled: 5,
            avgTAT: 7.2,
            avgCost: 2800,
            successRate: 80
          }
        ]
      },
      success: true,
      message: 'Success',
      timestamp: new Date().toISOString()
    };
  }
}

export const OnOffboardingService = new OnOffboardingServiceClass();