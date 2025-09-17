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
      allocations: {
        Row: {
          allocation_pct: number
          bill_rate: number
          cost_rate: number
          created_at: string
          employee_id: string
          end_date: string | null
          id: string
          project_id: string | null
          role_id: string
          start_date: string
          type: string
          updated_at: string
        }
        Insert: {
          allocation_pct?: number
          bill_rate?: number
          cost_rate?: number
          created_at?: string
          employee_id: string
          end_date?: string | null
          id?: string
          project_id?: string | null
          role_id: string
          start_date: string
          type?: string
          updated_at?: string
        }
        Update: {
          allocation_pct?: number
          bill_rate?: number
          cost_rate?: number
          created_at?: string
          employee_id?: string
          end_date?: string | null
          id?: string
          project_id?: string | null
          role_id?: string
          start_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "allocations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_logs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          justification: string | null
          reason: string
          requested_by: string | null
          status: Database["public"]["Enums"]["approval_status"]
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          justification?: string | null
          reason: string
          requested_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          justification?: string | null
          reason?: string
          requested_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Relationships: []
      }
      approval_rules: {
        Row: {
          approval_chain: Json
          conditions: Json
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          rule_name: string
          updated_at: string
        }
        Insert: {
          approval_chain?: Json
          conditions?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          rule_name: string
          updated_at?: string
        }
        Update: {
          approval_chain?: Json
          conditions?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          rule_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_assignments: {
        Row: {
          allocation_pct: number | null
          bill_rate: number | null
          billable_flag: boolean | null
          client_approval_flag: boolean | null
          cost_rate: number | null
          created_at: string
          created_by: string | null
          employee_id: string
          end_date: string | null
          id: string
          location_type: string | null
          project_id: string
          role: string
          shadow_flag: boolean | null
          sow_id: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          allocation_pct?: number | null
          bill_rate?: number | null
          billable_flag?: boolean | null
          client_approval_flag?: boolean | null
          cost_rate?: number | null
          created_at?: string
          created_by?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          location_type?: string | null
          project_id: string
          role: string
          shadow_flag?: boolean | null
          sow_id?: string | null
          start_date: string
          updated_at?: string
        }
        Update: {
          allocation_pct?: number | null
          bill_rate?: number | null
          billable_flag?: boolean | null
          client_approval_flag?: boolean | null
          cost_rate?: number | null
          created_at?: string
          created_by?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          location_type?: string | null
          project_id?: string
          role?: string
          shadow_flag?: boolean | null
          sow_id?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      invoice_lines: {
        Row: {
          amount: number
          created_at: string
          employee_id: string | null
          hours: number | null
          id: string
          invoice_id: string
          po_id: string | null
          role: string | null
          sow_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          employee_id?: string | null
          hours?: number | null
          id?: string
          invoice_id: string
          po_id?: string | null
          role?: string | null
          sow_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          employee_id?: string | null
          hours?: number | null
          id?: string
          invoice_id?: string
          po_id?: string | null
          role?: string | null
          sow_id?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          created_by: string | null
          currency: string | null
          file_link: string | null
          id: string
          invoice_number: string | null
          parsed_data: Json | null
          parser_status: Database["public"]["Enums"]["parser_status"] | null
          period_end: string
          period_start: string
          po_id: string | null
          project_id: string | null
          sow_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          file_link?: string | null
          id?: string
          invoice_number?: string | null
          parsed_data?: Json | null
          parser_status?: Database["public"]["Enums"]["parser_status"] | null
          period_end: string
          period_start: string
          po_id?: string | null
          project_id?: string | null
          sow_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          file_link?: string | null
          id?: string
          invoice_number?: string | null
          parsed_data?: Json | null
          parser_status?: Database["public"]["Enums"]["parser_status"] | null
          period_end?: string
          period_start?: string
          po_id?: string | null
          project_id?: string | null
          sow_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Relationships: []
      }
      jd_approval_steps: {
        Row: {
          approver_id: string | null
          approver_role: string | null
          assigned_at: string | null
          comments: string | null
          completed_at: string | null
          created_at: string
          escalated_at: string | null
          escalated_to: string | null
          id: string
          jd_approval_id: string
          sla_hours: number | null
          status: Database["public"]["Enums"]["approval_step_status"]
          step_number: number
          updated_at: string
        }
        Insert: {
          approver_id?: string | null
          approver_role?: string | null
          assigned_at?: string | null
          comments?: string | null
          completed_at?: string | null
          created_at?: string
          escalated_at?: string | null
          escalated_to?: string | null
          id?: string
          jd_approval_id: string
          sla_hours?: number | null
          status?: Database["public"]["Enums"]["approval_step_status"]
          step_number: number
          updated_at?: string
        }
        Update: {
          approver_id?: string | null
          approver_role?: string | null
          assigned_at?: string | null
          comments?: string | null
          completed_at?: string | null
          created_at?: string
          escalated_at?: string | null
          escalated_to?: string | null
          id?: string
          jd_approval_id?: string
          sla_hours?: number | null
          status?: Database["public"]["Enums"]["approval_step_status"]
          step_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jd_approval_steps_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jd_approval_steps_escalated_to_fkey"
            columns: ["escalated_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jd_approval_steps_jd_approval_id_fkey"
            columns: ["jd_approval_id"]
            isOneToOne: false
            referencedRelation: "jd_approvals"
            referencedColumns: ["id"]
          },
        ]
      }
      jd_approvals: {
        Row: {
          attachments: Json | null
          business_justification: string | null
          client_name: string | null
          cost_center: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          current_step: number | null
          headcount: number | null
          id: string
          is_replacement: boolean | null
          jd_id: string
          opex_capex: string | null
          project_name: string | null
          replacement_for: string | null
          salary_band_max: number | null
          salary_band_min: number | null
          submitted_at: string | null
          submitted_by: string | null
          target_doj: string | null
          target_first_submission_days: number | null
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          business_justification?: string | null
          client_name?: string | null
          cost_center?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          current_step?: number | null
          headcount?: number | null
          id?: string
          is_replacement?: boolean | null
          jd_id: string
          opex_capex?: string | null
          project_name?: string | null
          replacement_for?: string | null
          salary_band_max?: number | null
          salary_band_min?: number | null
          submitted_at?: string | null
          submitted_by?: string | null
          target_doj?: string | null
          target_first_submission_days?: number | null
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          business_justification?: string | null
          client_name?: string | null
          cost_center?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          current_step?: number | null
          headcount?: number | null
          id?: string
          is_replacement?: boolean | null
          jd_id?: string
          opex_capex?: string | null
          project_name?: string | null
          replacement_for?: string | null
          salary_band_max?: number | null
          salary_band_min?: number | null
          submitted_at?: string | null
          submitted_by?: string | null
          target_doj?: string | null
          target_first_submission_days?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jd_approvals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jd_approvals_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jd_audit_log: {
        Row: {
          action: Database["public"]["Enums"]["approval_action"]
          actor_id: string | null
          actor_role: string | null
          comments: string | null
          details: Json | null
          field_changes: Json | null
          id: string
          jd_approval_id: string | null
          jd_id: string | null
          timestamp: string
        }
        Insert: {
          action: Database["public"]["Enums"]["approval_action"]
          actor_id?: string | null
          actor_role?: string | null
          comments?: string | null
          details?: Json | null
          field_changes?: Json | null
          id?: string
          jd_approval_id?: string | null
          jd_id?: string | null
          timestamp?: string
        }
        Update: {
          action?: Database["public"]["Enums"]["approval_action"]
          actor_id?: string | null
          actor_role?: string | null
          comments?: string | null
          details?: Json | null
          field_changes?: Json | null
          id?: string
          jd_approval_id?: string | null
          jd_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "jd_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jd_audit_log_jd_approval_id_fkey"
            columns: ["jd_approval_id"]
            isOneToOne: false
            referencedRelation: "jd_approvals"
            referencedColumns: ["id"]
          },
        ]
      }
      msas: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          doc_link: string | null
          id: string
          status: Database["public"]["Enums"]["contract_status"]
          title: string
          updated_at: string
          valid_from: string
          valid_to: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          doc_link?: string | null
          id?: string
          status?: Database["public"]["Enums"]["contract_status"]
          title: string
          updated_at?: string
          valid_from: string
          valid_to: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          doc_link?: string | null
          id?: string
          status?: Database["public"]["Enums"]["contract_status"]
          title?: string
          updated_at?: string
          valid_from?: string
          valid_to?: string
        }
        Relationships: []
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
      project_sow_links: {
        Row: {
          created_at: string
          id: string
          project_id: string
          sow_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          sow_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          sow_id?: string
        }
        Relationships: []
      }
      project_spoc_links: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          project_id: string
          role: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          project_id: string
          role: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          project_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_spoc_links_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_spocs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_spoc_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          account_id: string
          allow_expenses: boolean
          allow_non_billable: boolean
          billing_type: string
          code: string
          created_at: string
          end_date: string | null
          id: string
          name: string
          pm_user_id: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          allow_expenses?: boolean
          allow_non_billable?: boolean
          billing_type?: string
          code: string
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          pm_user_id?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          allow_expenses?: boolean
          allow_non_billable?: boolean
          billing_type?: string
          code?: string
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          pm_user_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_pm_user_id_fkey"
            columns: ["pm_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          currency: string | null
          doc_link: string | null
          id: string
          po_number: string
          remaining_amount: number
          status: Database["public"]["Enums"]["contract_status"]
          total_amount: number
          updated_at: string
          valid_from: string
          valid_to: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          doc_link?: string | null
          id?: string
          po_number: string
          remaining_amount: number
          status?: Database["public"]["Enums"]["contract_status"]
          total_amount: number
          updated_at?: string
          valid_from: string
          valid_to: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          doc_link?: string | null
          id?: string
          po_number?: string
          remaining_amount?: number
          status?: Database["public"]["Enums"]["contract_status"]
          total_amount?: number
          updated_at?: string
          valid_from?: string
          valid_to?: string
        }
        Relationships: []
      }
      roles_catalog: {
        Row: {
          created_at: string
          id: string
          name: string
          standard_rate: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          standard_rate?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          standard_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      sow_po_allocations: {
        Row: {
          allocated_amount: number
          created_at: string
          id: string
          po_id: string
          priority_order: number
          sow_id: string
        }
        Insert: {
          allocated_amount: number
          created_at?: string
          id?: string
          po_id: string
          priority_order?: number
          sow_id: string
        }
        Update: {
          allocated_amount?: number
          created_at?: string
          id?: string
          po_id?: string
          priority_order?: number
          sow_id?: string
        }
        Relationships: []
      }
      sows: {
        Row: {
          amount_cap: number | null
          created_at: string
          created_by: string | null
          currency: string | null
          doc_link: string | null
          id: string
          msa_id: string
          rate_cards: Json | null
          role_caps: Json | null
          status: Database["public"]["Enums"]["contract_status"]
          title: string
          updated_at: string
          valid_from: string
          valid_to: string
        }
        Insert: {
          amount_cap?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          doc_link?: string | null
          id?: string
          msa_id: string
          rate_cards?: Json | null
          role_caps?: Json | null
          status?: Database["public"]["Enums"]["contract_status"]
          title: string
          updated_at?: string
          valid_from: string
          valid_to: string
        }
        Update: {
          amount_cap?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          doc_link?: string | null
          id?: string
          msa_id?: string
          rate_cards?: Json | null
          role_caps?: Json | null
          status?: Database["public"]["Enums"]["contract_status"]
          title?: string
          updated_at?: string
          valid_from?: string
          valid_to?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assignees: string[] | null
          billable: boolean
          created_at: string
          description: string | null
          end_date: string | null
          est_hours: number
          id: string
          name: string
          phase: string | null
          project_id: string
          stage: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assignees?: string[] | null
          billable?: boolean
          created_at?: string
          description?: string | null
          end_date?: string | null
          est_hours?: number
          id?: string
          name: string
          phase?: string | null
          project_id: string
          stage?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assignees?: string[] | null
          billable?: boolean
          created_at?: string
          description?: string | null
          end_date?: string | null
          est_hours?: number
          id?: string
          name?: string
          phase?: string | null
          project_id?: string
          stage?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      approval_action:
        | "submit"
        | "approve"
        | "reject"
        | "request_changes"
        | "reassign"
        | "override"
      approval_status: "pending" | "approved" | "rejected"
      approval_step_status:
        | "pending"
        | "approved"
        | "rejected"
        | "changes_requested"
        | "skipped"
      contract_status: "draft" | "active" | "expired" | "terminated"
      invoice_status: "draft" | "submitted" | "approved" | "paid" | "rejected"
      parser_status: "pending" | "success" | "failed" | "manual"
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
    Enums: {
      approval_action: [
        "submit",
        "approve",
        "reject",
        "request_changes",
        "reassign",
        "override",
      ],
      approval_status: ["pending", "approved", "rejected"],
      approval_step_status: [
        "pending",
        "approved",
        "rejected",
        "changes_requested",
        "skipped",
      ],
      contract_status: ["draft", "active", "expired", "terminated"],
      invoice_status: ["draft", "submitted", "approved", "paid", "rejected"],
      parser_status: ["pending", "success", "failed", "manual"],
    },
  },
} as const
