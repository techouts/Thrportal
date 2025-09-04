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
}

export interface Submission {
  id: string
  jdId: string
  resumeId: string
  submittedBy: string
  submittedAt: string
  status: 'New' | 'Shortlisted' | 'Rejected' | 'Interview Scheduled'
  statusReason?: string
  notes?: string
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