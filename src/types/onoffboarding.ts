// Onboarding Pipeline Types
export interface OnboardingCandidate {
  id: string;
  candidateId: string;
  candidateName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hiringManager: string;
  joiningDate: string;
  actualJoiningDate?: string;
  stage: 'offer' | 'pre_onboarding' | 'bgv' | 'day_1' | 'post_joining' | 'completed' | 'dropout';
  status: 'pending' | 'in_progress' | 'completed' | 'dropped_out';
  completionPercentage: number;
  assignedTo: string;
  dropoutReason?: 'better_offer' | 'compensation' | 'relocation' | 'bgv_fail' | 'candidate_declined' | 'no_show' | 'other';
  dropoutComments?: string;
  dropoutDate?: string;
  bgvStatus?: 'not_started' | 'initiated' | 'in_progress' | 'verified' | 'failed';
  documentsUploaded: number;
  totalDocuments: number;
  complianceChecks: {
    pan: boolean;
    aadhaar: boolean;
    pfUan: boolean;
    esic: boolean;
    posh: boolean;
    dpdp: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingEmployee {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  joiningDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  completionPercentage: number;
  assignedTo: string;
}

export interface OffboardingEmployee {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  lastWorkingDay: string;
  status: 'pending_approval' | 'approved' | 'in_progress' | 'completed';
  completionPercentage: number;
}

// BGV Types
export interface BGVCase {
  id: string;
  candidateId: string;
  candidateName: string;
  email: string;
  position: string;
  department: string;
  status: 'initiated' | 'in_progress' | 'verified' | 'failed' | 'inconclusive';
  vendor: string;
  package: string;
  initiatedDate: string;
  completedDate?: string;
  tat: number; // in days
  cost: number;
  checks: {
    identity: 'pending' | 'clear' | 'adverse';
    education: 'pending' | 'clear' | 'adverse';
    employment: 'pending' | 'clear' | 'adverse';
    criminal: 'pending' | 'clear' | 'adverse';
    reference: 'pending' | 'clear' | 'adverse';
    address: 'pending' | 'clear' | 'adverse';
  };
  overallResult: 'clear' | 'adverse' | 'inconclusive' | 'pending';
  comments?: string;
  escalated: boolean;
}

// Document Types
export interface OnboardingDocument {
  id: string;
  candidateId: string;
  type: 'pan' | 'aadhaar' | 'bank_details' | 'pf_uan' | 'esic' | 'education' | 'experience' | 'photo' | 'other';
  name: string;
  fileName: string;
  uploadedDate: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedDate?: string;
  comments?: string;
  mandatory: boolean;
  expiryDate?: string;
}

// Task Types
export interface OnboardingTask {
  id: string;
  candidateId?: string;
  employeeId?: string;
  title: string;
  description: string;
  type: 'employee' | 'hr' | 'manager' | 'it' | 'finance';
  assignedTo: string;
  assignedRole: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  completedDate?: string;
  slaHours: number;
  category: 'documents' | 'forms' | 'training' | 'assets' | 'access' | 'other';
}

// Checklist Types
export interface OnboardingChecklist {
  id: string;
  candidateId: string;
  templateId: string;
  templateName: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedTasks: number;
  totalTasks: number;
  dueDate: string;
  createdDate: string;
  completedDate?: string;
}

// Approval Types
export interface OnboardingApproval {
  id: string;
  candidateId: string;
  candidateName: string;
  type: 'pre_joining' | 'day_1' | 'probation' | 'confirmation';
  status: 'pending' | 'approved' | 'rejected';
  currentStep: 'manager' | 'hr' | 'finance' | 'it';
  currentApprover: string;
  submittedDate: string;
  dueDate: string;
  comments?: string;
  approvalSteps: Array<{
    step: string;
    status: 'pending' | 'approved' | 'rejected';
    approver?: string;
    date?: string;
    comments?: string;
  }>;
}

export interface OffboardingChecklist {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedTasks: number;
  totalTasks: number;
  lastWorkingDay: string;
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  dueDate: string;
}

export interface OffboardingTask {
  id: string;
  title: string;
  description: string;
  employeeId: string;
  employeeName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  dueDate: string;
}

export interface ExitInterview {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  scheduledDate?: string;
  lastWorkingDay: string;
  interviewer: string;
  overallRating?: number;
  feedback?: string;
}

export interface OffboardingDocument {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: 'relieving_letter' | 'experience_certificate' | 'fnf_statement';
  status: 'pending' | 'generated' | 'signed' | 'expired';
  generatedDate?: string;
  signedDate?: string;
  lastWorkingDay: string;
}

export interface OffboardingApproval {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  lastWorkingDay: string;
  currentStep: 'manager' | 'hr' | 'finance' | 'it';
  currentApprover: string;
  comments?: string;
  approvalSteps: Array<{
    step: string;
    status: 'pending' | 'approved' | 'rejected';
    approver?: string;
    date?: string;
  }>;
}

// Settings Types
export interface ChecklistTemplate {
  id: string;
  name: string;
  type: 'onboarding' | 'offboarding';
  department?: string;
  role?: string;
  location?: string;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    assignedRole: string;
    category: string;
    mandatory: boolean;
    slaHours: number;
    dependencies?: string[];
  }>;
  isActive: boolean;
  createdBy: string;
  createdDate: string;
  updatedDate: string;
}

export interface ApproverMatrix {
  id: string;
  type: 'onboarding' | 'offboarding';
  department?: string;
  role?: string;
  steps: Array<{
    step: number;
    role: string;
    approverRole: string;
    slaHours: number;
    escalationRole?: string;
    mandatory: boolean;
  }>;
  isActive: boolean;
}

export interface ComplianceConfig {
  id: string;
  name: string;
  type: 'document_retention' | 'validation_rule' | 'mandatory_training';
  description: string;
  config: {
    retentionYears?: number;
    validationRegex?: string;
    trainingIds?: string[];
    reminderDays?: number[];
  };
  isActive: boolean;
}

// Dashboard Stats
export interface OnboardingStats {
  totalCandidates: number;
  pendingOnboarding: number;
  completedOnboarding: number;
  inProgressOnboarding: number;
  droppedOut: number;
  bgvPending: number;
  bgvFailed: number;
  slaBreaches: number;
  avgCompletionDays: number;
  dropoutRate: number;
  dropoutReasons: Record<string, number>;
  monthlyTrends: Array<{
    month: string;
    offers: number;
    joins: number;
    dropouts: number;
  }>;
}

export interface OffboardingStats {
  totalResignations: number;
  pendingApprovals: number;
  exitInterviewsCompleted: number;
  assetRecoveryPending: number;
  fnfSettlementPending: number;
  avgProcessingDays: number;
  exitReasons: Record<string, number>;
}

// Integration Types
export interface IntegrationStatus {
  system: 'hiring' | 'payroll' | 'it_assets' | 'employee_master' | 'helpdesk';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  error?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: string;
}