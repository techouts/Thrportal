import {
  JDOwnership,
  JDSubmission,
  PrimaryFollowUp,
  OwnershipRules,
  CandidateOwnership,
  ClientSpocMapping,
  RecruiterManagerMapping,
  TalentPoolOwnership,
  EscalationRule,
  OwnershipChangeLog,
  WorkloadDistribution,
  ManagerDashboard,
  ClientSlaReport,
  OrphanReport,
  OwnershipFilters,
  BulkOwnershipOperation,
  OwnershipMetrics,
  SpocDashboard,
  EscalationEvent,
  JDStatus,
  CandidateStage,
  PoolAccessLevel,
  RecruiterStatus,
  RiskLevel,
  NoSubmissionReport,
  NoSubmissionWidget
} from '@/types/ownership';
import { supabase } from '@/integrations/supabase/client';

class OwnershipService {
  private static instance: OwnershipService;
  private mockJDOwnerships: JDOwnership[] = [];
  private mockCandidateOwnerships: CandidateOwnership[] = [];
  private mockClientSpocMappings: ClientSpocMapping[] = [];
  private mockRecruiterManagerMappings: RecruiterManagerMapping[] = [];
  private mockTalentPoolOwnerships: TalentPoolOwnership[] = [];
  private mockEscalationRules: EscalationRule[] = [];
  private mockChangeLogs: OwnershipChangeLog[] = [];
  private mockEscalationEvents: EscalationEvent[] = [];

  static getInstance(): OwnershipService {
    if (!OwnershipService.instance) {
      OwnershipService.instance = new OwnershipService();
    }
    return OwnershipService.instance;
  }

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize JD Ownerships
    this.mockJDOwnerships = [
      {
        id: 'jd-own-1',
        jdId: 'jd-001',
        jdTitle: 'Senior React Developer',
        primaryRecruiter: 'Sarah Johnson',
        collaborators: ['David Chen'],
        openPoolFlag: true,
        perRecruiterSubmissionCap: 5,
        staffingManager: 'manager-1',
        clientSpoc: 'spoc-1',
        status: 'Active',
        isLocked: false,
        submissionsByRecruiter: {
          'Sarah Johnson': 8,
          'David Chen': 4
        },
        submissionsToday: 2,
        submissionsTotal: 12,
        firstSubmitAge: 48,
        slaStatus: 'On Track',
        slaDeadline: '2024-02-15T23:59:59Z',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-16T14:30:00Z',
        updatedBy: 'manager-1'
      },
      {
        id: 'jd-own-2',
        jdId: 'jd-002',
        jdTitle: 'Python Backend Engineer',
        primaryRecruiter: 'Emily Davis',
        collaborators: [],
        openPoolFlag: false,
        perRecruiterSubmissionCap: 3,
        staffingManager: 'manager-2',
        clientSpoc: 'spoc-2',
        status: 'Active',
        isLocked: true,
        submissionsByRecruiter: {
          'Emily Davis': 0
        },
        submissionsToday: 0,
        submissionsTotal: 0,
        firstSubmitAge: 0,
        slaStatus: 'No Submission',
        slaDeadline: '2024-01-28T23:59:59Z',
        createdAt: '2024-01-14T09:00:00Z',
        updatedAt: '2024-01-15T11:45:00Z',
        updatedBy: 'manager-2'
      },
      {
        id: 'jd-own-3',
        jdId: 'jd-003',
        jdTitle: 'Full Stack Developer',
        primaryRecruiter: 'John Martinez',
        collaborators: ['Sarah Johnson'],
        openPoolFlag: true,
        perRecruiterSubmissionCap: 4,
        staffingManager: 'manager-1',
        clientSpoc: 'spoc-3',
        status: 'Active',
        isLocked: false,
        submissionsByRecruiter: {
          'John Martinez': 5,
          'Sarah Johnson': 3
        },
        submissionsToday: 1,
        submissionsTotal: 8,
        firstSubmitAge: 72,
        slaStatus: 'Amber',
        slaDeadline: '2024-02-01T23:59:59Z',
        createdAt: '2024-01-12T14:30:00Z',
        updatedAt: '2024-01-28T09:15:00Z',
        updatedBy: 'hr'
      },
      {
        id: 'jd-own-4',
        jdId: 'jd-004',
        jdTitle: 'Data Scientist',
        primaryRecruiter: 'David Chen',
        collaborators: [],
        openPoolFlag: false,
        perRecruiterSubmissionCap: 2,
        staffingManager: 'manager-1',
        clientSpoc: 'spoc-1',
        status: 'Active',
        isLocked: false,
        submissionsByRecruiter: {
          'David Chen': 5
        },
        submissionsToday: 0,
        submissionsTotal: 5,
        firstSubmitAge: 96,
        slaStatus: 'Red',
        slaDeadline: '2024-01-30T23:59:59Z',
        createdAt: '2024-01-08T11:20:00Z',
        updatedAt: '2024-01-29T16:45:00Z',
        updatedBy: 'recruiter'
      }
    ];

    // Initialize Candidate Ownerships
    this.mockCandidateOwnerships = [
      {
        id: 'cand-own-1',
        candidateId: 'candidate-1',
        candidateName: 'John Smith',
        recruiterOwner: 'recruiter-1',
        jdLinks: [],
        currentStage: 'Interview',
        lastUpdated: '2024-01-16T15:30:00Z',
        assignedAt: '2024-01-10T10:00:00Z',
        assignedBy: 'manager-1'
      },
      {
        id: 'cand-own-2',
        candidateId: 'candidate-2',
        candidateName: 'Emily Chen',
        recruiterOwner: 'recruiter-2',
        jdLinks: [],
        currentStage: 'Offer',
        lastUpdated: '2024-01-15T12:20:00Z',
        assignedAt: '2024-01-08T14:00:00Z',
        assignedBy: 'manager-1'
      }
    ];

    // Initialize Client SPOC Mappings
    this.mockClientSpocMappings = [
      {
        id: 'spoc-map-1',
        clientId: 'client-1',
        clientName: 'TechCorp Inc.',
        primarySpoc: 'Alice Johnson',
        primarySpocId: 'user-1',
        secondarySpoc: 'Bob Wilson',
        secondarySpocId: 'user-2',
        assignedRecruiters: ['recruiter-1', 'recruiter-2'],
        assignedRecruiterIds: ['user-3', 'user-4'],
        jdCount: 5,
        avgTurnaroundTime: 3.2,
        feedbackAgeing: 2.1,
        slaAdherence: 85,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'spoc-map-2',
        clientId: 'client-2',
        clientName: 'StartupXYZ',
        primarySpoc: 'Carol Davis',
        primarySpocId: 'user-5',
        assignedRecruiters: ['recruiter-3'],
        assignedRecruiterIds: ['user-6'],
        jdCount: 3,
        avgTurnaroundTime: 4.5,
        feedbackAgeing: 3.8,
        slaAdherence: 72,
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-14T16:45:00Z'
      }
    ];

    // Initialize Recruiter Manager Mappings
    this.mockRecruiterManagerMappings = [
      {
        id: 'rec-mgr-1',
        recruiterId: 'recruiter-1',
        recruiterName: 'Sarah Johnson',
        staffingManagerId: 'manager-1',
        staffingManagerName: 'Mike Rodriguez',
        activeJDs: 8,
        activeCandidates: 15,
        workloadScore: 75,
        assignedAt: '2024-01-01T10:00:00Z',
        assignedBy: 'hr-manager-1'
      },
      {
        id: 'rec-mgr-2',
        recruiterId: 'recruiter-2',
        recruiterName: 'David Chen',
        staffingManagerId: 'manager-1',
        staffingManagerName: 'Mike Rodriguez',
        activeJDs: 6,
        activeCandidates: 12,
        workloadScore: 60,
        assignedAt: '2024-01-01T10:00:00Z',
        assignedBy: 'hr-manager-1'
      }
    ];

    // Initialize Talent Pool Ownerships (now fetched from database)
    this.mockTalentPoolOwnerships = [];

    // Initialize Escalation Rules
    this.mockEscalationRules = [
      {
        id: 'esc-rule-1',
        name: 'SLA Breach - No Submission',
        description: 'Auto-escalate when JD has no submissions after 5 days',
        triggerType: 'NO_SUBMISSION',
        thresholdDays: 5,
        escalationChain: [
          { level: 1, role: 'STAFFING_MANAGER', autoAssign: true, timeoutHours: 24 },
          { level: 2, role: 'HR_MANAGER', autoAssign: true, timeoutHours: 48 }
        ],
        notificationMethods: ['Email', 'Slack'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-10T15:30:00Z'
      },
      {
        id: 'esc-rule-2',
        name: 'Delayed Client Feedback',
        description: 'Escalate when client feedback is delayed beyond 3 days',
        triggerType: 'DELAYED_FEEDBACK',
        thresholdDays: 3,
        escalationChain: [
          { level: 1, role: 'STAFFING_MANAGER', autoAssign: false, timeoutHours: 12 },
          { level: 2, role: 'LEADERSHIP', autoAssign: false, timeoutHours: 24 }
        ],
        notificationMethods: ['Email', 'WhatsApp'],
        isActive: true,
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-12T09:15:00Z'
      }
    ];

    // Initialize Change Logs
    this.mockChangeLogs = [
      {
        id: 'log-1',
        resourceType: 'JD',
        resourceId: 'jd-001',
        resourceName: 'Senior React Developer',
        changeType: 'Reassign',
        fromValue: 'recruiter-3',
        toValue: 'recruiter-1',
        changedBy: 'manager-1',
        changedAt: '2024-01-16T14:30:00Z',
        reason: 'Balancing workload',
        metadata: { previousWorkload: 85, newWorkload: 75 }
      },
      {
        id: 'log-2',
        resourceType: 'Candidate',
        resourceId: 'candidate-2',
        resourceName: 'Emily Chen',
        changeType: 'Transfer',
        fromValue: 'recruiter-3',
        toValue: 'recruiter-2',
        changedBy: 'manager-1',
        changedAt: '2024-01-15T11:45:00Z',
        reason: 'Skill set alignment'
      }
    ];

    // Initialize Escalation Events
    this.mockEscalationEvents = [
      {
        id: 'esc-event-1',
        ruleId: 'esc-rule-1',
        ruleName: 'SLA Breach - No Submission',
        resourceType: 'JD',
        resourceId: 'jd-004',
        resourceName: 'DevOps Engineer',
        fromUser: 'recruiter-2',
        toUser: 'manager-1',
        escalationLevel: 1,
        reason: 'No submissions for 5 days',
        triggeredAt: '2024-01-16T10:00:00Z',
        resolvedAt: '2024-01-16T16:30:00Z',
        status: 'Resolved',
        actions: [
          {
            id: 'action-1',
            actionType: 'Reassignment',
            performedBy: 'manager-1',
            performedAt: '2024-01-16T16:30:00Z',
            description: 'Reassigned JD to more experienced recruiter',
            result: 'JD assigned to recruiter-1'
          }
        ]
      }
    ];
  }

  // JD Ownership
  async getJDOwnerships(filters?: OwnershipFilters): Promise<JDOwnership[]> {
    let ownerships = [...this.mockJDOwnerships];
    
    if (filters) {
      if (filters.recruiter) {
        ownerships = ownerships.filter(o => 
          o.primaryRecruiter.includes(filters.recruiter!) || 
          o.collaborators.includes(filters.recruiter!)
        );
      }
      if (filters.manager) {
        ownerships = ownerships.filter(o => o.staffingManager === filters.manager);
      }
      if (filters.status) {
        ownerships = ownerships.filter(o => o.status === filters.status);
      }
    }
    
    return ownerships;
  }

  async updateJDOwnership(jdId: string, updates: Partial<JDOwnership>): Promise<JDOwnership> {
    const index = this.mockJDOwnerships.findIndex(o => o.jdId === jdId);
    if (index === -1) throw new Error('JD ownership not found');

    const oldOwnership = { ...this.mockJDOwnerships[index] };
    this.mockJDOwnerships[index] = {
      ...this.mockJDOwnerships[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Log the change
    await this.logOwnershipChange({
      resourceType: 'JD',
      resourceId: jdId,
      resourceName: this.mockJDOwnerships[index].jdTitle,
      changeType: 'Reassign',
      fromValue: oldOwnership.primaryRecruiter,
      toValue: updates.primaryRecruiter || oldOwnership.primaryRecruiter,
      changedBy: updates.updatedBy || 'system',
      changedAt: new Date().toISOString()
    });

    return this.mockJDOwnerships[index];
  }

  // Candidate Ownership
  async getCandidateOwnerships(filters?: OwnershipFilters): Promise<CandidateOwnership[]> {
    let ownerships = [...this.mockCandidateOwnerships];
    
    if (filters) {
      if (filters.recruiter) {
        ownerships = ownerships.filter(o => o.recruiterOwner === filters.recruiter);
      }
    }
    
    return ownerships;
  }

  async reassignCandidate(candidateId: string, newOwnerId: string, reason?: string): Promise<CandidateOwnership> {
    const index = this.mockCandidateOwnerships.findIndex(o => o.candidateId === candidateId);
    if (index === -1) throw new Error('Candidate ownership not found');

    const oldOwner = this.mockCandidateOwnerships[index].recruiterOwner;
    this.mockCandidateOwnerships[index] = {
      ...this.mockCandidateOwnerships[index],
      recruiterOwner: newOwnerId,
      lastUpdated: new Date().toISOString()
    };

    // Log the change
    await this.logOwnershipChange({
      resourceType: 'Candidate',
      resourceId: candidateId,
      resourceName: this.mockCandidateOwnerships[index].candidateName,
      changeType: 'Reassign',
      fromValue: oldOwner,
      toValue: newOwnerId,
      changedBy: 'current-user',
      changedAt: new Date().toISOString(),
      reason
    });

    return this.mockCandidateOwnerships[index];
  }

  // Client SPOC Mapping
  async getClientSpocMappings(): Promise<ClientSpocMapping[]> {
    // Import dynamically to avoid circular dependency
    const { ClientSpocMappingService } = await import('./clientSpocMappingService');
    return ClientSpocMappingService.getAllMappings();
  }

  async updateClientSpocMapping(clientId: string, updates: Partial<ClientSpocMapping>): Promise<ClientSpocMapping> {
    const index = this.mockClientSpocMappings.findIndex(m => m.clientId === clientId);
    if (index === -1) throw new Error('Client SPOC mapping not found');

    this.mockClientSpocMappings[index] = {
      ...this.mockClientSpocMappings[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.mockClientSpocMappings[index];
  }

  // Recruiter Manager Mapping
  async getRecruiterManagerMappings(): Promise<RecruiterManagerMapping[]> {
    const { data, error } = await supabase.rpc('get_recruiter_manager_mappings');
    if (error) throw error;
    return (data || []).map(row => ({
      id: row.id,
      recruiterId: row.recruiter_id,
      recruiterName: row.recruiter_name,
      staffingManagerId: row.manager_id || '',
      staffingManagerName: row.manager_name,
      activeJDs: row.active_jds,
      activeCandidates: row.active_candidates,
      workloadScore: row.workload_score,
      assignedAt: row.assigned_at || new Date().toISOString(),
      assignedBy: row.assigned_by || ''
    }));
  }

  async updateRecruiterManagerMapping(recruiterId: string, managerId: string): Promise<RecruiterManagerMapping> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('recruiter_manager_mappings')
      .update({
        manager_id: managerId,
        assigned_at: new Date().toISOString(),
        assigned_by: user?.id
      })
      .eq('recruiter_id', recruiterId);

    if (error) throw error;

    const mappings = await this.getRecruiterManagerMappings();
    const updated = mappings.find(m => m.recruiterId === recruiterId);
    if (!updated) throw new Error('Failed to retrieve updated mapping');
    return updated;
  }

  async bulkUpdateRecruiterManagerMapping(recruiterIds: string[], managerId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('recruiter_manager_mappings')
      .update({
        manager_id: managerId,
        assigned_at: new Date().toISOString(),
        assigned_by: user?.id
      })
      .in('recruiter_id', recruiterIds);

    if (error) throw error;
  }

  async getManagers(): Promise<Array<{ id: string; name: string; role: string }>> {
    const { data, error } = await supabase
      .rpc('get_manager_profiles');

    if (error) throw error;

    return (data || []).map(profile => ({
      id: profile.id,
      name: profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
      role: profile.role
    }));
  }

  // Talent Pool Ownership
  async getTalentPoolOwnerships(): Promise<TalentPoolOwnership[]> {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('pool_tag')
        .order('pool_tag');

      if (error) throw error;

      // Group by pool_tag and count
      const poolMap = new Map<string, number>();
      data?.forEach((row) => {
        const tag = row.pool_tag;
        poolMap.set(tag, (poolMap.get(tag) || 0) + 1);
      });

      // Convert to TalentPoolOwnership array
      return Array.from(poolMap.entries()).map(([poolName, count], index) => ({
        id: `pool-${index}`,
        poolId: `pool-${poolName.replace(/\s+/g, '-').toLowerCase()}`,
        poolName,
        owner: 'System',
        candidateCount: count,
        createdAt: new Date().toISOString(),
      })).sort((a, b) => b.candidateCount - a.candidateCount);
    } catch (error) {
      console.error('Failed to fetch talent pool ownerships:', error);
      return [];
    }
  }

  async updateTalentPoolAccess(poolId: string, updates: Partial<TalentPoolOwnership>): Promise<TalentPoolOwnership> {
    const index = this.mockTalentPoolOwnerships.findIndex(p => p.poolId === poolId);
    if (index === -1) throw new Error('Talent pool ownership not found');

    this.mockTalentPoolOwnerships[index] = {
      ...this.mockTalentPoolOwnerships[index],
      ...updates
    };

    return this.mockTalentPoolOwnerships[index];
  }

  // Escalation Rules
  async getEscalationRules(): Promise<EscalationRule[]> {
    return [...this.mockEscalationRules];
  }

  async createEscalationRule(rule: Omit<EscalationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<EscalationRule> {
    const newRule: EscalationRule = {
      ...rule,
      id: `esc-rule-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.mockEscalationRules.push(newRule);
    return newRule;
  }

  async updateEscalationRule(ruleId: string, updates: Partial<EscalationRule>): Promise<EscalationRule> {
    const index = this.mockEscalationRules.findIndex(r => r.id === ruleId);
    if (index === -1) throw new Error('Escalation rule not found');

    this.mockEscalationRules[index] = {
      ...this.mockEscalationRules[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.mockEscalationRules[index];
  }

  // Reports
  async getWorkloadDistribution(): Promise<WorkloadDistribution[]> {
    return [
      {
        recruiterId: 'recruiter-1',
        recruiterName: 'Sarah Johnson',
        activeJDs: 8,
        activeCandidates: 15,
        weeklySubmissions: 5,
        workloadScore: 75,
        utilizationRate: 85,
        slaCompliance: 92,
        status: 'Active'
      },
      {
        recruiterId: 'recruiter-2',
        recruiterName: 'David Chen',
        activeJDs: 6,
        activeCandidates: 12,
        weeklySubmissions: 4,
        workloadScore: 60,
        utilizationRate: 70,
        slaCompliance: 88,
        status: 'Active'
      }
    ];
  }

  async getManagerDashboards(): Promise<ManagerDashboard[]> {
    return [
      {
        managerId: 'manager-1',
        managerName: 'Mike Rodriguez',
        teamSize: 3,
        teamJDs: 18,
        teamCandidates: 35,
        teamSlaCompliance: 90,
        pipelineHealth: 85,
        avgResponseTime: 4.2,
        escalationsReceived: 8,
        escalationsResolved: 6
      }
    ];
  }

  async getClientSlaReports(): Promise<ClientSlaReport[]> {
    return [
      {
        clientId: 'client-1',
        clientName: 'TechCorp Inc.',
        spocName: 'Alice Johnson',
        totalJDs: 5,
        avgTurnaroundTime: 3.2,
        feedbackDelay: 2.1,
        slaBreaches: 2,
        slaAdherence: 85,
        riskLevel: 'Medium'
      }
    ];
  }

  async getOrphanReport(): Promise<OrphanReport> {
    return {
      unassignedCandidates: [
        {
          candidateId: 'candidate-orphan-1',
          candidateName: 'Unassigned Candidate',
          daysSinceCreated: 7,
          lastActivity: '2024-01-09T10:00:00Z',
          source: 'LinkedIn'
        }
      ],
      unlinkedJDs: [
        {
          jdId: 'jd-orphan-1',
          jdTitle: 'Unlinked Position',
          client: 'TechCorp',
          daysSinceCreated: 5,
          priority: 'High'
        }
      ],
      inactiveOwners: [],
      staleAssignments: []
    };
  }

  async getOwnershipMetrics(): Promise<OwnershipMetrics> {
    return {
      totalJDs: 45,
      totalCandidates: 128,
      totalMappings: 12,
      avgWorkloadScore: 68,
      balanceIndex: 0.85,
      escalationRate: 0.12,
      reassignmentRate: 0.08,
      ownershipVelocity: 1.25
    };
  }

  // No Submission Reports
  async getNoSubmissionReports(): Promise<NoSubmissionReport[]> {
    return [
      {
        jdId: 'jd-002',
        jdTitle: 'Python Backend Engineer',
        client: 'TechCorp Solutions',
        recruiterOwner: 'recruiter-3',
        slaDeadline: '2024-01-28T23:59:59Z',
        submissionsCount: 0,
        daysSincePosted: 18,
        daysPastDeadline: 2,
        riskLevel: 'High'
      },
      {
        jdId: 'jd-005',
        jdTitle: 'Product Manager',
        client: 'StartupXYZ',
        recruiterOwner: 'recruiter-4',
        slaDeadline: '2024-02-05T23:59:59Z',
        submissionsCount: 0,
        daysSincePosted: 5,
        riskLevel: 'Medium'
      }
    ];
  }

  async getNoSubmissionWidget(): Promise<NoSubmissionWidget> {
    return {
      jdsLast24h: 3,
      jdsLast7d: 8,
      totalOpenJds: 24,
      criticalJds: 5
    };
  }

  // Quick Actions
  async escalateToManager(jdId: string, reason: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Escalating JD ${jdId} to manager. Reason: ${reason}`);
  }

  async notifyRecruiter(jdId: string, message: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Notifying recruiter for JD ${jdId}. Message: ${message}`);
  }

  // Bulk Operations
  async bulkReassign(operation: BulkOwnershipOperation): Promise<boolean> {
    // Mock bulk operation
    for (const resourceId of operation.resourceIds) {
      if (operation.operation === 'REASSIGN' && operation.targetOwnerId) {
        await this.reassignCandidate(resourceId, operation.targetOwnerId, operation.reason);
      }
    }
    return true;
  }

  // Change Logging
  private async logOwnershipChange(log: Omit<OwnershipChangeLog, 'id'>): Promise<void> {
    const changeLog: OwnershipChangeLog = {
      ...log,
      id: `log-${Date.now()}`
    };
    this.mockChangeLogs.unshift(changeLog);
  }

  async getOwnershipChangeLogs(filters?: { resourceType?: string; resourceId?: string }): Promise<OwnershipChangeLog[]> {
    let logs = [...this.mockChangeLogs];
    
    if (filters?.resourceType) {
      logs = logs.filter(log => log.resourceType === filters.resourceType);
    }
    if (filters?.resourceId) {
      logs = logs.filter(log => log.resourceId === filters.resourceId);
    }
    
    return logs;
  }

  // Escalation Events
  async getEscalationEvents(): Promise<EscalationEvent[]> {
    return [...this.mockEscalationEvents];
  }

  async exportOwnershipData(type: 'excel' | 'pdf', dataType: string): Promise<string> {
    // Mock export
    return `https://exports.company.com/ownership-${dataType}-${Date.now()}.${type}`;
  }

  async getJDSubmissions(jdId: string): Promise<JDSubmission[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [];
  }

  async getPrimaryFollowUps(primaryRecruiterId: string): Promise<PrimaryFollowUp[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [];
  }

  async getOwnershipRules(): Promise<OwnershipRules> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      creditRules: {
        submitterCredit: 1.0,
        primaryFollowUpCredit: 0.25,
        customSchemes: []
      },
      dedupeKeys: {
        keys: ['email', 'phone'],
        mode: 'strict',
        blockDuplicates: true
      },
      submissionCaps: {
        defaultDailyCap: 5,
        enforceAtJDLevel: true,
        allowOverrides: false
      },
      openPoolDefaults: {
        defaultAllowCollaborators: true,
        requireApproval: false,
        autoNotifyPrimary: true
      }
    };
  }
}

export const ownershipService = OwnershipService.getInstance();