export type RatingKey = "DME" | "BME" | "ME" | "EE";
export type StageKey =
  | "goal_setting" | "mid_year" | "year_end"
  | "mgr_review" | "calibration" | "rating_discussion" | "publish";

export interface CycleWindowDTO {
  stage: StageKey;
  openAt: string; 
  dueAt: string; 
  closeAt: string;
  isLocked: boolean;
}

export interface RatingLabelDTO {
  title: string; 
  description: string;
}

export interface PerformanceSettingsDTO {
  ratingLabels: Record<RatingKey, RatingLabelDTO>;
  bellCurveDefaults: Record<RatingKey, number>; // pct
  minCohortSize: number; // default 8
  visibilityRule: "post_discussion" | "immediate";
  attachment: { maxMb: number; types: string[] };
}

export interface PerformanceCycleDTO {
  id: string; 
  name: string;
  startDate: string; 
  endDate: string;
  status: "planned"|"active"|"locked"|"published"|"archived";
  windows: CycleWindowDTO[];
  settings: PerformanceSettingsDTO;
}

export type GoalType = "COMPANY" | "DEPARTMENT" | "TEAM" | "PERSONAL";

export interface AttachmentDTO { 
  id: string; 
  filename: string; 
  url: string; 
  sizeBytes: number; 
}

export interface GoalDTO {
  id: string; 
  type: GoalType;
  title: string; 
  description?: string;
  kpi?: string; 
  target?: string; 
  unit?: string; 
  weight?: number;
  ownerEmpId?: string; 
  teamId?: string; 
  deptId?: string;
  parentGoalId?: string;
  dueDate?: string; 
  progressPct: number;
  status: "draft"|"submitted"|"approved";
  attachments?: AttachmentDTO[];
}

export interface ReviewItemDTO {
  goalId?: string;
  selfRating?: number; // 1-4
  mgrRating?: number;  // 1-4
  notesSelf?: string; 
  notesMgr?: string;
}

export interface ReviewDTO {
  id: string; 
  cycleId: string; 
  empId: string;
  stage: "mid_year"|"year_end";
  status: "draft"|"submitted"|"mgr_draft"|"calibrating"|"finalized"|"published"|"acknowledged";
  items: ReviewItemDTO[];
  rating?: {
    finalRating?: number;       // pre-calibration
    calibratedRating?: number;  // post-calibration
    visibleToEmp: boolean;
  };
  submittedAt?: string;
}

export type MeetingType = "goal_setting"|"one_on_one"|"mid_year"|"year_end"|"rating_discussion";

export interface MeetingDTO {
  id: string; 
  cycleId: string; 
  empId: string; 
  managerId: string;
  type: MeetingType; 
  scheduledAt: string; 
  location?: string;
  status: "scheduled"|"done";
  notes?: {
    publicNotes?: string;
    privateNotes?: string;
    actionItems?: Array<{ text: string; ownerId: string; due: string }>;
    empSigned: boolean; 
    mgrSigned: boolean;
  };
}

export interface FeedbackRequestDTO {
  id: string; 
  requesterId: string; 
  subjectEmpId: string; 
  cycleId: string;
  isAnonymous: boolean; 
  respondentIds: string[];
  status: "open"|"closed";
  responses?: Array<{ 
    id: string; 
    responderId: string; 
    content: string; 
    ratingHint?: number; 
    createdAt: string 
  }>;
}

export interface PIPDTO {
  id: string; 
  empId: string; 
  managerId: string; 
  cycleId?: string;
  status: "active"|"completed"|"cancelled";
  milestones?: Array<{ title: string; due: string; done: boolean }>;
  cadence?: string;
}

export interface CalibrationPoolDTO {
  id: string;
  cycleId: string;
  name: string;
  type: "org" | "department" | "team";
  cohortSize: number;
  distribution: Record<RatingKey, number>;
  employees: CalibrationEmployeeDTO[];
}

export interface CalibrationEmployeeDTO {
  empId: string;
  name: string;
  currentRating: RatingKey;
  proposedRating?: RatingKey;
  isLocked: boolean;
  exceptions?: Array<{ reason: string; approvedBy: string; approvedAt: string }>;
}

export interface CalibrationMoveDTO {
  id: string;
  poolId: string;
  empId: string;
  fromRating: RatingKey;
  toRating: RatingKey;
  reason?: string;
  movedBy: string;
  movedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class AppError extends Error {
  code: string;
  details?: any;
  
  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export interface PerformanceFilters {
  goalType?: GoalType;
  status?: string;
  search?: string;
  empId?: string;
  cycleId?: string;
}