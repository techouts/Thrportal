import type { 
  JobRequisition, 
  JobRequisitionFilters, 
  CreateJobRequisitionData,
  JDParseResult,
  JobRequisitionAnalytics
} from '@/types/jobRequisitions'

// Mock data generators
const generateMockJDs = (): JobRequisition[] => {
  const departments = ['Engineering', 'Product', 'Sales', 'Marketing', 'Operations']
  const businessUnits = ['Technology', 'Digital', 'Analytics', 'Cloud', 'AI/ML']
  const managers = ['John Smith', 'Sarah Wilson', 'Mike Johnson', 'Emily Davis', 'David Brown']
  const cities = ['Bangalore', 'Mumbai', 'Pune', 'Hyderabad', 'Chennai']
  const jobTitles = ['React Developer', 'Java Backend Engineer', 'DevOps Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'QA Engineer']
  const clients = ['TechCorp Inc', 'DataSoft', 'CloudWorks', 'InnovateLab', 'ScaleTech']
  
  return Array.from({ length: 30 }, (_, i) => ({
    id: `jd-${i + 1}`,
    jdId: `JD${String(i + 1).padStart(4, '0')}`,
    jobTitle: jobTitles[i % jobTitles.length],
    department: departments[i % departments.length],
    businessUnit: businessUnits[i % businessUnits.length],
    hiringManager: managers[i % managers.length],
    hiringManagerId: `mgr-${i % managers.length + 1}`,
    workLocation: {
      city: cities[i % cities.length],
      mode: ['Onsite', 'Remote', 'Hybrid'][Math.floor(Math.random() * 3)] as any
    },
    jobType: ['Full-time', 'Contract', 'C2H'][Math.floor(Math.random() * 3)] as any,
    isInternal: Math.random() > 0.7,
    clientName: Math.random() > 0.7 ? clients[i % clients.length] : undefined,
    shortSummary: `Looking for an experienced ${jobTitles[i % jobTitles.length]} to join our dynamic team.`,
    responsibilities: [
      'Develop and maintain software applications',
      'Collaborate with cross-functional teams',
      'Write clean, maintainable code',
      'Participate in code reviews'
    ],
    requiredSkills: {
      mustHave: ['JavaScript', 'React', 'Node.js'],
      goodToHave: ['TypeScript', 'AWS', 'Docker']
    },
    experience: {
      min: 2 + (i % 3),
      max: 5 + (i % 3)
    },
    budget: {
      min: 8 + (i % 10),
      max: 15 + (i % 10),
      currency: 'INR',
      type: 'LPA'
    },
    positions: Math.floor(Math.random() * 5) + 1,
    priority: ['Critical', 'High', 'Normal'][Math.floor(Math.random() * 3)] as any,
    expectedDOJ: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    resumeDeadline: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    interviewRounds: ['Technical Screen', 'Technical Round', 'Managerial Round'],
    additionalNotes: 'Fast-track hiring for this role.',
    attachments: [],
    status: ['Pending', 'In Review', 'Approved', 'Rejected', 'On Hold'][Math.floor(Math.random() * 5)] as any,
    createdDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: `user-${i % 5 + 1}`,
    approvals: [
      {
        id: `approval-${i}-1`,
        approverRole: 'Manager',
        approverId: 'mgr-1',
        approverName: 'John Manager',
        status: Math.random() > 0.5 ? 'Approved' : 'Pending',
        comment: 'Looks good to proceed',
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    cvsShared: Math.floor(Math.random() * 20),
    offersMade: Math.floor(Math.random() * 5),
    comments: [
      {
        id: `comment-${i}-1`,
        authorId: 'user-1',
        authorName: 'HR Admin',
        content: 'JD looks comprehensive. Ready for approval.',
        timestamp: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'comment'
      }
    ]
  }))
}

// Service class
export class JobRequisitionsService {
  private static instance: JobRequisitionsService
  private mockJDs: JobRequisition[] = generateMockJDs()

  static getInstance(): JobRequisitionsService {
    if (!JobRequisitionsService.instance) {
      JobRequisitionsService.instance = new JobRequisitionsService()
    }
    return JobRequisitionsService.instance
  }

  async getJobRequisitions(filters?: JobRequisitionFilters): Promise<JobRequisition[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let filtered = [...this.mockJDs]
    
    if (filters?.jobTitle) {
      filtered = filtered.filter(jd => 
        jd.jobTitle.toLowerCase().includes(filters.jobTitle!.toLowerCase())
      )
    }
    if (filters?.status) {
      filtered = filtered.filter(jd => jd.status === filters.status)
    }
    if (filters?.department) {
      filtered = filtered.filter(jd => jd.department === filters.department)
    }
    if (filters?.hiringManager) {
      filtered = filtered.filter(jd => 
        jd.hiringManager.toLowerCase().includes(filters.hiringManager!.toLowerCase())
      )
    }
    if (filters?.priority) {
      filtered = filtered.filter(jd => jd.priority === filters.priority)
    }
    
    return filtered
  }

  async getJobRequisition(id: string): Promise<JobRequisition | null> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return this.mockJDs.find(jd => jd.id === id) || null
  }

  async createJobRequisition(data: CreateJobRequisitionData): Promise<{ id: string }> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newJD: JobRequisition = {
      ...data,
      id: `jd-${Date.now()}`,
      jdId: `JD${String(this.mockJDs.length + 1).padStart(4, '0')}`,
      hiringManager: 'Current User',
      hiringManagerId: 'current-user',
      status: 'Pending',
      createdDate: new Date().toISOString(),
      createdBy: 'current-user',
      approvals: [],
      cvsShared: 0,
      offersMade: 0,
      comments: []
    }
    
    this.mockJDs.unshift(newJD)
    return { id: newJD.id }
  }

  async updateJobRequisition(id: string, data: Partial<CreateJobRequisitionData>): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = this.mockJDs.findIndex(jd => jd.id === id)
    if (index !== -1) {
      this.mockJDs[index] = { ...this.mockJDs[index], ...data }
      return { success: true }
    }
    return { success: false }
  }

  async cloneJobRequisition(id: string): Promise<{ id: string }> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const original = this.mockJDs.find(jd => jd.id === id)
    if (!original) throw new Error('JD not found')
    
    const cloned: JobRequisition = {
      ...original,
      id: `jd-${Date.now()}`,
      jdId: `JD${String(this.mockJDs.length + 1).padStart(4, '0')}`,
      status: 'Pending',
      createdDate: new Date().toISOString(),
      approvals: [],
      cvsShared: 0,
      offersMade: 0,
      comments: []
    }
    
    this.mockJDs.unshift(cloned)
    return { id: cloned.id }
  }

  async parseJDFile(file: File): Promise<JDParseResult> {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock AI parsing result
    return {
      confidence: 92,
      autoFilledFields: {
        jobTitle: 'Senior Software Engineer',
        department: 'Engineering',
        businessUnit: 'Technology',
        shortSummary: 'Looking for a skilled software engineer to join our team',
        requiredSkills: {
          mustHave: ['JavaScript', 'React', 'Node.js'],
          goodToHave: ['TypeScript', 'AWS']
        },
        experience: { min: 3, max: 6 },
        positions: 2,
        priority: 'High'
      },
      suggestions: [
        'Consider adding specific framework requirements',
        'Budget range could be more specific'
      ],
      uncertainFields: ['budget', 'expectedDOJ']
    }
  }

  async approveJobRequisition(id: string, comment?: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const jd = this.mockJDs.find(j => j.id === id)
    if (jd) {
      jd.status = 'Approved'
      jd.approvals.push({
        id: `approval-${Date.now()}`,
        approverRole: 'HR',
        approverId: 'current-user',
        approverName: 'Current User',
        status: 'Approved',
        comment,
        timestamp: new Date().toISOString()
      })
      return { success: true }
    }
    return { success: false }
  }

  async rejectJobRequisition(id: string, reason: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const jd = this.mockJDs.find(j => j.id === id)
    if (jd) {
      jd.status = 'Rejected'
      jd.approvals.push({
        id: `approval-${Date.now()}`,
        approverRole: 'HR',
        approverId: 'current-user',
        approverName: 'Current User',
        status: 'Rejected',
        comment: reason,
        timestamp: new Date().toISOString()
      })
      return { success: true }
    }
    return { success: false }
  }

  async getAnalytics(): Promise<JobRequisitionAnalytics> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      volumeOverTime: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10) + 2
      })),
      openVsClosed: { open: 18, closed: 12 },
      topSkills: [
        { skill: 'JavaScript', count: 15 },
        { skill: 'React', count: 12 },
        { skill: 'Python', count: 10 },
        { skill: 'Java', count: 8 },
        { skill: 'AWS', count: 6 }
      ],
      topDepartments: [
        { department: 'Engineering', count: 12 },
        { department: 'Product', count: 8 },
        { department: 'Sales', count: 5 },
        { department: 'Marketing', count: 3 },
        { department: 'Operations', count: 2 }
      ],
      agingJDs: this.mockJDs
        .filter(jd => jd.status === 'Pending')
        .map(jd => ({
          id: jd.id,
          title: jd.jobTitle,
          daysPending: Math.floor((Date.now() - new Date(jd.createdDate).getTime()) / (24 * 60 * 60 * 1000))
        }))
        .slice(0, 10),
      avgTATToFirstSubmission: 4.2
    }
  }

  async exportData(format: 'csv' | 'xlsx' | 'pdf', filters?: JobRequisitionFilters): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return `job-requisitions-export-${Date.now()}.${format === 'xlsx' ? 'xlsx' : format}`
  }
}

export const jobRequisitionsService = JobRequisitionsService.getInstance()