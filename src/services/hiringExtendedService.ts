// Extended Hiring Service with Mock Data and localStorage persistence

import { 
  JobDescription, 
  JDApproval, 
  Client, 
  Account, 
  Project, 
  SPOC, 
  Interaction, 
  Opportunity, 
  Candidate, 
  Resume, 
  Application, 
  ResumeOwnership, 
  JDMapping, 
  FollowUpTask, 
  CRMKPIs, 
  TenantConfig,
  JDValidationError,
  JDParseResult,
  BulkJDValidateResponse,
  BulkJDCreateResponse,
  SmartJDParseResponse
} from '../types/hiring-extended';

export class HiringExtendedService {
  private static instance: HiringExtendedService;
  private tenantId: string = 'default'; // Would come from auth context

  private constructor() {}

  static getInstance(): HiringExtendedService {
    if (!HiringExtendedService.instance) {
      HiringExtendedService.instance = new HiringExtendedService();
    }
    return HiringExtendedService.instance;
  }

  setTenantId(tenantId: string) {
    this.tenantId = tenantId;
  }

  private getStorageKey(entity: string): string {
    return `hiring_extended::${this.tenantId}::${entity}`;
  }

  private getFromStorage<T>(entity: string): T[] {
    const data = localStorage.getItem(this.getStorageKey(entity));
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage<T>(entity: string, data: T[]): void {
    localStorage.setItem(this.getStorageKey(entity), JSON.stringify(data));
  }

  // Initialize with mock data
  async initializeMockData(): Promise<void> {
    // Initialize tenant config
    const existingConfig = this.getFromStorage<TenantConfig>('config');
    if (existingConfig.length === 0) {
      const defaultConfig: TenantConfig = {
        tenant_id: this.tenantId,
        currency_default: 'INR',
        ownership_days: 60,
        ownership_extend_on_interview_days: 30,
        followup_sla_days: 7,
        email_smtp: {
          provider: 'smtp',
          host: '',
          port: 587,
          user: '',
          from: ''
        },
        email_csv_enabled: true,
        channels_enabled: ['call', 'email', 'meeting', 'teams', 'whatsapp', 'linkedin', 'other']
      };
      this.saveToStorage('config', [defaultConfig]);
    }

    // Initialize with sample JDs
    const existingJDs = this.getFromStorage<JobDescription>('jds');
    if (existingJDs.length === 0) {
      const sampleJDs: JobDescription[] = [
        {
          id: 'jd-1',
          tenant_id: this.tenantId,
          department: 'Engineering',
          business_unit: 'Product Development',
          job_title: 'Senior React Developer',
          openings: 2,
          recruiter_owner_email: 'recruiter@company.com',
          position_type: 'EXTERNAL',
          min_ctc_annual: 1200000,
          max_ctc_annual: 1800000,
          currency: 'INR',
          location: 'Bangalore',
          employment_type: 'Full-time',
          min_exp_years: 3,
          max_exp_years: 6,
          remote_hybrid: 'Hybrid',
          skills_primary: ['React', 'JavaScript', 'TypeScript'],
          skills_secondary: ['Node.js', 'AWS', 'GraphQL'],
          must_have: 'Strong React experience, TypeScript proficiency',
          good_to_have: 'Experience with state management, testing frameworks',
          job_description: 'We are looking for a Senior React Developer...',
          client_name: 'TechCorp Inc.',
          hiring_manager_email: 'hm@company.com',
          priority: 'High',
          expiry_date: '2024-12-31',
          approval_required: true,
          status: 'PendingApproval',
          approval_path: 'EXTERNAL',
          jd_source: 'Manual',
          created_by: 'hm@company.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'jd-2',
          tenant_id: this.tenantId,
          department: 'Engineering',
          business_unit: 'Platform',
          job_title: 'DevOps Engineer',
          openings: 1,
          recruiter_owner_email: 'recruiter2@company.com',
          position_type: 'INTERNAL',
          min_ctc_annual: 1000000,
          max_ctc_annual: 1500000,
          currency: 'INR',
          location: 'Mumbai',
          employment_type: 'Full-time',
          min_exp_years: 2,
          max_exp_years: 5,
          remote_hybrid: 'Remote',
          skills_primary: ['AWS', 'Docker', 'Kubernetes'],
          skills_secondary: ['Terraform', 'Jenkins', 'Python'],
          must_have: 'AWS certification, container orchestration experience',
          good_to_have: 'Infrastructure as Code, CI/CD pipelines',
          job_description: 'We need a DevOps Engineer to manage our cloud infrastructure...',
          hiring_manager_email: 'hm2@company.com',
          priority: 'Normal',
          approval_required: true,
          status: 'Draft',
          approval_path: 'INTERNAL',
          jd_source: 'Manual',
          created_by: 'hm2@company.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      this.saveToStorage('jds', sampleJDs);
    }

    // Initialize with sample clients
    const existingClients = this.getFromStorage<Client>('clients');
    if (existingClients.length === 0) {
      const sampleClients: Client[] = [
        {
          id: 'client-1',
          tenant_id: this.tenantId,
          name: 'TechCorp Inc.',
          industry: 'Technology',
          tier: 'Tier 1',
          owner: 'sales@company.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'client-2',
          tenant_id: this.tenantId,
          name: 'FinanceFlow Ltd.',
          industry: 'Financial Services',
          tier: 'Tier 2',
          owner: 'sales2@company.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      this.saveToStorage('clients', sampleClients);
    }

    // Initialize sample candidates
    const existingCandidates = this.getFromStorage<Candidate>('candidates');
    if (existingCandidates.length === 0) {
      const sampleCandidates: Candidate[] = [
        {
          id: 'candidate-1',
          tenant_id: this.tenantId,
          email: 'john.doe@email.com',
          phone_hash: 'hash123',
          name: 'John Doe',
          location: 'Bangalore',
          consent_source: 'naukri_import',
          consent_ts: new Date().toISOString(),
          global_opt_out: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      this.saveToStorage('candidates', sampleCandidates);
    }
  }

  // JD Management
  async getJDs(filters?: any): Promise<JobDescription[]> {
    await this.initializeMockData();
    let jds = this.getFromStorage<JobDescription>('jds');
    
    if (filters?.status) {
      jds = jds.filter(jd => jd.status === filters.status);
    }
    if (filters?.approval_path) {
      jds = jds.filter(jd => jd.approval_path === filters.approval_path);
    }
    
    return jds;
  }

  async createJD(jd: Omit<JobDescription, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<JobDescription> {
    const newJD: JobDescription = {
      ...jd,
      id: `jd-${Date.now()}`,
      tenant_id: this.tenantId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const jds = this.getFromStorage<JobDescription>('jds');
    jds.push(newJD);
    this.saveToStorage('jds', jds);

    return newJD;
  }

  async validateBulkJDs(data: Array<Record<string, any>>): Promise<BulkJDValidateResponse> {
    const errors: JDValidationError[] = [];
    
    data.forEach((row, index) => {
      if (!row.job_title) {
        errors.push({ row: index + 1, col: 'job_title', message: 'Job title is required' });
      }
      if (!row.department) {
        errors.push({ row: index + 1, col: 'department', message: 'Department is required' });
      }
      if (!row.openings || row.openings < 1) {
        errors.push({ row: index + 1, col: 'openings', message: 'Openings must be at least 1' });
      }
      if (row.min_ctc_annual && row.max_ctc_annual && row.min_ctc_annual > row.max_ctc_annual) {
        errors.push({ row: index + 1, col: 'min_ctc_annual', message: 'Min CTC cannot be greater than Max CTC' });
      }
    });

    return {
      ok: errors.length === 0,
      errors
    };
  }

  async createBulkJDs(data: Array<Record<string, any>>): Promise<BulkJDCreateResponse> {
    const created: string[] = [];
    const failed: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        const jd = await this.createJD({
          department: row.department,
          business_unit: row.business_unit || 'General',
          job_title: row.job_title,
          openings: row.openings,
          recruiter_owner_email: row.recruiter_owner_email || 'recruiter@company.com',
          position_type: row.position_type || 'EXTERNAL',
          min_ctc_annual: row.min_ctc_annual,
          max_ctc_annual: row.max_ctc_annual,
          currency: row.currency || 'INR',
          location: row.location,
          employment_type: row.employment_type,
          min_exp_years: row.min_exp_years,
          max_exp_years: row.max_exp_years,
          skills_primary: row.skills_primary ? row.skills_primary.split(',') : [],
          skills_secondary: row.skills_secondary ? row.skills_secondary.split(',') : [],
          job_description: row.job_description || 'Job description not provided',
          hiring_manager_email: row.hiring_manager_email || 'hm@company.com',
          approval_required: true,
          status: 'Draft',
          approval_path: row.position_type === 'INTERNAL' ? 'INTERNAL' : 'EXTERNAL',
          jd_source: 'Excel',
          created_by: 'bulk_import'
        });
        created.push(jd.id);
      } catch (error) {
        failed.push({ row: i + 1, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return { created, failed };
  }

  async parseSmartJD(file_content: string, file_name: string): Promise<SmartJDParseResponse> {
    // Mock smart parsing logic
    const draft: Partial<JobDescription> = {
      job_title: 'Senior Software Engineer', // Extracted from document
      department: 'Engineering',
      skills_primary: ['JavaScript', 'React', 'Node.js'],
      min_exp_years: 3,
      max_exp_years: 6,
      job_description: 'Extracted job description from the document...'
    };

    return {
      draft,
      confidence: 0.85 // 85% confidence
    };
  }

  async approveJD(jd_id: string, approver_role: string, comment?: string): Promise<void> {
    const jds = this.getFromStorage<JobDescription>('jds');
    const jdIndex = jds.findIndex(jd => jd.id === jd_id);
    
    if (jdIndex !== -1) {
      // Create approval record
      const approvals = this.getFromStorage<JDApproval>('jd_approvals');
      const approval: JDApproval = {
        id: `approval-${Date.now()}`,
        jd_id,
        approver_role: approver_role as any,
        approver_email: 'approver@company.com',
        approver_name: 'Approver Name',
        status: 'Approved',
        comment,
        timestamp: new Date().toISOString()
      };
      approvals.push(approval);
      this.saveToStorage('jd_approvals', approvals);

      // Update JD status based on approval path
      const jd = jds[jdIndex];
      if (jd.approval_path === 'EXTERNAL' && approver_role === 'STAFFING_MANAGER') {
        jd.status = 'Approved';
      } else if (jd.approval_path === 'INTERNAL') {
        if (approver_role === 'HR_MANAGER') {
          jd.status = 'PendingApproval'; // Wait for management approval
        } else if (approver_role === 'MANAGEMENT') {
          jd.status = 'Approved';
        }
      }
      
      jd.updated_at = new Date().toISOString();
      this.saveToStorage('jds', jds);
    }
  }

  async publishJD(jd_id: string): Promise<void> {
    const jds = this.getFromStorage<JobDescription>('jds');
    const jdIndex = jds.findIndex(jd => jd.id === jd_id);
    
    if (jdIndex !== -1 && jds[jdIndex].status === 'Approved') {
      jds[jdIndex].status = 'Published';
      jds[jdIndex].updated_at = new Date().toISOString();
      this.saveToStorage('jds', jds);
    }
  }

  // CRM Methods
  async getClients(): Promise<Client[]> {
    await this.initializeMockData();
    return this.getFromStorage<Client>('clients');
  }

  async createClient(client: Omit<Client, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const newClient: Client = {
      ...client,
      id: `client-${Date.now()}`,
      tenant_id: this.tenantId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const clients = this.getFromStorage<Client>('clients');
    clients.push(newClient);
    this.saveToStorage('clients', clients);

    return newClient;
  }

  async getAccounts(client_id?: string): Promise<Account[]> {
    let accounts = this.getFromStorage<Account>('accounts');
    if (client_id) {
      accounts = accounts.filter(account => account.client_id === client_id);
    }
    return accounts;
  }

  async getProjects(account_id?: string): Promise<Project[]> {
    let projects = this.getFromStorage<Project>('projects');
    if (account_id) {
      projects = projects.filter(project => project.account_id === account_id);
    }
    return projects;
  }

  async getInteractions(filters?: any): Promise<Interaction[]> {
    let interactions = this.getFromStorage<Interaction>('interactions');
    
    if (filters?.project_id) {
      interactions = interactions.filter(i => i.project_id === filters.project_id);
    }
    if (filters?.type) {
      interactions = interactions.filter(i => i.type === filters.type);
    }
    
    return interactions;
  }

  async createInteraction(interaction: Omit<Interaction, 'id' | 'tenant_id' | 'created_at'>): Promise<Interaction> {
    const newInteraction: Interaction = {
      ...interaction,
      id: `interaction-${Date.now()}`,
      tenant_id: this.tenantId,
      created_at: new Date().toISOString()
    };

    const interactions = this.getFromStorage<Interaction>('interactions');
    interactions.push(newInteraction);
    this.saveToStorage('interactions', interactions);

    // Create follow-up task if next_followup_on is specified
    if (newInteraction.next_followup_on) {
      const task: FollowUpTask = {
        id: `task-${Date.now()}`,
        tenant_id: this.tenantId,
        assignee: newInteraction.created_by,
        title: `Follow-up: ${newInteraction.subject}`,
        description: `Follow-up on ${newInteraction.type} interaction`,
        due_on: newInteraction.next_followup_on,
        priority: 'Medium',
        status: 'Pending',
        context_entity_type: 'interaction',
        context_entity_id: newInteraction.id,
        created_by: newInteraction.created_by,
        created_at: new Date().toISOString()
      };

      const tasks = this.getFromStorage<FollowUpTask>('followup_tasks');
      tasks.push(task);
      this.saveToStorage('followup_tasks', tasks);
    }

    return newInteraction;
  }

  // Candidates and Resumes
  async getCandidates(): Promise<Candidate[]> {
    await this.initializeMockData();
    return this.getFromStorage<Candidate>('candidates');
  }

  async createCandidate(candidate: Omit<Candidate, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Candidate> {
    const newCandidate: Candidate = {
      ...candidate,
      id: `candidate-${Date.now()}`,
      tenant_id: this.tenantId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const candidates = this.getFromStorage<Candidate>('candidates');
    candidates.push(newCandidate);
    this.saveToStorage('candidates', candidates);

    return newCandidate;
  }

  async getResumes(candidate_id?: string): Promise<Resume[]> {
    let resumes = this.getFromStorage<Resume>('resumes');
    if (candidate_id) {
      resumes = resumes.filter(resume => resume.candidate_id === candidate_id);
    }
    return resumes;
  }

  async getResumeDiff(resume_id: string, against: string = 'master'): Promise<{ master: Resume | null; client: Resume | null; diff: any }> {
    const resumes = this.getFromStorage<Resume>('resumes');
    const clientResume = resumes.find(r => r.id === resume_id);
    const masterResume = resumes.find(r => r.candidate_id === clientResume?.candidate_id && r.is_master);

    // Mock diff - in real implementation, this would show detailed differences
    const diff = {
      skills_added: ['AWS', 'Docker'],
      skills_removed: ['jQuery'],
      sections_modified: ['Experience', 'Education']
    };

    return {
      master: masterResume || null,
      client: clientResume || null,
      diff
    };
  }

  // Ownership and Mapping
  async getOwnerships(owner_email?: string): Promise<ResumeOwnership[]> {
    let ownerships = this.getFromStorage<ResumeOwnership>('ownerships');
    if (owner_email) {
      ownerships = ownerships.filter(o => o.owner_email === owner_email);
    }
    return ownerships;
  }

  async claimOwnership(resume_id: string, candidate_id: string, owner_email: string): Promise<ResumeOwnership> {
    const config = this.getFromStorage<TenantConfig>('config')[0];
    const acquired_at = new Date();
    const expires_at = new Date(acquired_at.getTime() + (config.ownership_days * 24 * 60 * 60 * 1000));

    const ownership: ResumeOwnership = {
      id: `ownership-${Date.now()}`,
      tenant_id: this.tenantId,
      resume_id,
      candidate_id,
      owner_email,
      acquired_at: acquired_at.toISOString(),
      expires_at: expires_at.toISOString(),
      auto_extended: false,
      created_at: new Date().toISOString()
    };

    const ownerships = this.getFromStorage<ResumeOwnership>('ownerships');
    ownerships.push(ownership);
    this.saveToStorage('ownerships', ownerships);

    return ownership;
  }

  async getJDMappings(status?: string): Promise<JDMapping[]> {
    let mappings = this.getFromStorage<JDMapping>('jd_mappings');
    if (status) {
      mappings = mappings.filter(m => m.status === status);
    }
    return mappings;
  }

  async proposeMapping(jd_id: string, resume_id: string, proposed_by: string, reason?: string): Promise<JDMapping> {
    const mapping: JDMapping = {
      id: `mapping-${Date.now()}`,
      tenant_id: this.tenantId,
      jd_id,
      resume_id,
      proposed_by,
      status: 'Pending',
      comment: reason,
      created_at: new Date().toISOString()
    };

    const mappings = this.getFromStorage<JDMapping>('jd_mappings');
    mappings.push(mapping);
    this.saveToStorage('jd_mappings', mappings);

    return mapping;
  }

  async decideMappingProposal(mapping_id: string, decision: 'approve' | 'reject', reviewed_by: string, comment?: string): Promise<void> {
    const mappings = this.getFromStorage<JDMapping>('jd_mappings');
    const mappingIndex = mappings.findIndex(m => m.id === mapping_id);
    
    if (mappingIndex !== -1) {
      mappings[mappingIndex].status = decision === 'approve' ? 'Approved' : 'Rejected';
      mappings[mappingIndex].reviewed_by = reviewed_by;
      mappings[mappingIndex].reviewed_at = new Date().toISOString();
      mappings[mappingIndex].comment = comment;
      
      this.saveToStorage('jd_mappings', mappings);
    }
  }

  // Follow-up Tasks
  async getFollowUpTasks(assignee?: string): Promise<FollowUpTask[]> {
    let tasks = this.getFromStorage<FollowUpTask>('followup_tasks');
    if (assignee) {
      tasks = tasks.filter(task => task.assignee === assignee);
    }
    return tasks;
  }

  async completeFollowUpTask(task_id: string): Promise<void> {
    const tasks = this.getFromStorage<FollowUpTask>('followup_tasks');
    const taskIndex = tasks.findIndex(t => t.id === task_id);
    
    if (taskIndex !== -1) {
      tasks[taskIndex].status = 'Completed';
      tasks[taskIndex].completed_at = new Date().toISOString();
      this.saveToStorage('followup_tasks', tasks);
    }
  }

  // CRM KPIs (mock data)
  async getCRMKPIs(): Promise<CRMKPIs> {
    return {
      activity: {
        touches_per_client: { 'client-1': 15, 'client-2': 8 },
        touches_by_channel: { 
          email: 25, 
          call: 18, 
          meeting: 12, 
          teams: 8, 
          whatsapp: 5, 
          linkedin: 7, 
          other: 3 
        },
        days_since_last_touch: { 'client-1': 2, 'client-2': 7 }
      },
      coverage: {
        active_spocs_per_account: { 'account-1': 3, 'account-2': 2 },
        accounts_with_recent_touches: 8,
        total_accounts: 12
      },
      pipeline: {
        opportunities_per_week: [
          { week: '2024-01-01', count: 5 },
          { week: '2024-01-08', count: 8 },
          { week: '2024-01-15', count: 6 }
        ],
        conversion_rates: {
          lead: 0.3,
          qualified: 0.6,
          submitted: 0.4,
          interview: 0.7,
          offer: 0.8,
          won: 0.9,
          lost: 0
        },
        stage_velocity: {
          lead: 2,
          qualified: 5,
          submitted: 3,
          interview: 7,
          offer: 2,
          won: 1,
          lost: 0
        }
      },
      effectiveness: {
        reply_rate_per_channel: {
          email: 0.45,
          call: 0.65,
          meeting: 0.9,
          teams: 0.7,
          whatsapp: 0.8,
          linkedin: 0.3,
          other: 0.5
        },
        win_rate_per_account: { 'account-1': 0.6, 'account-2': 0.4 },
        win_rate_per_owner: { 'sales@company.com': 0.55, 'sales2@company.com': 0.48 }
      },
      risk: {
        stale_accounts_30d: ['account-3', 'account-5'],
        stale_accounts_60d: ['account-7'],
        stale_accounts_90d: ['account-9'],
        single_threaded_accounts: ['account-2', 'account-4']
      },
      recruiter_contribution: {
        opps_created: { 'recruiter@company.com': 12, 'recruiter2@company.com': 8 },
        submissions: { 'recruiter@company.com': 45, 'recruiter2@company.com': 32 },
        interviews: { 'recruiter@company.com': 28, 'recruiter2@company.com': 19 },
        offers: { 'recruiter@company.com': 15, 'recruiter2@company.com': 11 },
        wins: { 'recruiter@company.com': 12, 'recruiter2@company.com': 8 }
      }
    };
  }

  // Configuration
  async getTenantConfig(): Promise<TenantConfig> {
    await this.initializeMockData();
    return this.getFromStorage<TenantConfig>('config')[0];
  }

  async updateTenantConfig(config: Partial<TenantConfig>): Promise<TenantConfig> {
    const configs = this.getFromStorage<TenantConfig>('config');
    if (configs.length > 0) {
      Object.assign(configs[0], config);
      this.saveToStorage('config', configs);
      return configs[0];
    }
    throw new Error('Config not found');
  }
}

export const hiringExtendedService = HiringExtendedService.getInstance();