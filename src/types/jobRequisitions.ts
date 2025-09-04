export interface JobRequisition {
  id: string
  jdId: string
  jobTitle: string
  department: string
  businessUnit: string
  hiringManager: string
  hiringManagerId: string
  workLocation: {
    city: string
    mode: 'Onsite' | 'Remote' | 'Hybrid'
  }
  jobType: 'Full-time' | 'Contract' | 'C2H'
  isInternal: boolean
  clientName?: string
  shortSummary: string
  responsibilities: string[]
  requiredSkills: {
    mustHave: string[]
    goodToHave: string[]
  }
  experience: {
    min: number
    max: number
  }
  budget: {
    min: number
    max: number
    currency: 'INR'
    type: 'LPA' | 'Monthly'
  }
  positions: number
  priority: 'Critical' | 'High' | 'Normal'
  expectedDOJ: string
  resumeDeadline?: string
  interviewRounds: string[]
  additionalNotes?: string
  attachments: string[]
  status: 'Pending' | 'In Review' | 'Approved' | 'Rejected' | 'On Hold'
  createdDate: string
  createdBy: string
  approvals: JobApproval[]
  cvsShared: number
  offersMade: number
  comments: JobComment[]
}

export interface JobApproval {
  id: string
  approverRole: 'Manager' | 'HR' | 'Leadership'
  approverId: string
  approverName: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Sent Back'
  comment?: string
  timestamp: string
}

export interface JobComment {
  id: string
  authorId: string
  authorName: string
  content: string
  timestamp: string
  type: 'comment' | 'status_change' | 'approval'
}

export interface JobRequisitionFilters {
  jobTitle?: string
  status?: string
  department?: string
  hiringManager?: string
  priority?: string
  client?: string
  createdDate?: {
    from?: string
    to?: string
  }
}

export interface CreateJobRequisitionData {
  jobTitle: string
  department: string
  businessUnit: string
  workLocation: {
    city: string
    mode: 'Onsite' | 'Remote' | 'Hybrid'
  }
  jobType: 'Full-time' | 'Contract' | 'C2H'
  isInternal: boolean
  clientName?: string
  shortSummary: string
  responsibilities: string[]
  requiredSkills: {
    mustHave: string[]
    goodToHave: string[]
  }
  experience: {
    min: number
    max: number
  }
  budget: {
    min: number
    max: number
    currency: 'INR'
    type: 'LPA' | 'Monthly'
  }
  positions: number
  priority: 'Critical' | 'High' | 'Normal'
  expectedDOJ: string
  resumeDeadline?: string
  interviewRounds: string[]
  additionalNotes?: string
  attachments: string[]
}

export interface JDParseResult {
  confidence: number
  autoFilledFields: Partial<CreateJobRequisitionData>
  suggestions: string[]
  uncertainFields: string[]
}

export interface JobRequisitionAnalytics {
  volumeOverTime: Array<{ date: string; count: number }>
  openVsClosed: { open: number; closed: number }
  topSkills: Array<{ skill: string; count: number }>
  topDepartments: Array<{ department: string; count: number }>
  agingJDs: Array<{ id: string; title: string; daysPending: number }>
  avgTATToFirstSubmission: number
}