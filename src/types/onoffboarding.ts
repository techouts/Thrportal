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