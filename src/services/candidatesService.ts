import { 
  CandidateProfile, 
  CandidateExperience, 
  CandidateEducation, 
  CandidateDocument,
  CandidateCommunication,
  CandidateStatusTimeline,
  CandidateOffer,
  TalentPool,
  CandidateFilters,
  CandidateReports,
  InterviewSchedule,
  InterviewFeedback,
  CandidateStatus,
  CandidateSource
} from '@/types/candidates';

class CandidatesService {
  private static instance: CandidatesService;
  private mockCandidates: CandidateProfile[] = [];
  private mockExperience: CandidateExperience[] = [];
  private mockEducation: CandidateEducation[] = [];
  private mockDocuments: CandidateDocument[] = [];
  private mockCommunications: CandidateCommunication[] = [];
  private mockTimeline: CandidateStatusTimeline[] = [];
  private mockOffers: CandidateOffer[] = [];
  private mockPools: TalentPool[] = [];
  private mockInterviews: InterviewSchedule[] = [];

  static getInstance(): CandidatesService {
    if (!CandidatesService.instance) {
      CandidatesService.instance = new CandidatesService();
    }
    return CandidatesService.instance;
  }

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock Candidates
    this.mockCandidates = [
      {
        id: 'candidate-1',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0123',
        linkedinUrl: 'https://linkedin.com/in/johnsmith',
        location: 'San Francisco, CA',
        currentCtc: 120000,
        expectedCtc: 150000,
        noticePeriod: 30,
        status: 'Shortlisted',
        source: 'LinkedIn',
        recruiterOwner: 'Sarah Johnson',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'GraphQL'],
        experience: 5,
        lastUpdated: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-10T09:00:00Z',
        consent: true,
        gdprCompliant: true
      },
      {
        id: 'candidate-2',
        name: 'Emily Chen',
        email: 'emily.chen@email.com',
        phone: '+1-555-0124',
        location: 'New York, NY',
        currentCtc: 95000,
        expectedCtc: 120000,
        noticePeriod: 60,
        status: 'Interview Scheduled',
        source: 'Job Board',
        recruiterOwner: 'Mike Rodriguez',
        skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes'],
        experience: 3,
        lastUpdated: '2024-01-14T14:20:00Z',
        createdAt: '2024-01-08T11:15:00Z',
        consent: true,
        gdprCompliant: true
      },
      {
        id: 'candidate-3',
        name: 'David Wilson',
        email: 'david.wilson@email.com',
        phone: '+1-555-0125',
        location: 'Austin, TX',
        currentCtc: 110000,
        expectedCtc: 140000,
        noticePeriod: 30,
        status: 'Offer Extended',
        source: 'Referral',
        recruiterOwner: 'Lisa Thompson',
        skills: ['Java', 'Spring Boot', 'Microservices', 'MongoDB', 'Redis'],
        experience: 7,
        lastUpdated: '2024-01-13T16:45:00Z',
        createdAt: '2024-01-05T08:30:00Z',
        consent: true,
        gdprCompliant: true
      },
      {
        id: 'candidate-4',
        name: 'Sarah Davis',
        email: 'sarah.davis@email.com',
        phone: '+1-555-0126',
        location: 'Seattle, WA',
        currentCtc: 85000,
        expectedCtc: 110000,
        noticePeriod: 45,
        status: 'New',
        source: 'Internal Pool',
        recruiterOwner: 'John Anderson',
        skills: ['Angular', 'C#', '.NET Core', 'SQL Server', 'Azure'],
        experience: 4,
        lastUpdated: '2024-01-12T12:15:00Z',
        createdAt: '2024-01-12T12:15:00Z',
        consent: true,
        gdprCompliant: true
      },
      {
        id: 'candidate-5',
        name: 'Michael Brown',
        email: 'michael.brown@email.com',
        phone: '+1-555-0127',
        location: 'Chicago, IL',
        currentCtc: 135000,
        expectedCtc: 160000,
        noticePeriod: 30,
        status: 'Joined',
        source: 'LinkedIn',
        recruiterOwner: 'Sarah Johnson',
        skills: ['DevOps', 'Terraform', 'Jenkins', 'AWS', 'Monitoring'],
        experience: 8,
        lastUpdated: '2024-01-11T09:30:00Z',
        createdAt: '2024-01-01T10:00:00Z',
        consent: true,
        gdprCompliant: true
      }
    ];

    // Mock Experience
    this.mockExperience = [
      {
        id: 'exp-1',
        candidateId: 'candidate-1',
        company: 'TechCorp Inc.',
        designation: 'Senior Frontend Developer',
        startDate: '2021-03-01',
        isCurrent: true,
        description: 'Led frontend development for enterprise applications using React and TypeScript.',
        skills: ['React', 'TypeScript', 'Redux', 'Jest'],
        achievements: ['Improved app performance by 40%', 'Led team of 4 developers'],
        ctc: 120000
      }
    ];

    // Mock Talent Pools
    this.mockPools = [
      {
        id: 'pool-1',
        name: 'Frontend Developers - San Francisco',
        description: 'Experienced React and Angular developers in SF Bay Area',
        tags: ['React', 'Angular', 'JavaScript', 'San Francisco'],
        candidateIds: ['candidate-1', 'candidate-4'],
        createdBy: 'Sarah Johnson',
        createdAt: '2024-01-01T10:00:00Z',
        isPublic: false,
        sharedWith: ['mike.rodriguez@company.com']
      },
      {
        id: 'pool-2',
        name: 'Backend Engineers - Remote',
        description: 'Senior backend engineers open to remote work',
        tags: ['Backend', 'Remote', 'Senior', 'Node.js', 'Python'],
        candidateIds: ['candidate-2', 'candidate-3'],
        createdBy: 'Mike Rodriguez',
        createdAt: '2024-01-02T11:00:00Z',
        isPublic: true,
        sharedWith: []
      }
    ];
  }

  // Candidates
  async getCandidates(filters?: CandidateFilters): Promise<CandidateProfile[]> {
    let candidates = [...this.mockCandidates];

    if (filters) {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        candidates = candidates.filter(c => 
          c.name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.skills.some(skill => skill.toLowerCase().includes(search))
        );
      }

      if (filters.status?.length) {
        candidates = candidates.filter(c => filters.status!.includes(c.status));
      }

      if (filters.source?.length) {
        candidates = candidates.filter(c => filters.source!.includes(c.source));
      }

      if (filters.skills?.length) {
        candidates = candidates.filter(c => 
          filters.skills!.some(skill => 
            c.skills.some(candidateSkill => 
              candidateSkill.toLowerCase().includes(skill.toLowerCase())
            )
          )
        );
      }

      if (filters.location?.length) {
        candidates = candidates.filter(c => 
          filters.location!.some(loc => 
            c.location.toLowerCase().includes(loc.toLowerCase())
          )
        );
      }

      if (filters.experienceRange) {
        const { min, max } = filters.experienceRange;
        candidates = candidates.filter(c => c.experience >= min && c.experience <= max);
      }

      if (filters.ctcRange) {
        const { min, max } = filters.ctcRange;
        candidates = candidates.filter(c => 
          c.expectedCtc && c.expectedCtc >= min && c.expectedCtc <= max
        );
      }
    }

    return candidates;
  }

  async getCandidateById(id: string): Promise<CandidateProfile | null> {
    return this.mockCandidates.find(c => c.id === id) || null;
  }

  async createCandidate(candidate: Omit<CandidateProfile, 'id' | 'createdAt' | 'lastUpdated'>): Promise<CandidateProfile> {
    const newCandidate: CandidateProfile = {
      ...candidate,
      id: `candidate-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    this.mockCandidates.push(newCandidate);
    return newCandidate;
  }

  async updateCandidate(id: string, updates: Partial<CandidateProfile>): Promise<CandidateProfile | null> {
    const index = this.mockCandidates.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.mockCandidates[index] = {
      ...this.mockCandidates[index],
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    return this.mockCandidates[index];
  }

  // Experience
  async getCandidateExperience(candidateId: string): Promise<CandidateExperience[]> {
    return this.mockExperience.filter(exp => exp.candidateId === candidateId);
  }

  // Education
  async getCandidateEducation(candidateId: string): Promise<CandidateEducation[]> {
    return this.mockEducation.filter(edu => edu.candidateId === candidateId);
  }

  // Documents
  async getCandidateDocuments(candidateId: string): Promise<CandidateDocument[]> {
    return this.mockDocuments.filter(doc => doc.candidateId === candidateId);
  }

  // Communications
  async getCandidateCommunications(candidateId: string): Promise<CandidateCommunication[]> {
    return this.mockCommunications.filter(comm => comm.candidateId === candidateId);
  }

  // Timeline
  async getCandidateTimeline(candidateId: string): Promise<CandidateStatusTimeline[]> {
    return this.mockTimeline.filter(timeline => timeline.candidateId === candidateId);
  }

  // Offers
  async getCandidateOffers(candidateId: string): Promise<CandidateOffer[]> {
    return this.mockOffers.filter(offer => offer.candidateId === candidateId);
  }

  // Talent Pools
  async getTalentPools(): Promise<TalentPool[]> {
    return [...this.mockPools];
  }

  async createTalentPool(pool: Omit<TalentPool, 'id' | 'createdAt'>): Promise<TalentPool> {
    const newPool: TalentPool = {
      ...pool,
      id: `pool-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    this.mockPools.push(newPool);
    return newPool;
  }

  async addCandidateToPool(poolId: string, candidateId: string): Promise<boolean> {
    const pool = this.mockPools.find(p => p.id === poolId);
    if (!pool || pool.candidateIds.includes(candidateId)) return false;

    pool.candidateIds.push(candidateId);
    return true;
  }

  // Reports
  async getReports(): Promise<CandidateReports> {
    return {
      recruiterStats: [
        {
          recruiterId: 'rec-1',
          recruiterName: 'Sarah Johnson',
          candidatesSourced: 25,
          candidatesShortlisted: 18,
          candidatesSubmitted: 12,
          offersExtended: 8,
          candidatesJoined: 6,
          conversionRate: 24,
          avgTimeToSubmit: 5.2
        },
        {
          recruiterId: 'rec-2',
          recruiterName: 'Mike Rodriguez',
          candidatesSourced: 30,
          candidatesShortlisted: 22,
          candidatesSubmitted: 15,
          offersExtended: 10,
          candidatesJoined: 7,
          conversionRate: 23.3,
          avgTimeToSubmit: 4.8
        }
      ],
      sourceAnalytics: [
        {
          source: 'LinkedIn',
          totalCandidates: 120,
          shortlistedRate: 65,
          submissionRate: 45,
          offerRate: 25,
          joinRate: 18,
          avgQualityScore: 8.2
        },
        {
          source: 'Job Board',
          totalCandidates: 200,
          shortlistedRate: 35,
          submissionRate: 25,
          offerRate: 15,
          joinRate: 12,
          avgQualityScore: 6.8
        }
      ],
      conversionMetrics: {
        sourcedToShortlisted: 58,
        shortlistedToSubmitted: 67,
        submittedToInterview: 78,
        interviewToOffer: 65,
        offerToJoin: 82,
        overallConversion: 15.2
      },
      pipelineHealth: {
        totalCandidates: 1250,
        candidatesByStage: {
          'New': 180,
          'Shortlisted': 150,
          'Submitted': 120,
          'Interview Scheduled': 80,
          'Interview Completed': 60,
          'Offer Extended': 40,
          'Offer Accepted': 30,
          'Joined': 25,
          'Rejected': 450,
          'On Hold': 35,
          'Withdrawn': 80
        },
        avgTimeInStage: {
          'New': 2.5,
          'Shortlisted': 3.2,
          'Submitted': 5.8,
          'Interview Scheduled': 4.1,
          'Interview Completed': 2.3,
          'Offer Extended': 7.2,
          'Offer Accepted': 15.5,
          'Joined': 0,
          'Rejected': 0,
          'On Hold': 12.8,
          'Withdrawn': 0
        },
        bottlenecks: ['Submission to Interview', 'Offer to Join']
      },
      rejectionAnalysis: {
        candidateDriven: {
          total: 180,
          reasons: {
            'Better offer received': 65,
            'Counter offer accepted': 45,
            'Personal reasons': 35,
            'Role mismatch': 25,
            'Compensation': 10
          }
        },
        clientDriven: {
          total: 270,
          reasons: {
            'Skills mismatch': 85,
            'Experience level': 70,
            'Cultural fit': 45,
            'Communication': 35,
            'Availability': 25,
            'Other': 10
          }
        },
        topReasons: [
          { reason: 'Skills mismatch', count: 85, percentage: 18.9 },
          { reason: 'Experience level', count: 70, percentage: 15.6 },
          { reason: 'Better offer received', count: 65, percentage: 14.4 }
        ]
      }
    };
  }

  // Bulk operations
  async bulkUpdateStatus(candidateIds: string[], status: CandidateStatus, reason?: string): Promise<boolean> {
    candidateIds.forEach(id => {
      const candidate = this.mockCandidates.find(c => c.id === id);
      if (candidate) {
        candidate.status = status;
        candidate.lastUpdated = new Date().toISOString();
      }
    });
    return true;
  }

  async exportCandidates(format: 'csv' | 'excel', filters?: CandidateFilters): Promise<string> {
    const candidates = await this.getCandidates(filters);
    // Mock export URL
    return `https://exports.company.com/candidates-${Date.now()}.${format}`;
  }
}

export const candidatesService = CandidatesService.getInstance();