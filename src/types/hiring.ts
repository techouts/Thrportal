// Hiring Dashboard Types

export interface JobDescription {
  id: string
  title: string
  client: string
  priority: 'urgent' | 'normal' | 'bulk'
  status: 'submitted' | 'interviewed' | 'offered' | 'joined' | 'rejected' | 'on-hold'
  assignedRecruiter: string
  submittedDate: string
  createdDate: string
  skill: string
  location: string
  experience: string
  submissions: number
  interviews: number
  offers: number
  joined: number
  reopenCount: number
  lastActivity: string
  feedback?: string
  feedbackDate?: string
  escalated: boolean
  slaBreached: boolean
}

export interface Submission {
  id: string
  jdId: string
  candidateName: string
  recruiter: string
  submittedDate: string
  status: 'submitted' | 'shortlisted' | 'interviewed' | 'offered' | 'joined' | 'rejected'
  feedbackReceived: boolean
  feedbackDate?: string
  rejectionReason?: string
  stage: 'screening' | 'technical' | 'hr' | 'client' | 'offer'
}

export interface Client {
  id: string
  name: string
  jdCount: number
  activeJDs: number
  avgFeedbackTime: number
  delayedFeedbacks: number
  totalSubmissions: number
  conversions: number
}

export interface Recruiter {
  id: string
  name: string
  assignedJDs: number
  weeklySubmissions: number
  idleDays: number
  loadIndex: number
  offerConversion: number
  avgTAT: number
}

export interface BenchResource {
  id: string
  name: string
  skill: string
  businessUnit: string
  city: string
  experience: string
  rollOffDate?: string
  shadowAssigned: boolean
  availabilityDate: string
  status: 'available' | 'shadow' | 'rolling-off'
}

export interface InternalJob {
  id: string
  title: string
  department: string
  applicants: number
  status: 'open' | 'interviewing' | 'closed' | 'on-hold'
  postedDate: string
  closedDate?: string
  timeToClosure?: number
}

export interface HiringFilters {
  client?: string
  recruiter?: string
  jdId?: string
  skill?: string
  status?: string
  priority?: string
  dateRange?: {
    start: string
    end: string
  }
}

export interface DashboardStats {
  totalJDs: number
  activeJDs: number
  todaySubmissions: number
  weeklySubmissions: number
  avgTAT: number
  slaBreaches: number
  pendingFeedbacks: number
  benchCount: number
}

export interface TATMetrics {
  jdToSubmission: number
  submissionToInterview: number
  interviewToFeedback: number
  offerToJoining: number
  clientAvgTAT: Record<string, number>
  recruiterAvgTAT: Record<string, number>
}

export interface AgingBucket {
  range: string
  count: number
  percentage: number
}