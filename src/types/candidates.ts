// Candidates Module Types

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  linkedinUrl?: string;
  location: string;
  currentCtc?: number;
  expectedCtc?: number;
  noticePeriod?: number;
  status: CandidateStatus;
  source: CandidateSource;
  recruiterOwner: string;
  skills: string[];
  experience: number;
  lastUpdated: string;
  createdAt: string;
  avatarUrl?: string;
  consent: boolean;
  gdprCompliant: boolean;
}

export type CandidateStatus = 
  | 'New' 
  | 'Shortlisted' 
  | 'Submitted' 
  | 'Interview Scheduled'
  | 'Interview Completed'
  | 'Offer Extended'
  | 'Offer Accepted'
  | 'Joined'
  | 'Rejected'
  | 'On Hold'
  | 'Withdrawn';

export type CandidateSource = 
  | 'Job Board' 
  | 'Referral' 
  | 'Internal Pool' 
  | 'LinkedIn' 
  | 'Direct Application'
  | 'Recruiter Database'
  | 'Vendor';

export interface CandidateExperience {
  id: string;
  candidateId: string;
  company: string;
  designation: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  skills: string[];
  achievements: string[];
  ctc?: number;
}

export interface CandidateEducation {
  id: string;
  candidateId: string;
  degree: string;
  field: string;
  institution: string;
  startYear: number;
  endYear?: number;
  grade?: string;
  type: 'Degree' | 'Certification' | 'Course';
}

export interface CandidateDocument {
  id: string;
  candidateId: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  size: number;
  verified: boolean;
}

export type DocumentType = 
  | 'Resume' 
  | 'Cover Letter' 
  | 'Certificate' 
  | 'Portfolio' 
  | 'ID Proof' 
  | 'Address Proof'
  | 'Salary Slip'
  | 'Offer Letter';

export interface CandidateCommunication {
  id: string;
  candidateId: string;
  type: CommunicationType;
  direction: 'Inbound' | 'Outbound';
  subject?: string;
  content: string;
  createdAt: string;
  createdBy: string;
  attachments?: string[];
  metadata?: Record<string, any>;
}

export type CommunicationType = 
  | 'Email' 
  | 'Phone Call' 
  | 'WhatsApp' 
  | 'LinkedIn Message' 
  | 'SMS'
  | 'Internal Note';

export interface CandidateStatusTimeline {
  id: string;
  candidateId: string;
  fromStatus?: CandidateStatus;
  toStatus: CandidateStatus;
  timestamp: string;
  changedBy: string;
  reason?: string;
  notes?: string;
  jdId?: string;
  automaticChange: boolean;
}

export interface CandidateOffer {
  id: string;
  candidateId: string;
  jdId: string;
  designation: string;
  ctc: number;
  location: string;
  joiningDate: string;
  status: OfferStatus;
  approvalWorkflow: OfferApproval[];
  terms: string[];
  sentAt?: string;
  respondedAt?: string;
  declineReason?: string;
  noShowDate?: string;
}

export type OfferStatus = 
  | 'Draft' 
  | 'Pending Approval' 
  | 'Approved' 
  | 'Sent' 
  | 'Accepted' 
  | 'Declined' 
  | 'Expired'
  | 'No Show';

export interface OfferApproval {
  id: string;
  offerId: string;
  approverRole: string;
  approverName: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp?: string;
  comments?: string;
}

export interface TalentPool {
  id: string;
  name: string;
  description: string;
  tags: string[];
  candidateIds: string[];
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
  sharedWith: string[];
}

export interface CandidateTag {
  id: string;
  name: string;
  category: TagCategory;
  color: string;
}

export type TagCategory = 
  | 'Skills' 
  | 'Status' 
  | 'Availability' 
  | 'Performance'
  | 'Custom';

export interface CandidateFilters {
  search?: string;
  skills?: string[];
  experienceRange?: {
    min: number;
    max: number;
  };
  ctcRange?: {
    min: number;
    max: number;
  };
  location?: string[];
  status?: CandidateStatus[];
  source?: CandidateSource[];
  recruiter?: string[];
  availability?: string[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface CandidateReports {
  recruiterStats: RecruiterCandidateStats[];
  sourceAnalytics: SourceAnalytics[];
  conversionMetrics: ConversionMetrics;
  pipelineHealth: PipelineHealth;
  rejectionAnalysis: RejectionAnalysis;
}

export interface RecruiterCandidateStats {
  recruiterId: string;
  recruiterName: string;
  candidatesSourced: number;
  candidatesShortlisted: number;
  candidatesSubmitted: number;
  offersExtended: number;
  candidatesJoined: number;
  conversionRate: number;
  avgTimeToSubmit: number;
}

export interface SourceAnalytics {
  source: CandidateSource;
  totalCandidates: number;
  shortlistedRate: number;
  submissionRate: number;
  offerRate: number;
  joinRate: number;
  avgQualityScore: number;
}

export interface ConversionMetrics {
  sourcedToShortlisted: number;
  shortlistedToSubmitted: number;
  submittedToInterview: number;
  interviewToOffer: number;
  offerToJoin: number;
  overallConversion: number;
}

export interface PipelineHealth {
  totalCandidates: number;
  candidatesByStage: Record<CandidateStatus, number>;
  avgTimeInStage: Record<CandidateStatus, number>;
  bottlenecks: string[];
}

export interface RejectionAnalysis {
  candidateDriven: {
    total: number;
    reasons: Record<string, number>;
  };
  clientDriven: {
    total: number;
    reasons: Record<string, number>;
  };
  topReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
}

export interface CandidateWorkflow {
  candidateId: string;
  jdId?: string;
  type: WorkflowType;
  status: WorkflowStatus;
  assignedTo: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  metadata: Record<string, any>;
}

export type WorkflowType = 
  | 'JD Linking' 
  | 'Submission' 
  | 'Feedback Collection'
  | 'Interview Scheduling'
  | 'Offer Generation'
  | 'SLA Reminder';

export type WorkflowStatus = 
  | 'Pending' 
  | 'In Progress' 
  | 'Completed' 
  | 'Overdue'
  | 'Cancelled';

export interface InterviewSchedule {
  id: string;
  candidateId: string;
  jdId: string;
  interviewerIds: string[];
  scheduledAt: string;
  duration: number;
  mode: 'Online' | 'Onsite' | 'Phone';
  location?: string;
  meetingLink?: string;
  notes?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  feedback?: InterviewFeedback[];
}

export interface InterviewFeedback {
  id: string;
  interviewId: string;
  interviewerId: string;
  rating: number;
  technicalSkills: number;
  communication: number;
  culturalFit: number;
  overallRecommendation: 'Strongly Reject' | 'Reject' | 'Maybe' | 'Hire' | 'Strongly Hire';
  feedback: string;
  strengths: string[];
  improvements: string[];
  submittedAt: string;
}