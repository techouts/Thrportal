// Learning & Development Module Types

export interface SkillCategory {
  id: string
  name: string
  type: 'technical' | 'non-technical'
  description?: string
}

export interface Skill {
  id: string
  name: string
  category_id: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  description?: string
}

export interface Course {
  id: string
  title: string
  description: string
  category_id: string
  skill_ids: string[]
  instructor: string
  duration_hours: number
  format: 'online' | 'classroom' | 'virtual' | 'blended'
  level: 'beginner' | 'intermediate' | 'advanced'
  cost: number
  currency: string
  rating: number
  enrollment_count: number
  thumbnail_url?: string
  tags: string[]
  prerequisites?: string[]
  learning_outcomes: string[]
  created_at: string
  updated_at: string
  is_mandatory?: boolean
  expiry_months?: number
}

export interface LearningPath {
  id: string
  title: string
  description: string
  courses: Course[]
  estimated_duration_hours: number
  target_roles: string[]
  created_by: string
  created_at: string
  is_mandatory?: boolean
}

export interface Enrollment {
  id: string
  employee_id: string
  course_id: string
  status: 'enrolled' | 'in-progress' | 'completed' | 'dropped' | 'pending-approval'
  progress_percentage: number
  enrollment_date: string
  completion_date?: string
  grade?: number
  certificate_url?: string
  feedback_rating?: number
  feedback_comment?: string
}

export interface WishlistItem {
  id: string
  employee_id: string
  course_id: string
  added_date: string
  priority: 'low' | 'medium' | 'high'
  justification?: string
}

export interface Certificate {
  id: string
  employee_id: string
  course_id?: string
  title: string
  issuer: string
  issue_date: string
  expiry_date?: string
  certificate_url: string
  verification_url?: string
  credential_id?: string
  is_verified: boolean
  uploaded_by: string
}

export interface SkillProfile {
  employee_id: string
  skills: Array<{
    skill_id: string
    current_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    target_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    last_assessed: string
    certified: boolean
  }>
  last_updated: string
}

export interface LearningRequest {
  id: string
  employee_id: string
  course_id: string
  request_type: 'enrollment' | 'budget' | 'external'
  justification: string
  cost: number
  requested_date: string
  status: 'pending' | 'approved' | 'rejected'
  approver_id?: string
  approval_date?: string
  approval_comments?: string
}

export interface LearningBudget {
  id: string
  employee_id?: string
  department_id?: string
  budget_year: number
  allocated_amount: number
  spent_amount: number
  remaining_amount: number
  currency: string
}

export interface LearningMetrics {
  adoption_rate: number
  completion_rate: number
  skill_coverage_rate: number
  avg_learning_hours: number
  total_employees: number
  active_learners: number
  courses_completed: number
  certificates_earned: number
}

export interface TeamLearningDashboard {
  team_id: string
  team_name: string
  manager_id: string
  members: Array<{
    employee_id: string
    name: string
    active_courses: number
    completed_courses: number
    completion_rate: number
    learning_hours: number
    skill_gaps: number
  }>
  team_metrics: LearningMetrics
  pending_approvals: number
  recommended_courses: Course[]
}

export interface LearningGovernance {
  mandatory_completion_days: number
  budget_approval_threshold: number
  max_concurrent_courses: number
  certification_expiry_reminder_days: number
  auto_enroll_new_hires: boolean
  gamification_enabled: boolean
  peer_review_enabled: boolean
}

export interface LearningRecommendation {
  id: string
  employee_id: string
  course_id: string
  reason: 'skill-gap' | 'role-based' | 'ai-suggested' | 'manager-recommended'
  confidence_score: number
  created_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon_url: string
  criteria: string
  points: number
}

export interface EmployeeBadge {
  id: string
  employee_id: string
  badge_id: string
  earned_date: string
  course_id?: string
}

export interface LearningStreak {
  employee_id: string
  current_streak: number
  longest_streak: number
  last_activity_date: string
}

// API Response types
export interface LearningCatalogResponse {
  courses: Course[]
  categories: SkillCategory[]
  skills: Skill[]
  total_count: number
  page: number
  per_page: number
}

export interface LearningDashboardResponse {
  enrollments: Enrollment[]
  wishlist: WishlistItem[]
  certificates: Certificate[]
  skill_profile: SkillProfile
  recommendations: LearningRecommendation[]
  badges: EmployeeBadge[]
  streak: LearningStreak
  metrics: LearningMetrics
}