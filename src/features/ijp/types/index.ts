export type IjpStage =
  | "SUBMITTED" | "AWAITING_MANAGER_OK" | "ELIGIBILITY_CHECK" | "INELIGIBLE"
  | "HR_SCREEN" | "HM_REVIEW" | "SHORTLISTED"
  | "INTERVIEW_R1" | "INTERVIEW_R2" | "INTERVIEW_R3"
  | "OFFER_RECOMMENDED" | "OFFER_APPROVED"
  | "SELECTED" | "NOT_SELECTED" | "WITHDRAWN" | "ON_HOLD";

export interface IjpPosting {
  id: string;
  requisitionId: string;
  title: string;
  level: string;
  bandId?: string;
  bu: string;
  dept: string;
  location: string;
  skills: string[];
  tags: string[];
  descriptionRich: string;
  visibilityStart: string;
  visibilityEnd: string;
  salaryBandVisible: boolean;
  status: "OPEN" | "CLOSED" | "EXPIRED";
  createdBy: string;
  updatedAt: string;
  matchScore?: number;
  isSaved?: boolean;
}

export interface IjpApplication {
  id: string;
  postingId: string;
  employeeId: string;
  currentManagerId?: string;
  status: IjpStage;
  aiMatchScore?: number;
  submittedAt: string;
  withdrawnAt?: string;
  eligibility: {
    tenureOk: boolean;
    notOnProbation: boolean;
    notOnPip: boolean;
    perfOk: boolean;
    messages: string[];
  };
  questionnaireAnswers: Record<string, string | number | boolean>;
  coverLetter?: string;
  attachments: Attachment[];
  timeline: ApplicationEvent[];
  interviews: IjpInterview[];
  offer?: IjpOffer;
}

export interface ApplicationEvent {
  id: string;
  at: string;
  actorId: string;
  action: string;
  from?: IjpStage;
  to?: IjpStage;
  reasonCode?: string;
  comment?: string;
}

export interface IjpInterview {
  id: string;
  applicationId: string;
  roundNo: number;
  mode: "IN_PERSON" | "REMOTE";
  startTs: string;
  endTs: string;
  location?: string;
  panelUserIds: string[];
  status: "SCHEDULED" | "DONE" | "NO_SHOW" | "RESCHEDULED";
  calendarEventId?: string;
}

export interface IjpFeedback {
  id: string;
  interviewId: string;
  reviewerId: string;
  rubric: Record<string, number>;
  recommendation: "HIRE" | "NO_HIRE" | "HOLD";
  strengths?: string;
  concerns?: string;
  notesPrivate?: string;
  notesShareable?: string;
  submittedAt: string;
  locked: boolean;
}

export interface IjpOffer {
  id: string;
  applicationId: string;
  proposedLevel: string;
  bandId?: string;
  comp: Record<string, unknown>;
  offerDocUrl?: string;
  approvedById?: string;
  candidateDecision: "PENDING" | "ACCEPTED" | "DECLINED";
  decisionTs?: string;
}

export interface Attachment {
  id: string;
  ownerType: string;
  ownerId: string;
  fileName: string;
  mime: string;
  size: number;
  url: string;
  checksum?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface IjpSettings {
  eligibility: {
    minTenureMonths: number;
    requireNotOnProbation: boolean;
    requireNotOnPip: boolean;
    minPerfRating?: number;
    maxConcurrentApps: number;
    coolingOffRejectedDays: number;
    coolingOffTransferredDays: number;
  };
  managerPolicy: {
    requireApprovalToApply: boolean;
    whenVisibleToManager: "IMMEDIATE" | "POST_SCREEN" | "POST_SELECTION";
  };
  privacy: {
    blindScreening: boolean;
    retentionDaysRejected: number;
  };
  automation: {
    aiMatchThreshold: number;
    autoDeclineBelowThreshold: boolean;
    slaScreenDays: number;
  };
  scheduling: {
    calendarIntegration: "NONE" | "OUTLOOK" | "GOOGLE";
  };
}

export interface PostingFilters {
  search?: string;
  bu?: string;
  dept?: string;
  location?: string;
  level?: string;
  skills?: string[];
  workMode?: string;
  postedRange?: string;
  recommendedOnly?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}