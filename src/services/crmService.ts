import { supabase } from '@/integrations/supabase/client';
import type { 
  CrmClient, 
  CrmAccount, 
  CrmSpoc, 
  CrmProject, 
  CrmOpportunity, 
  CrmInteraction, 
  CrmDocument, 
  CrmRecruiterAssignment,
  CrmClientFilters,
  CrmMetrics,
  CrmKPIs
} from '@/types/crm';

export class CrmService {
  // Clients
  static async getClients(filters?: CrmClientFilters) {
    let query = supabase
      .from('crm_clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.industry) {
      query = query.eq('industry', filters.industry);
    }
    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,domain.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as CrmClient[];
  }

  static async getClientById(id: string) {
    const { data, error } = await supabase
      .from('crm_clients')
      .select(`
        *,
        accounts:crm_accounts(*),
        spocs:crm_spocs(*),
        projects:crm_projects(*),
        opportunities:crm_opportunities(*),
        interactions:crm_interactions(*),
        documents:crm_documents(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createClient(client: Omit<CrmClient, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('crm_clients')
      .insert(client)
      .select()
      .single();

    if (error) throw error;
    return data as CrmClient;
  }

  static async updateClient(id: string, updates: Partial<CrmClient>) {
    const { data, error } = await supabase
      .from('crm_clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CrmClient;
  }

  // Accounts
  static async getAccountsByClient(clientId: string) {
    const { data, error } = await supabase
      .from('crm_accounts')
      .select(`
        *,
        client:crm_clients(*),
        primary_spoc:crm_spocs(*)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async createAccount(account: Omit<CrmAccount, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('crm_accounts')
      .insert(account)
      .select()
      .single();

    if (error) throw error;
    return data as CrmAccount;
  }

  // SPOCs
  static async getSpocsByClient(clientId: string) {
    const { data, error } = await supabase
      .from('crm_spocs')
      .select('*')
      .eq('client_id', clientId)
      .order('is_primary', { ascending: false });

    if (error) throw error;
    return data as CrmSpoc[];
  }

  static async createSpoc(spoc: Omit<CrmSpoc, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('crm_spocs')
      .insert(spoc)
      .select()
      .single();

    if (error) throw error;
    return data as CrmSpoc;
  }

  static async updateSpoc(id: string, updates: Partial<CrmSpoc>) {
    const { data, error } = await supabase
      .from('crm_spocs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CrmSpoc;
  }

  // Projects
  static async getProjects() {
    const { data, error } = await supabase
      .from('crm_projects')
      .select(`
        *,
        client:crm_clients(*),
        account:crm_accounts(*),
        primary_spoc:crm_spocs(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async createProject(project: Omit<CrmProject, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('crm_projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data as CrmProject;
  }

  // Opportunities
  static async getOpportunities() {
    const { data, error } = await supabase
      .from('crm_opportunities')
      .select(`
        *,
        client:crm_clients(*),
        account:crm_accounts(*),
        project:crm_projects(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async createOpportunity(opportunity: Omit<CrmOpportunity, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('crm_opportunities')
      .insert(opportunity)
      .select()
      .single();

    if (error) throw error;
    return data as CrmOpportunity;
  }

  // Interactions
  static async getInteractions(limit = 50) {
    const { data, error } = await supabase
      .from('crm_interactions')
      .select(`
        *,
        client:crm_clients(*),
        account:crm_accounts(*),
        project:crm_projects(*),
        spoc:crm_spocs(*)
      `)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  static async createInteraction(interaction: Omit<CrmInteraction, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('crm_interactions')
      .insert(interaction)
      .select()
      .single();

    if (error) throw error;
    return data as CrmInteraction;
  }

  // Documents
  static async getDocuments() {
    const { data, error } = await supabase
      .from('crm_documents')
      .select(`
        *,
        client:crm_clients(*),
        account:crm_accounts(*),
        project:crm_projects(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async createDocument(document: Omit<CrmDocument, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('crm_documents')
      .insert(document)
      .select()
      .single();

    if (error) throw error;
    return data as CrmDocument;
  }

  // Recruiter Assignments
  static async getRecruiterAssignments() {
    const { data, error } = await supabase
      .from('crm_recruiter_assignments')
      .select(`
        *,
        client:crm_clients(*),
        account:crm_accounts(*),
        project:crm_projects(*)
      `)
      .order('assigned_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async assignRecruiter(assignment: Omit<CrmRecruiterAssignment, 'id' | 'assigned_at'>) {
    const { data, error } = await supabase
      .from('crm_recruiter_assignments')
      .insert(assignment)
      .select()
      .single();

    if (error) throw error;
    return data as CrmRecruiterAssignment;
  }

  // Analytics & KPIs
  static async getMetrics(): Promise<CrmMetrics> {
    const [clientsData, interactionsData] = await Promise.all([
      supabase.from('crm_clients').select('id, status, health_score'),
      supabase.from('crm_interactions').select('id').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    const clients = clientsData.data || [];
    const recentInteractions = interactionsData.data || [];

    return {
      total_clients: clients.length,
      active_clients: clients.filter(c => c.status === 'Active').length,
      total_jds: 0, // TODO: Link with hiring module
      avg_health_score: clients.reduce((sum, c) => sum + (c.health_score || 0), 0) / clients.length || 0,
      sla_compliance: 85, // TODO: Calculate based on SLA metrics
      recent_interactions: recentInteractions.length
    };
  }

  static async getKPIs(): Promise<CrmKPIs> {
    // Mock data for now - will be calculated from real data
    return {
      client_engagement: {
        avg_response_time: 2.5,
        fulfillment_rate: 78,
        last_engagement_avg_days: 12,
        sla_compliance_percent: 85
      },
      hiring_outcomes: {
        total_jds: 45,
        ft_hires: 23,
        contract_hires: 12,
        closure_rate: 77.8
      },
      business_growth: {
        active_opportunities: 18,
        pipeline_value: 450000,
        monthly_growth: 12.5
      }
    };
  }
}