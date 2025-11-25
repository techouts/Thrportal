// Applications Module Types

export interface JD {
  id: string
  title: string
  client: string
  priority: 'Urgent' | 'Standard' | 'Bulk'
  location?: string
  skills: string[]
  minExp?: number
  maxExp?: number
  createdAt: string
  assignedRecruiterId?: string
  status: 'Draft' | 'Approved' | 'Published' | 'Closed'
  headcount: number
  headcountFilled: number
  compensationMin?: number
  compensationMax?: number
  currency: string
  workType: 'Full-time' | 'Contract' | 'Part-time'
  seniority: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Principal'
  primaryRecruiter?: string
  collaborators: string[]
  slaHealth: 'Green' | 'Amber' | 'Red'
}

export interface Resume {
  id: string
  candidateName: string
  email?: string
  phone?: string
  location?: string
  totalExp?: number
  skills: string[]
  education?: string[]
  companies?: {
    name: string
    from?: string
    to?: string
  }[]
  source: 'Internal' | 'Referral' | 'Vendor'
  vendorName?: string
  rawFileUrl: string
  parsedJson: object
  parsedAt?: string
  parseConfidence?: number
  owner?: string
  consent: boolean
  activelyLooking: boolean
  activelyLookingExpiresAt?: string
  lastContactedAt?: string
  currentCTC?: number
  expectedCTC?: number
  noticePeriod?: number
  availability?: string
}

export interface Application {
  id: string
  jdId: string
  candidateId: string
  submittedBy: string
  primaryRecruiter: string
  submittedAt: string
  stage: 'Submitted' | 'Shortlisted' | 'Interview' | 'Offer' | 'Client' | 'HR' | 'Joined' | 'Rejected'
  status?: 'New' | 'Shortlisted' | 'Rejected' | 'Interview Scheduled'
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected'
  round?: string
  statusReason?: string
  notes?: string
  slaStatus: 'Green' | 'Amber' | 'Red'
  lastUpdatedAt: string
  createdViaMapping?: boolean
}

export interface Submission extends Application {
  resumeId: string
  status: 'New' | 'Shortlisted' | 'Rejected' | 'Interview Scheduled'
  match: {
    score: number
    matched: string[]
    missing: string[]
    extra: string[]
    dims?: {
      skills: number
      exp: number
      edu: number
    }
  }
  tat: {
    jdToFirstSubmissionHrs?: number
    submissionToFeedbackHrs?: number
  }
  candidateName?: string
  candidateEmail?: string
  jdTitle?: string
  jdClient?: string
}

export interface ApplicationsFilters {
  client?: string
  jdTitle?: string
  recruiter?: string
  source?: string
  vendor?: string
  dateRange?: {
    start: string
    end: string
  }
  matchRange?: {
    min: number
    max: number
  }
  status?: string
}

export interface MatchFilters {
  jdId?: string
  expMin?: number
  expMax?: number
  location?: string
  source?: string
  searchIn?: string
  limit?: number
}

export interface ApplicationsMetrics {
  totalApplications: number
  avgMatch: number
  coverage: number
}

export interface RecruiterStats {
  recruiter: string
  submissions: number
  shortlisted: number
  avgMatch: number
  avgTATJdToFirst: number
  avgTATSubToFeedback: number
}

export interface VendorStats {
  vendor: string
  submissions: number
  shortlistPercent: number
  avgMatch: number
  duplicates: number
}

export interface UploadConfig {
  jdId: string
  source: 'Internal' | 'Referral' | 'Vendor'
  vendorName?: string
}

// Mapping Types
export interface MappingCandidate {
  id: string
  name: string
  email: string
  phone?: string
  location?: string
  totalExp: number
  skills: string[]
  owner: string
  existingApplicationsCount: number
  highestCurrentStage?: string
  consent: boolean
  activelyLooking: boolean
  lastContactedAt?: string
  currentCTC?: number
  expectedCTC?: number
  matchScore?: number
}

export interface MappingJD {
  id: string
  title: string
  client: string
  location?: string
  skills: string[]
  seniority: string
  compensationMin?: number
  compensationMax?: number
  currency: string
  workType: string
  status: string
  headcountLeft: number
  slaHealth: 'Green' | 'Amber' | 'Red'
  primaryRecruiter: string
  collaborators: string[]
  matchScore?: number
}

export interface MatchScore {
  total: number
  breakdown: {
    skills: number
    location: number
    seniority: number
    compensation: number
    availability: number
  }
}

export interface ConflictFlag {
  type: 'deep-stage' | 'compensation' | 'consent'
  severity: 'blocking' | 'warning' | 'info'
  message: string
  details?: any
}

export interface MappingResult {
  candidateId: string
  jdId: string
  matchScore: MatchScore
  conflicts: ConflictFlag[]
  nextBestAction: string
}

export interface MappingApprovalRequest {
  id: string
  requestedBy: string
  requestedAt: string
  type: 'jd-to-candidate' | 'candidate-to-jd'
  candidateId: string
  jdId: string
  matchScore: number
  conflicts: ConflictFlag[]
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: string
  comments?: string
}

export interface InterestCheckTemplate {
  id: string
  name: string
  subject: string
  body: string
  channel: 'email' | 'whatsapp'
  mergeFields: string[]
}

export interface MappingSettings {
  matching: {
    weights: {
      skills: number
      location: number
      seniority: number
      compensation: number
      availability: number
    }
    minimumThreshold: number
  }
  conflicts: {
    clientBlacklist: boolean
    deepStagePolicy: 'require-approval' | 'allow' | 'block'
  }
  approvals: {
    autoApprove: boolean
    requireManagerApproval: boolean
  }
  consent: {
    requiredBeforeSubmit: boolean
    allowPendingOutreach: boolean
    activelyLookingExpiryDays: number
    reminderDaysBefore: number
  }
  sla: {
    managerApprovalHours: number
    recruiterOutreachHours: number
    alertHoursBefore: number
  }
}

export interface MappingFilters {
  skills?: string[]
  location?: string
  seniority?: string
  compensationRange?: {
    min: number
    max: number
    currency: string
  }
  client?: string
  workType?: string
  approvalStatus?: string
  consentStatus?: 'yes' | 'no' | 'pending'
  activelyLooking?: boolean
  experience?: {
    min: number
    max: number
  }
  availability?: string
  matchScoreRange?: {
    min: number
    max: number
  }
}

export interface MappingOutcomesReport {
  period: {
    start: string
    end: string
  }
  initiator: string
  jdId: string
  candidateId: string
  matchScore: number
  hasDeepStageWarning: boolean
  hasCompensationWarning: boolean
  hasConsentPending: boolean
  approved: boolean
  applicationCreated: boolean
  daysToOutreach?: number
  daysToSubmission?: number
}