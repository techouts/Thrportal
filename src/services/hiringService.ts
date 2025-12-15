import type { 
  JobDescription, 
  Submission, 
  Client, 
  Recruiter, 
  BenchResource, 
  InternalJob, 
  DashboardStats,
  TATMetrics,
  AgingBucket,
  HiringFilters
} from '@/types/hiring'

// Mock data generators
const generateMockJDs = (): JobDescription[] => {
  const clients = ['TechCorp Inc', 'DataSoft', 'CloudWorks', 'InnovateLab', 'ScaleTech']
  const skills = ['React Developer', 'Java Backend', 'DevOps Engineer', 'Data Scientist', 'Product Manager']
  const recruiters = ['Sarah Johnson', 'Mike Chen', 'Emily Davis', 'David Wilson', 'Lisa Anderson']
  
  return Array.from({ length: 25 }, (_, i) => ({
    id: `jd-${i + 1}`,
    title: skills[i % skills.length],
    client: clients[i % clients.length],
    priority: ['urgent', 'normal', 'bulk'][Math.floor(Math.random() * 3)] as any,
    status: ['submitted', 'interviewed', 'offered', 'joined', 'rejected'][Math.floor(Math.random() * 5)] as any,
    assignedRecruiter: recruiters[i % recruiters.length],
    submittedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdDate: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000).toISOString(),
    skill: skills[i % skills.length],
    location: ['Bangalore', 'Mumbai', 'Pune', 'Hyderabad', 'Chennai'][Math.floor(Math.random() * 5)],
    experience: ['2-4 years', '4-6 years', '6-8 years', '8+ years'][Math.floor(Math.random() * 4)],
    submissions: Math.floor(Math.random() * 15) + 1,
    interviews: Math.floor(Math.random() * 8) + 1,
    offers: Math.floor(Math.random() * 3) + 1,
    joined: Math.floor(Math.random() * 2),
    reopenCount: Math.floor(Math.random() * 3),
    lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    escalated: Math.random() > 0.8,
    slaBreached: Math.random() > 0.7
  }))
}

const generateMockSubmissions = (): Submission[] => {
  const candidateNames = ['John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Johnson', 'Charlie Brown']
  const recruiters = ['Sarah Johnson', 'Mike Chen', 'Emily Davis']
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: `sub-${i + 1}`,
    jdId: `jd-${Math.floor(Math.random() * 25) + 1}`,
    candidateName: candidateNames[i % candidateNames.length],
    recruiter: recruiters[i % recruiters.length],
    submittedDate: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: ['submitted', 'shortlisted', 'interviewed', 'offered', 'joined', 'rejected'][Math.floor(Math.random() * 6)] as any,
    feedbackReceived: Math.random() > 0.4,
    feedbackDate: Math.random() > 0.6 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    rejectionReason: Math.random() > 0.7 ? ['Skills mismatch', 'Experience gap', 'Salary expectations', 'Communication'][Math.floor(Math.random() * 4)] : undefined,
    stage: ['screening', 'technical', 'hr', 'client', 'offer'][Math.floor(Math.random() * 5)] as any
  }))
}

// Service class
export class HiringService {
  private static instance: HiringService
  private mockJDs: JobDescription[] = generateMockJDs()
  private mockSubmissions: Submission[] = generateMockSubmissions()

  static getInstance(): HiringService {
    if (!HiringService.instance) {
      HiringService.instance = new HiringService()
    }
    return HiringService.instance
  }

  async getDashboardStats(filters?: HiringFilters): Promise<DashboardStats> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      totalJDs: this.mockJDs.length,
      activeJDs: this.mockJDs.filter(jd => jd.status !== 'joined').length,
      todaySubmissions: Math.floor(Math.random() * 10) + 5,
      weeklySubmissions: Math.floor(Math.random() * 50) + 25,
      avgTAT: 12.5,
      slaBreaches: 8,
      pendingFeedbacks: 15,
      benchCount: 24
    }
  }

  async getJobDescriptions(filters?: HiringFilters): Promise<JobDescription[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let filtered = [...this.mockJDs]
    
    if (filters?.client) {
      filtered = filtered.filter(jd => jd.client.includes(filters.client!))
    }
    if (filters?.recruiter) {
      filtered = filtered.filter(jd => jd.assignedRecruiter.includes(filters.recruiter!))
    }
    if (filters?.status) {
      filtered = filtered.filter(jd => jd.status === filters.status)
    }
    
    return filtered
  }

  async getSubmissions(filters?: HiringFilters): Promise<Submission[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...this.mockSubmissions]
  }

  async getClients(): Promise<Client[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const clientNames = ['TechCorp Inc', 'DataSoft', 'CloudWorks', 'InnovateLab', 'ScaleTech']
    
    return clientNames.map(name => ({
      id: name.toLowerCase().replace(/\s/g, '-'),
      name,
      jdCount: this.mockJDs.filter(jd => jd.client === name).length,
      activeJDs: this.mockJDs.filter(jd => jd.client === name && jd.status !== 'joined').length,
      avgFeedbackTime: Math.floor(Math.random() * 5) + 2,
      delayedFeedbacks: Math.floor(Math.random() * 8) + 1,
      totalSubmissions: Math.floor(Math.random() * 30) + 10,
      conversions: Math.floor(Math.random() * 8) + 2
    }))
  }

  async getRecruiters(): Promise<Recruiter[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const recruiterNames = ['Sarah Johnson', 'Mike Chen', 'Emily Davis', 'David Wilson', 'Lisa Anderson']
    
    return recruiterNames.map(name => ({
      id: name.toLowerCase().replace(/\s/g, '-'),
      name,
      assignedJDs: this.mockJDs.filter(jd => jd.assignedRecruiter === name).length,
      weeklySubmissions: Math.floor(Math.random() * 15) + 5,
      idleDays: Math.floor(Math.random() * 7),
      loadIndex: Math.floor(Math.random() * 40) + 60,
      offerConversion: Math.floor(Math.random() * 30) + 15,
      avgTAT: Math.floor(Math.random() * 8) + 8
    }))
  }

  async getBenchResources(): Promise<BenchResource[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const skills = ['React', 'Java', 'Python', 'DevOps', 'Data Science']
    const businessUnits = ['Technology', 'Digital', 'Analytics', 'Cloud']
    const cities = ['Bangalore', 'Mumbai', 'Pune', 'Hyderabad']
    
    return Array.from({ length: 24 }, (_, i) => ({
      id: `bench-${i + 1}`,
      name: `Resource ${i + 1}`,
      skill: skills[i % skills.length],
      businessUnit: businessUnits[i % businessUnits.length],
      city: cities[i % cities.length],
      experience: `${Math.floor(Math.random() * 8) + 2} years`,
      rollOffDate: Math.random() > 0.7 ? new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      shadowAssigned: Math.random() > 0.6,
      availabilityDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: ['available', 'shadow', 'rolling-off'][Math.floor(Math.random() * 3)] as any
    }))
  }

  async getAgingBuckets(): Promise<AgingBucket[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return [
      { range: '<7 days', count: 8, percentage: 32 },
      { range: '7-15 days', count: 6, percentage: 24 },
      { range: '15-30 days', count: 7, percentage: 28 },
      { range: '>30 days', count: 4, percentage: 16 }
    ]
  }

  async getTATMetrics(): Promise<TATMetrics> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      jdToSubmission: 5.2,
      submissionToInterview: 3.8,
      interviewToFeedback: 4.5,
      offerToJoining: 12.3,
      clientAvgTAT: {
        'TechCorp Inc': 8.2,
        'DataSoft': 6.5,
        'CloudWorks': 9.1,
        'InnovateLab': 7.8,
        'ScaleTech': 10.2
      },
      recruiterAvgTAT: {
        'Sarah Johnson': 7.5,
        'Mike Chen': 8.9,
        'Emily Davis': 6.8,
        'David Wilson': 9.2,
        'Lisa Anderson': 7.1
      }
    }
  }

  async exportData(type: 'csv' | 'excel' | 'pdf', data: any[]): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return `export-${Date.now()}.${type === 'excel' ? 'xlsx' : type}`
  }
}

export const hiringService = HiringService.getInstance()