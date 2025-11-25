import { ApiResponse } from '../types'
import {
  Course,
  LearningPath,
  Enrollment,
  WishlistItem,
  Certificate,
  SkillProfile,
  LearningRequest,
  LearningBudget,
  LearningMetrics,
  TeamLearningDashboard,
  LearningCatalogResponse,
  LearningDashboardResponse,
  LearningRecommendation,
  EmployeeBadge,
  LearningStreak,
  SkillCategory,
  Skill
} from '../types/learning'

class LearningService {
  private static instance: LearningService

  static getInstance(): LearningService {
    if (!LearningService.instance) {
      LearningService.instance = new LearningService()
    }
    return LearningService.instance
  }

  // Employee Learning Methods
  async getDashboard(employeeId: string): Promise<ApiResponse<LearningDashboardResponse>> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const mockData: LearningDashboardResponse = {
      enrollments: [
        {
          id: '1',
          employee_id: employeeId,
          course_id: '1',
          status: 'in-progress',
          progress_percentage: 65,
          enrollment_date: '2024-01-15',
          grade: undefined,
          certificate_url: undefined,
          feedback_rating: undefined,
          feedback_comment: undefined
        },
        {
          id: '2',
          employee_id: employeeId,
          course_id: '2',
          status: 'completed',
          progress_percentage: 100,
          enrollment_date: '2024-01-01',
          completion_date: '2024-01-30',
          grade: 92,
          certificate_url: '/certificates/cert-2.pdf',
          feedback_rating: 5,
          feedback_comment: 'Excellent course content'
        }
      ],
      wishlist: [
        {
          id: '1',
          employee_id: employeeId,
          course_id: '3',
          added_date: '2024-02-01',
          priority: 'high',
          justification: 'Required for upcoming project'
        }
      ],
      certificates: [
        {
          id: '1',
          employee_id: employeeId,
          course_id: '2',
          title: 'React Advanced Patterns',
          issuer: 'TechEd Institute',
          issue_date: '2024-01-30',
          expiry_date: '2026-01-30',
          certificate_url: '/certificates/cert-2.pdf',
          verification_url: 'https://verify.teched.com/cert-2',
          credential_id: 'REACT-ADV-2024-001',
          is_verified: true,
          uploaded_by: employeeId
        }
      ],
      skill_profile: {
        employee_id: employeeId,
        skills: [
          {
            skill_id: '1',
            current_level: 'intermediate',
            target_level: 'advanced',
            last_assessed: '2024-01-15',
            certified: true
          },
          {
            skill_id: '2',
            current_level: 'beginner',
            target_level: 'intermediate',
            last_assessed: '2024-02-01',
            certified: false
          }
        ],
        last_updated: '2024-02-01'
      },
      recommendations: [
        {
          id: '1',
          employee_id: employeeId,
          course_id: '4',
          reason: 'skill-gap',
          confidence_score: 0.85,
          created_at: '2024-02-05'
        }
      ],
      badges: [
        {
          id: '1',
          employee_id: employeeId,
          badge_id: '1',
          earned_date: '2024-01-30',
          course_id: '2'
        }
      ],
      streak: {
        employee_id: employeeId,
        current_streak: 7,
        longest_streak: 15,
        last_activity_date: '2024-02-05'
      },
      metrics: {
        adoption_rate: 78,
        completion_rate: 85,
        skill_coverage_rate: 65,
        avg_learning_hours: 12.5,
        total_employees: 1,
        active_learners: 1,
        courses_completed: 3,
        certificates_earned: 2
      }
    }

    return {
      success: true,
      data: mockData,
      message: 'Learning dashboard data retrieved successfully',
      timestamp: new Date().toISOString()
    }
  }

  async getCatalog(filters?: {
    category?: string
    level?: string
    format?: string
    search?: string
    page?: number
    per_page?: number
  }): Promise<ApiResponse<LearningCatalogResponse>> {
    await new Promise(resolve => setTimeout(resolve, 600))

    const mockCourses: Course[] = [
      {
        id: '1',
        title: 'React Fundamentals',
        description: 'Learn the basics of React including components, hooks, and state management',
        category_id: 'tech-frontend',
        skill_ids: ['react', 'javascript'],
        instructor: 'Jane Smith',
        duration_hours: 20,
        format: 'online',
        level: 'beginner',
        cost: 199,
        currency: 'USD',
        rating: 4.8,
        enrollment_count: 1250,
        thumbnail_url: '/courses/react-fundamentals.jpg',
        tags: ['react', 'frontend', 'javascript'],
        prerequisites: ['Basic JavaScript knowledge'],
        learning_outcomes: [
          'Build React applications',
          'Understand component lifecycle',
          'Use hooks effectively'
        ],
        created_at: '2024-01-01',
        updated_at: '2024-01-15'
      },
      {
        id: '2',
        title: 'Advanced React Patterns',
        description: 'Master advanced React patterns including HOCs, render props, and custom hooks',
        category_id: 'tech-frontend',
        skill_ids: ['react', 'javascript'],
        instructor: 'John Doe',
        duration_hours: 35,
        format: 'online',
        level: 'advanced',
        cost: 299,
        currency: 'USD',
        rating: 4.9,
        enrollment_count: 850,
        thumbnail_url: '/courses/react-advanced.jpg',
        tags: ['react', 'advanced', 'patterns'],
        prerequisites: ['React Fundamentals', '2+ years React experience'],
        learning_outcomes: [
          'Implement advanced patterns',
          'Optimize performance',
          'Build scalable applications'
        ],
        created_at: '2024-01-01',
        updated_at: '2024-01-20'
      },
      {
        id: '3',
        title: 'Leadership Essentials',
        description: 'Develop core leadership skills including communication, delegation, and team building',
        category_id: 'leadership',
        skill_ids: ['leadership', 'communication'],
        instructor: 'Sarah Johnson',
        duration_hours: 25,
        format: 'blended',
        level: 'intermediate',
        cost: 399,
        currency: 'USD',
        rating: 4.7,
        enrollment_count: 950,
        thumbnail_url: '/courses/leadership.jpg',
        tags: ['leadership', 'management', 'soft-skills'],
        prerequisites: ['2+ years experience'],
        learning_outcomes: [
          'Lead effective teams',
          'Communicate with impact',
          'Make strategic decisions'
        ],
        created_at: '2024-01-01',
        updated_at: '2024-01-25'
      }
    ]

    const mockCategories: SkillCategory[] = [
      {
        id: 'tech-frontend',
        name: 'Frontend Development',
        type: 'technical',
        description: 'User interface and client-side development skills'
      },
      {
        id: 'tech-backend',
        name: 'Backend Development',
        type: 'technical',
        description: 'Server-side and database development skills'
      },
      {
        id: 'leadership',
        name: 'Leadership & Management',
        type: 'non-technical',
        description: 'Skills for leading teams and managing projects'
      },
      {
        id: 'communication',
        name: 'Communication',
        type: 'non-technical',
        description: 'Verbal and written communication skills'
      }
    ]

    const mockSkills: Skill[] = [
      {
        id: 'react',
        name: 'React',
        category_id: 'tech-frontend',
        level: 'intermediate',
        description: 'React JavaScript library for building user interfaces'
      },
      {
        id: 'javascript',
        name: 'JavaScript',
        category_id: 'tech-frontend',
        level: 'intermediate',
        description: 'Programming language for web development'
      },
      {
        id: 'leadership',
        name: 'Leadership',
        category_id: 'leadership',
        level: 'intermediate',
        description: 'Ability to guide and influence others'
      },
      {
        id: 'communication',
        name: 'Communication',
        category_id: 'communication',
        level: 'intermediate',
        description: 'Effective verbal and written communication'
      }
    ]

    return {
      success: true,
      data: {
        courses: mockCourses,
        categories: mockCategories,
        skills: mockSkills,
        total_count: mockCourses.length,
        page: filters?.page || 1,
        per_page: filters?.per_page || 10
      },
      message: 'Learning catalog retrieved successfully',
      timestamp: new Date().toISOString()
    }
  }

  async enrollInCourse(employeeId: string, courseId: string): Promise<ApiResponse<Enrollment>> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockEnrollment: Enrollment = {
      id: `enrollment-${Date.now()}`,
      employee_id: employeeId,
      course_id: courseId,
      status: 'enrolled',
      progress_percentage: 0,
      enrollment_date: new Date().toISOString().split('T')[0],
      grade: undefined,
      certificate_url: undefined,
      feedback_rating: undefined,
      feedback_comment: undefined
    }

    return {
      success: true,
      data: mockEnrollment,
      message: 'Successfully enrolled in course',
      timestamp: new Date().toISOString()
    }
  }

  async addToWishlist(employeeId: string, courseId: string, priority: 'low' | 'medium' | 'high', justification?: string): Promise<ApiResponse<WishlistItem>> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const mockWishlistItem: WishlistItem = {
      id: `wishlist-${Date.now()}`,
      employee_id: employeeId,
      course_id: courseId,
      added_date: new Date().toISOString().split('T')[0],
      priority,
      justification
    }

    return {
      success: true,
      data: mockWishlistItem,
      message: 'Course added to wishlist',
      timestamp: new Date().toISOString()
    }
  }

  // Manager/Team Methods
  async getTeamDashboard(managerId: string): Promise<ApiResponse<TeamLearningDashboard>> {
    await new Promise(resolve => setTimeout(resolve, 800))

    const mockData: TeamLearningDashboard = {
      team_id: 'team-1',
      team_name: 'Engineering Team Alpha',
      manager_id: managerId,
      members: [
        {
          employee_id: 'emp-1',
          name: 'Alice Johnson',
          active_courses: 2,
          completed_courses: 5,
          completion_rate: 85,
          learning_hours: 45,
          skill_gaps: 2
        },
        {
          employee_id: 'emp-2',
          name: 'Bob Smith',
          active_courses: 1,
          completed_courses: 3,
          completion_rate: 75,
          learning_hours: 32,
          skill_gaps: 3
        },
        {
          employee_id: 'emp-3',
          name: 'Carol Davis',
          active_courses: 3,
          completed_courses: 7,
          completion_rate: 92,
          learning_hours: 58,
          skill_gaps: 1
        }
      ],
      team_metrics: {
        adoption_rate: 84,
        completion_rate: 84,
        skill_coverage_rate: 72,
        avg_learning_hours: 45,
        total_employees: 3,
        active_learners: 3,
        courses_completed: 15,
        certificates_earned: 8
      },
      pending_approvals: 5,
      recommended_courses: []
    }

    return {
      success: true,
      data: mockData,
      message: 'Team learning dashboard retrieved successfully',
      timestamp: new Date().toISOString()
    }
  }

  async getPendingApprovals(managerId: string): Promise<ApiResponse<LearningRequest[]>> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockRequests: LearningRequest[] = [
      {
        id: '1',
        employee_id: 'emp-1',
        course_id: '3',
        request_type: 'budget',
        justification: 'Required for upcoming leadership role',
        cost: 399,
        requested_date: '2024-02-01',
        status: 'pending'
      },
      {
        id: '2',
        employee_id: 'emp-2',
        course_id: '4',
        request_type: 'external',
        justification: 'Industry certification needed for client project',
        cost: 599,
        requested_date: '2024-02-03',
        status: 'pending'
      }
    ]

    return {
      success: true,
      data: mockRequests,
      message: 'Pending learning requests retrieved successfully',
      timestamp: new Date().toISOString()
    }
  }

  async approveRequest(requestId: string, comments?: string): Promise<ApiResponse<LearningRequest>> {
    await new Promise(resolve => setTimeout(resolve, 500))

    return {
      success: true,
      data: {} as LearningRequest,
      message: 'Learning request approved successfully',
      timestamp: new Date().toISOString()
    }
  }

  async rejectRequest(requestId: string, reason: string): Promise<ApiResponse<LearningRequest>> {
    await new Promise(resolve => setTimeout(resolve, 500))

    return {
      success: true,
      data: {} as LearningRequest,
      message: 'Learning request rejected',
      timestamp: new Date().toISOString()
    }
  }

  // HR Methods
  async getHRAnalytics(): Promise<ApiResponse<LearningMetrics>> {
    await new Promise(resolve => setTimeout(resolve, 800))

    const mockMetrics: LearningMetrics = {
      adoption_rate: 78,
      completion_rate: 82,
      skill_coverage_rate: 68,
      avg_learning_hours: 38.5,
      total_employees: 450,
      active_learners: 351,
      courses_completed: 1247,
      certificates_earned: 892
    }

    return {
      success: true,
      data: mockMetrics,
      message: 'HR learning analytics retrieved successfully',
      timestamp: new Date().toISOString()
    }
  }

  async getBudgets(): Promise<ApiResponse<LearningBudget[]>> {
    await new Promise(resolve => setTimeout(resolve, 600))

    const mockBudgets: LearningBudget[] = [
      {
        id: '1',
        department_id: 'eng',
        budget_year: 2024,
        allocated_amount: 50000,
        spent_amount: 32500,
        remaining_amount: 17500,
        currency: 'USD'
      },
      {
        id: '2',
        department_id: 'marketing',
        budget_year: 2024,
        allocated_amount: 25000,
        spent_amount: 15000,
        remaining_amount: 10000,
        currency: 'USD'
      }
    ]

    return {
      success: true,
      data: mockBudgets,
      message: 'Learning budgets retrieved successfully',
      timestamp: new Date().toISOString()
    }
  }

  async createLearningPath(pathData: Partial<LearningPath>): Promise<ApiResponse<LearningPath>> {
    await new Promise(resolve => setTimeout(resolve, 800))

    const mockPath: LearningPath = {
      id: `path-${Date.now()}`,
      title: pathData.title || 'New Learning Path',
      description: pathData.description || '',
      courses: pathData.courses || [],
      estimated_duration_hours: pathData.estimated_duration_hours || 0,
      target_roles: pathData.target_roles || [],
      created_by: 'hr-user',
      created_at: new Date().toISOString(),
      is_mandatory: pathData.is_mandatory || false
    }

    return {
      success: true,
      data: mockPath,
      message: 'Learning path created successfully',
      timestamp: new Date().toISOString()
    }
  }
}

export const learningService = LearningService.getInstance()