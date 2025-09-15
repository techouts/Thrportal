export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      crm_accounts: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          primary_spoc_id: string | null
          sla_override: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          primary_spoc_id?: string | null
          sla_override?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          primary_spoc_id?: string | null
          sla_override?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_accounts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_crm_accounts_primary_spoc"
            columns: ["primary_spoc_id"]
            isOneToOne: false
            referencedRelation: "crm_spocs"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_clients: {
        Row: {
          billing_model: string | null
          contract_type: string | null
          created_at: string
          created_by: string | null
          domain: string | null
          gst_vat: string | null
          health_score: number | null
          id: string
          industry: string | null
          location: string | null
          name: string
          sla_reference: string | null
          status: string
          updated_at: string
        }
        Insert: {
          billing_model?: string | null
          contract_type?: string | null
          created_at?: string
          created_by?: string | null
          domain?: string | null
          gst_vat?: string | null
          health_score?: number | null
          id?: string
          industry?: string | null
          location?: string | null
          name: string
          sla_reference?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          billing_model?: string | null
          contract_type?: string | null
          created_at?: string
          created_by?: string | null
          domain?: string | null
          gst_vat?: string | null
          health_score?: number | null
          id?: string
          industry?: string | null
          location?: string | null
          name?: string
          sla_reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_documents: {
        Row: {
          account_id: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          document_type: string | null
          id: string
          name: string
          project_id: string | null
          renewal_alert_sent: boolean | null
          sharepoint_url: string
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          account_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          document_type?: string | null
          id?: string
          name: string
          project_id?: string | null
          renewal_alert_sent?: boolean | null
          sharepoint_url: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          account_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          document_type?: string | null
          id?: string
          name?: string
          project_id?: string | null
          renewal_alert_sent?: boolean | null
          sharepoint_url?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_documents_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "crm_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_interactions: {
        Row: {
          account_id: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          date: string
          engagement_score: number | null
          id: string
          interaction_type: string
          is_synced: boolean | null
          next_step: string | null
          notes: string | null
          outcome: string | null
          project_id: string | null
          spoc_id: string | null
        }
        Insert: {
          account_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          engagement_score?: number | null
          id?: string
          interaction_type: string
          is_synced?: boolean | null
          next_step?: string | null
          notes?: string | null
          outcome?: string | null
          project_id?: string | null
          spoc_id?: string | null
        }
        Update: {
          account_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          engagement_score?: number | null
          id?: string
          interaction_type?: string
          is_synced?: boolean | null
          next_step?: string | null
          notes?: string | null
          outcome?: string | null
          project_id?: string | null
          spoc_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_interactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_interactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_interactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "crm_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_interactions_spoc_id_fkey"
            columns: ["spoc_id"]
            isOneToOne: false
            referencedRelation: "crm_spocs"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_opportunities: {
        Row: {
          account_id: string | null
          client_id: string
          contract_count: number | null
          created_at: string
          created_by: string | null
          ft_count: number | null
          id: string
          jd_count: number | null
          notes: string | null
          project_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          client_id: string
          contract_count?: number | null
          created_at?: string
          created_by?: string | null
          ft_count?: number | null
          id?: string
          jd_count?: number | null
          notes?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          client_id?: string
          contract_count?: number | null
          created_at?: string
          created_by?: string | null
          ft_count?: number | null
          id?: string
          jd_count?: number | null
          notes?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_opportunities_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "crm_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_projects: {
        Row: {
          account_id: string | null
          client_id: string
          contract_target: number | null
          created_at: string
          created_by: string | null
          end_date: string | null
          ft_target: number | null
          id: string
          name: string
          owner_id: string | null
          primary_spoc_id: string | null
          priority: string | null
          skills: string[] | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          client_id: string
          contract_target?: number | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          ft_target?: number | null
          id?: string
          name: string
          owner_id?: string | null
          primary_spoc_id?: string | null
          priority?: string | null
          skills?: string[] | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          client_id?: string
          contract_target?: number | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          ft_target?: number | null
          id?: string
          name?: string
          owner_id?: string | null
          primary_spoc_id?: string | null
          priority?: string | null
          skills?: string[] | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_projects_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_projects_primary_spoc_id_fkey"
            columns: ["primary_spoc_id"]
            isOneToOne: false
            referencedRelation: "crm_spocs"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_recruiter_assignments: {
        Row: {
          account_id: string | null
          assigned_at: string
          assigned_by: string | null
          client_id: string | null
          id: string
          project_id: string | null
          recruiter_id: string
        }
        Insert: {
          account_id?: string | null
          assigned_at?: string
          assigned_by?: string | null
          client_id?: string | null
          id?: string
          project_id?: string | null
          recruiter_id: string
        }
        Update: {
          account_id?: string | null
          assigned_at?: string
          assigned_by?: string | null
          client_id?: string | null
          id?: string
          project_id?: string | null
          recruiter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_recruiter_assignments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_recruiter_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_recruiter_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "crm_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_spocs: {
        Row: {
          account_id: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          last_contacted_at: string | null
          linkedin_url: string | null
          name: string
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          last_contacted_at?: string | null
          linkedin_url?: string | null
          name: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          last_contacted_at?: string | null
          linkedin_url?: string | null
          name?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_spocs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_spocs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_unit: string | null
          created_at: string
          department: string | null
          display_name: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          business_unit?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          business_unit?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
