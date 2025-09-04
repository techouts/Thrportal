export type RatingLabel = "DME" | "BME" | "ME" | "EE";

export interface PerformanceCycleDTO {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "planned" | "active" | "locked" | "published" | "archived";
  windows: Array<{
    stage: "goal_setting" | "mid_year" | "year_end" | "mgr_review" | "calibration" | "rating_discussion" | "publish";
    openAt: string;
    dueAt: string;
    closeAt: string;
    isLocked: boolean;
  }>;
  settings: {
    ratingLabels: Record<RatingLabel, { title: string; description: string }>;
    bellCurveDefaults: Record<RatingLabel, number>; // pct
    minCohortSize: number;
    visibilityRule: "post_discussion" | "immediate";
    attachment: { maxMb: number; types: string[] };
  };
}

export type GoalType = "COMPANY" | "DEPARTMENT" | "TEAM" | "PERSONAL";

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
  status: "draft" | "submitted" | "approved";
  attachments?: Array<{ id: string; filename: string; url: string; sizeBytes: number }>;
  parentGoal?: GoalDTO;
  childGoals?: GoalDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewDTO {
  id: string;
  cycleId: string;
  empId: string;
  stage: "mid_year" | "year_end";
  status: "draft" | "submitted" | "mgr_draft" | "calibrating" | "finalized" | "published" | "acknowledged";
  items: Array<{
    goalId?: string;
    selfRating?: number;
    mgrRating?: number;
    notesSelf?: string;
    notesMgr?: string;
  }>;
  rating?: { 
    finalRating?: number; 
    calibratedRating?: number; 
    visibleToEmp: boolean;
    publishedAt?: string;
  };
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingDTO {
  id: string;
  cycleId: string;
  empId: string;
  managerId: string;
  type: "goal_setting" | "one_on_one" | "mid_year" | "year_end" | "rating_discussion";
  scheduledAt: string;
  location?: string;
  status: "scheduled" | "done";
  notes?: {
    publicNotes?: string;
    privateNotes?: string;
    actionItems?: Array<{ text: string; ownerId: string; due: string; completed?: boolean }>;
    empSigned: boolean;
    mgrSigned: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackRequestDTO {
  id: string;
  requesterId: string;
  subjectEmpId: string;
  cycleId: string;
  isAnonymous: boolean;
  respondentIds: string[];
  status: "open" | "closed";
  responses?: Array<{
    id: string;
    responderId: string;
    content: string;
    ratingHint?: number;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface PIPDTO {
  id: string;
  empId: string;
  managerId: string;
  cycleId?: string;
  status: "active" | "completed" | "cancelled";
  milestones?: Array<{ title: string; due: string; done: boolean; notes?: string }>;
  cadence?: string;
  reason?: string;
  expectedOutcome?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalibrationPoolDTO {
  id: string;
  cycleId: string;
  cohortType: "org" | "dept" | "team";
  cohortId?: string;
  cohortName: string;
  employees: Array<{
    id: string;
    name: string;
    currentRating?: number;
    proposedRating?: number;
    locked: boolean;
  }>;
  allocations: Record<RatingLabel, { targetPct: number; targetCnt: number; actualCnt: number }>;
  isLocked: boolean;
}

export interface CalibrationMoveDTO {
  id: string;
  poolId: string;
  empId: string;
  fromRating?: number;
  toRating: number;
  reason?: string;
  approvedBy?: string;
  createdAt: string;
}

// UI State Types
export interface PerformanceFilters {
  cycle?: string;
  status?: string;
  search?: string;
  goalType?: GoalType;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface CycleTimelineStage {
  stage: string;
  label: string;
  openAt: string;
  dueAt: string;
  closeAt: string;
  isLocked: boolean;
  isActive: boolean;
  isCompleted: boolean;
  completionPct?: number;
}

// Mock data helpers
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  managerId?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}