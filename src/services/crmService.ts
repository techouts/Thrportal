import { supabase } from "@/integrations/supabase/client";
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
  CrmKPIs,
} from "@/types/crm";
import type {
  MSA,
  SOW,
  PurchaseOrder,
  MSAFilters,
  SOWFilters,
  POFilters,
  CreateMSAInput,
  CreateSOWInput,
  CreatePOInput,
  UpdateMSAInput,
  UpdateSOWInput,
  UpdatePOInput,
} from "@/types/contracts";
import axios,{AxiosInstance} from "axios";
const VITE_API_BASE_NODE_URL = import.meta.env.VITE_API_BASE_NODE_URL;
const CRM_API_TIMEOUT = 30000
// Create axios instance
const CrmApiClient: AxiosInstance = axios.create({
  baseURL: VITE_API_BASE_NODE_URL,
  timeout: CRM_API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})
export class CrmService {
  // Clients
  static async getClients(filters?: CrmClientFilters) {
 try {
      const response = await CrmApiClient.get<CrmClient[]>(
        "/crm/clients"
      );
      return response.data as CrmClient[];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Unable to fetch client: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  static async getClientById(id: string) {
    console.log("🎯 START getClientById called with id:", id);

    const { data, error } = await supabase
      .from("crm_clients")
      .select(
        `
        *,
        accounts:crm_accounts(*),
        projects:crm_projects(*),
        opportunities:crm_opportunities(*),
        interactions:crm_interactions(*),
        documents:crm_documents(*)
      `
      )
      .eq("id", id)
      .single();

    console.log("📦 Client data fetched:", {
      success: !error,
      hasData: !!data,
      error: error?.message,
      clientName: data?.name,
    });

    if (error) throw error;

    // Fetch SPOCs through the junction table
    console.log("🔗 Fetching SPOC links for client:", id);
    const { data: spocLinks, error: spocError } = await supabase
      .from("crm_spoc_links")
      .select(
        `
        id,
        role,
        spoc:crm_spocs(*)
      `
      )
      .eq("entity_type", "client")
      .eq("entity_id", id);

    console.log("🔗 SPOC links query result:", {
      success: !spocError,
      linkCount: spocLinks?.length,
      error: spocError?.message,
      rawLinks: spocLinks,
    });

    if (spocError) throw spocError;

    // Transform spoc links to match the expected format with null checking
    const spocs = (spocLinks || [])
      .filter((link) => link.spoc != null)
      .map((link) => ({
        ...(link.spoc as any),
        link_id: link.id,
        link_role: link.role,
      }));

    console.log("🔍 FINAL SPOCs for client:", {
      clientId: id,
      spocCount: spocs.length,
      spocNames: spocs.map((s) => s.name),
      fullSpocs: spocs,
    });

    return {
      ...data,
      spocs,
    };
  }

  static async createClient(
    client: Omit<CrmClient, "id" | "created_at" | "updated_at">
  ) {
     try {
      const response = await CrmApiClient.post<CrmClient>(
        "/crm/clients/createClient",
        client
      );
      return response.data as CrmClient;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Failed to create client: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  static async updateClient(id: string, updates: Partial<CrmClient>) {
    try {
      const response = await CrmApiClient.put<CrmClient>(
        `/crm/clients/${id}`,
        updates
      );
      return response.data as CrmClient;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Failed to update Client: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  // Accounts
  static async getAccounts() {
     try {
      const response = await CrmApiClient.get<CrmAccount[]>(
        "/crm/accounts"
      );
      return response.data as CrmAccount[];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Unable to fetch accounts: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  static async getAccountsByClient(clientId: string) {
    const { data, error } = await supabase
      .from("crm_accounts")
      .select(
        `
        *,
        client:crm_clients(*),
        primary_spoc:crm_spocs!fk_crm_accounts_primary_spoc(*)
      `
      )
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async createAccount(
    account: Omit<CrmAccount, "id" | "created_at" | "updated_at">
  ) {
    try {
      const response = await CrmApiClient.post<CrmAccount>(
        "/crm/accounts/createAccount",
        account
      );
      const accountData = response.data;

     // Create SPOC link if primary_spoc_id is provided
    if (account.primary_spoc_id) {
      const linkData = {
        spoc_id: account.primary_spoc_id,
        entity_type: 'account',
        entity_id: response.data.id,
        role: 'primary'
      };
      try {
          await CrmApiClient.post(
            "/crm/spoc-links",
            linkData
          );
        } catch (linkError) {
          console.error(
            "Failed to create SPOC link:",
            linkError.response?.data || linkError.message
          );
          // Don’t throw — the SPOC was created successfully
        }
      }
    return accountData as CrmAccount;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Failed to create Account: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  // SPOCs
  static async getSpocsByClient(clientId: string) {
    const { data, error } = await supabase
      .from("crm_spoc_links")
      .select(
        `
        id,
        role,
        spoc:crm_spocs(*)
      `
      )
      .eq("entity_type", "client")
      .eq("entity_id", clientId);

    if (error) throw error;

    // Transform to match expected format with null checking
    const spocs = (data || [])
      .filter((link) => link.spoc != null)
      .map((link) => ({
        ...(link.spoc as any),
        link_id: link.id,
        link_role: link.role,
      })) as CrmSpoc[];

    console.log("🔍 Fetched SPOCs by client:", {
      clientId,
      spocCount: spocs.length,
    });

    return spocs;
  }

  static async getAllSpocs() {
    try {
      const response = await CrmApiClient.get<CrmSpoc[]>(
        "/crm/spocs"
      );
      return response.data as CrmSpoc[];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Unable to fetch accounts: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  static async createSpoc(
    spoc: Omit<CrmSpoc, "id" | "created_at" | "updated_at">
  ) {
        try {
      // 1️⃣ Create the SPOC record
      const spocResponse = await CrmApiClient.post<CrmSpoc>(
        "/crm/spocs",
        spoc
      );
      const spocData = spocResponse.data;

      // 2️⃣ Create the link if client_id or account_id is provided
      if (spoc.client_id || spoc.account_id) {
        const linkData = {
          spoc_id: spocData.id,
          entity_type: spoc.client_id ? "client" : "account",
          entity_id: spoc.client_id || spoc.account_id,
          role: spoc.role || "Contact",
        };
        
        try {
          await CrmApiClient.post(
            "/crm/spoc-links",
            linkData
          );
        } catch (linkError) {
          console.error(
            "Failed to create SPOC link:",
            linkError.response?.data || linkError.message
          );
          // Don’t throw — the SPOC was created successfully
        }
      }

      return spocData as CrmSpoc;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Failed to create SPOC: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  static async updateSpoc(id: string, updates: Partial<CrmSpoc>) {
    const { data, error } = await supabase
      .from("crm_spocs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as CrmSpoc;
  }

  // Projects
  static async getProjects() {
    try {
      const response = await CrmApiClient.get<CrmProject[]>(
        "/crm/projects"
      );
      return (response.data || []).map((project) => ({
        ...project,
        priority: project.priority as "Low" | "Medium" | "High" | "Critical",
        status: project.status as "Planned" | "In-flight" | "Closed",
      })) as CrmProject[];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Unable to get projects: ${error.message}`;
        throw new Error(msg);
      }
      throw error
  }
  }

  static async createProject(
    project: Omit<CrmProject, "id" | "created_at" | "updated_at">
  ) {
    try {
      const response = await CrmApiClient.post<CrmProject>(
        "/crm/projects/createProject",
        project
      );
      const projectData = response.data;

      // Create SPOC link if primary_spoc_id is provided
    if (project.primary_spoc_id) {
      const linkData = {
        spoc_id: project.primary_spoc_id,
        entity_type: 'project',
        entity_id: response.data.id,
        role: 'primary'
      };
       try {
          await CrmApiClient.post(
            "/crm/spoc-links",
            linkData
          );
        } catch (linkError) {
          console.error(
            "Failed to create SPOC link:",
            linkError.response?.data || linkError.message
          );
          // Don’t throw — the SPOC was created successfully
        }
    }
    return projectData as CrmProject;

      // return response.data as CrmProject;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Failed to create Project: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  // Opportunities
  static async getOpportunities() {
    const { data, error } = await supabase
      .from("crm_opportunities")
      .select(
        `
        *,
        client:crm_clients(*),
        account:crm_accounts(*),
        project:crm_projects(*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((opportunity) => ({
      ...opportunity,
      status: opportunity.status as "Open" | "In Progress" | "Closed" | "Lost",
    })) as CrmOpportunity[];
  }

  static async createOpportunity(
    opportunity: Omit<CrmOpportunity, "id" | "created_at" | "updated_at">
  ) {
    const { data, error } = await supabase
      .from("crm_opportunities")
      .insert(opportunity)
      .select()
      .single();

    if (error) throw error;
    return data as CrmOpportunity;
  }

  // Interactions
  static async getInteractions(limit = 50) {
    const { data, error } = await supabase
      .from("crm_interactions")
      .select(
        `
        *,
        client:crm_clients(*),
        account:crm_accounts(*),
        project:crm_projects(*),
        spoc:crm_spocs(*)
      `
      )
      .order("date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((interaction) => ({
      ...interaction,
      interaction_type: interaction.interaction_type as
        | "call"
        | "meeting"
        | "email"
        | "whatsapp"
        | "linkedin"
        | "onsite",
    })) as CrmInteraction[];
  }

  static async createInteraction(
    interaction: Omit<CrmInteraction, "id" | "created_at">
  ) {
    const { data, error } = await supabase
      .from("crm_interactions")
      .insert(interaction)
      .select()
      .single();

    if (error) throw error;
    return data as CrmInteraction;
  }

  // Documents
  static async getDocuments() {
    const { data, error } = await supabase
      .from("crm_documents")
      .select(
        `
        *,
        client:crm_clients(*),
        account:crm_accounts(*),
        project:crm_projects(*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async createDocument(
    document: Omit<CrmDocument, "id" | "created_at" | "updated_at">
  ) {
    const { data, error } = await supabase
      .from("crm_documents")
      .insert(document)
      .select()
      .single();

    if (error) throw error;
    return data as CrmDocument;
  }

  // Recruiter Assignments
  static async getRecruiterAssignments() {
    const { data, error } = await supabase
      .from("crm_recruiter_assignments")
      .select(
        `
        *,
        client:crm_clients(*),
        account:crm_accounts(*),
        project:crm_projects(*)
      `
      )
      .order("assigned_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async assignRecruiter(
    assignment: Omit<CrmRecruiterAssignment, "id" | "assigned_at">
  ) {
    const { data, error } = await supabase
      .from("crm_recruiter_assignments")
      .insert(assignment)
      .select()
      .single();

    if (error) throw error;
    return data as CrmRecruiterAssignment;
  }

  // Analytics & KPIs
  static async getMetrics(): Promise<CrmMetrics> {
    const [clientsData, interactionsData] = await Promise.all([
      supabase.from("crm_clients").select("id, status, health_score"),
      supabase
        .from("crm_interactions")
        .select("id")
        .gte(
          "created_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        ),
    ]);

    const clients = clientsData.data || [];
    const recentInteractions = interactionsData.data || [];

    return {
      total_clients: clients.length,
      active_clients: clients.filter((c) => c.status === "Active").length,
      total_jds: 0, // TODO: Link with hiring module
      avg_health_score:
        clients.reduce((sum, c) => sum + (c.health_score || 0), 0) /
          clients.length || 0,
      sla_compliance: 85, // TODO: Calculate based on SLA metrics
      recent_interactions: recentInteractions.length,
    };
  }

  static async getKPIs(): Promise<CrmKPIs> {
    // Mock data for now - will be calculated from real data
    return {
      client_engagement: {
        avg_response_time: 2.5,
        fulfillment_rate: 78,
        last_engagement_avg_days: 12,
        sla_compliance_percent: 85,
      },
      hiring_outcomes: {
        total_jds: 45,
        ft_hires: 23,
        contract_hires: 12,
        closure_rate: 77.8,
      },
      business_growth: {
        active_opportunities: 18,
        pipeline_value: 450000,
        monthly_growth: 12.5,
      },
    };
  }

  // Additional CRUD methods
  static async updateAccount(id: string, updates: Partial<CrmAccount>) {
    try {
      const response = await CrmApiClient.put<CrmAccount>(
        `/crm/accounts/${id}`,
        updates
      );
      return response.data as CrmAccount;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Failed to update Account: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  static async updateProject(id: string, updates: Partial<CrmProject>) {
    try {
      const response = await CrmApiClient.put<CrmProject>(
        `/crm/projects/${id}`,
        updates
      );
      return response.data as CrmProject;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Failed to update Account: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  static async updateOpportunity(id: string, updates: Partial<CrmOpportunity>) {
    const { data, error } = await supabase
      .from("crm_opportunities")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as CrmOpportunity;
  }

  static async deleteOpportunity(id: string) {
    const { error } = await supabase
      .from("crm_opportunities")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  static async deleteInteraction(id: string) {
    const { error } = await supabase
      .from("crm_interactions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  static async deleteSpoc(id: string) {
    const { error } = await supabase.from("crm_spocs").delete().eq("id", id);

    if (error) throw error;
  }

  // MSA Methods
  static async getMSAs(filters?: MSAFilters): Promise<MSA[]> {
    try {
       const mappedFilters: Record<string, string> = {};

    if (filters?.client_id) {
      mappedFilters["client_id"] = filters.client_id; // API expects client_name
    }

    if (filters?.status) {
      mappedFilters["status"] = filters.status;
    }

    if (filters?.search) {
      mappedFilters["msa_name"] = filters.search; // API expects msa_name
    }
      const response = await CrmApiClient.get(
        "/crm/contracts/msa",
        {params: mappedFilters,}
      );
      return response.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Unable to fetch MSAs: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  static async createMSA(msa: CreateMSAInput, selectedFile: File): Promise<MSA> {
    // Create FormData to match curl
  const formData = new FormData();
  if (selectedFile) formData.append("file", selectedFile);
  formData.append("data", JSON.stringify(msa)); // JSON payload as string

  try {
    const response = await CrmApiClient.post(
      "/crm/contracts/msa/createMSA",
      formData,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": undefined,
        },
      }
    );

    return response.data;
  } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Failed to createMSA: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  static async updateMSA(id: string, updates: UpdateMSAInput): Promise<MSA> {
     // Create FormData to match curl
  const formData = new FormData();
  const selectedFile = updates.doc_link
  if (selectedFile) formData.append("file", selectedFile);
  formData.append("data", JSON.stringify(updates)); // JSON payload as string
     try {
      const response = await CrmApiClient.put(
        `/crm/contracts/msa/${id}`,
        formData,
         {
        headers: {
          Accept: "application/json",
          "Content-Type": undefined,
        },
      }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Failed to update MSA: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  static async deleteMSA(id: string): Promise<void> {
    try {
      await CrmApiClient.delete(
        `/crm/contracts/msa/${id}`
      );
      return;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Unable to delete MSA: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  // SOW Methods
  static async getSOWs(filters?: SOWFilters): Promise<SOW[]> {
    try {
       const mappedFilters: Record<string, string> = {};

    if (filters?.client_id) {
      mappedFilters["client_id"] = filters.client_id; // API expects client_name
    }

    if (filters?.status) {
      mappedFilters["status"] = filters.status;
    }

    if (filters?.search) {
      mappedFilters["sow_name"] = filters.search; // API expects msa_name
    }
      const response = await CrmApiClient.get(
        "/crm/contracts/sows",
        {params: mappedFilters,}
      );
      return response.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Unable to fetch SOWs: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  static async createSOW(sow: CreateSOWInput, selectedFile: File): Promise<SOW> {
     // Create FormData to match curl
  const formData = new FormData();
  if (selectedFile) formData.append("file", selectedFile);
  formData.append("data", JSON.stringify(sow)); // JSON payload as string

  try {
    const response = await CrmApiClient.post(
      "/crm/contracts/sows/createSow",
      formData,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": undefined,
        },
      }
    );

    return response.data;
  } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Failed to create SOW: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  static async updateSOW(id: string, updates: UpdateSOWInput): Promise<SOW> {
     // Create FormData to match curl
  const formData = new FormData();
  const selectedFile = updates.doc_link
  if (selectedFile) formData.append("file", selectedFile);
  formData.append("data", JSON.stringify(updates)); // JSON payload as string
     try {
      const response = await CrmApiClient.put(
        `/crm/contracts/sows/${id}`,
        formData,
         {
        headers: {
          Accept: "application/json",
          "Content-Type": undefined,
        },
      }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Failed to update MSA: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  static async deleteSOW(id: string): Promise<void> {
     try {
      await CrmApiClient.delete(
        `/crm/contracts/sows/${id}`
      );
      return;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Unable to delete SOW: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  // Purchase Order Methods
  static async getPOs(filters?: POFilters): Promise<PurchaseOrder[]> {
    try {
       const mappedFilters: Record<string, string> = {};

    if (filters?.client_id) {
      mappedFilters["client_id"] = filters.client_id; // API expects client_name
    }

    if (filters?.status) {
      mappedFilters["status"] = filters.status;
    }

    if (filters?.search) {
      mappedFilters["po_number"] = filters.search; // API expects msa_name
    }
      const response = await CrmApiClient.get(
        "/crm/purchase-orders",
        {params: mappedFilters,}
      );
      return response.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Unable to fetch POs: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  static async createPO(po: CreatePOInput, selectedFile: File): Promise<PurchaseOrder> {
     // Create FormData to match curl
  const formData = new FormData();
  if (selectedFile) formData.append("file", selectedFile);
  formData.append("data", JSON.stringify(po)); // JSON payload as string

  try {
    const response = await CrmApiClient.post(
      "/crm/purchase-orders/create",
      formData,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": undefined,
        },
      }
    );

    return response.data;
  } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Failed to create PO: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  static async updatePO(id: string, updates: UpdatePOInput): Promise<PurchaseOrder> {
    const formData = new FormData();
  const selectedFile = updates.doc_link
  if (selectedFile) formData.append("file", selectedFile);
  formData.append("data", JSON.stringify(updates)); // JSON payload as string
     try {
      const response = await CrmApiClient.put(
        `/crm/purchase-orders/${id}`,
        formData,
        {
        headers: {
          Accept: "application/json",
          "Content-Type": undefined,
        },
      }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Failed to update PO: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  static async deletePO(id: string): Promise<void> {
   try {
      const response = await CrmApiClient.delete(
        `/crm/purchase-orders/${id}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Unable to delete PO: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
}
}