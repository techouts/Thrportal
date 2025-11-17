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
      candidate_communications: {
        Row: {
          attachments: string[] | null
          candidate_id: string
          content: string
          created_at: string
          created_by: string | null
          direction: string
          id: string
          metadata: Json | null
          subject: string | null
          type: string
        }
        Insert: {
          attachments?: string[] | null
          candidate_id: string
          content: string
          created_at?: string
          created_by?: string | null
          direction: string
          id?: string
          metadata?: Json | null
          subject?: string | null
          type: string
        }
        Update: {
          attachments?: string[] | null
          candidate_id?: string
          content?: string
          created_at?: string
          created_by?: string | null
          direction?: string
          id?: string
          metadata?: Json | null
          subject?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_communications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_communications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_documents: {
        Row: {
          candidate_id: string
          id: string
          name: string
          size: number
          type: string
          uploaded_at: string
          uploaded_by: string | null
          url: string
          verified: boolean | null
        }
        Insert: {
          candidate_id: string
          id?: string
          name: string
          size?: number
          type: string
          uploaded_at?: string
          uploaded_by?: string | null
          url: string
          verified?: boolean | null
        }
        Update: {
          candidate_id?: string
          id?: string
          name?: string
          size?: number
          type?: string
          uploaded_at?: string
          uploaded_by?: string | null
          url?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_documents_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_education: {
        Row: {
          candidate_id: string
          created_at: string
          degree: string
          end_year: number | null
          field: string
          grade: string | null
          id: string
          institution: string
          start_year: number
          type: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          degree: string
          end_year?: number | null
          field: string
          grade?: string | null
          id?: string
          institution: string
          start_year: number
          type?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          degree?: string
          end_year?: number | null
          field?: string
          grade?: string | null
          id?: string
          institution?: string
          start_year?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_education_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_experience: {
        Row: {
          achievements: string[] | null
          candidate_id: string
          company: string
          created_at: string
          ctc: number | null
          description: string | null
          designation: string
          end_date: string | null
          id: string
          is_current: boolean | null
          skills: string[] | null
          start_date: string
        }
        Insert: {
          achievements?: string[] | null
          candidate_id: string
          company: string
          created_at?: string
          ctc?: number | null
          description?: string | null
          designation: string
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          skills?: string[] | null
          start_date: string
        }
        Update: {
          achievements?: string[] | null
          candidate_id?: string
          company?: string
          created_at?: string
          ctc?: number | null
          description?: string | null
          designation?: string
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          skills?: string[] | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_experience_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_jd_links: {
        Row: {
          candidate_id: string
          created_at: string | null
          id: string
          jd_id: string
          linked_at: string | null
          linked_by: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          id?: string
          jd_id: string
          linked_at?: string | null
          linked_by?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          id?: string
          jd_id?: string
          linked_at?: string | null
          linked_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_jd_links_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_jd_links_jd_id_fkey"
            columns: ["jd_id"]
            isOneToOne: false
            referencedRelation: "jd_approvals"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_offers: {
        Row: {
          approval_workflow: Json | null
          candidate_id: string
          created_at: string
          ctc: number
          decline_reason: string | null
          designation: string
          id: string
          jd_id: string | null
          joining_date: string
          location: string
          no_show_date: string | null
          responded_at: string | null
          sent_at: string | null
          status: string
          terms: string[] | null
        }
        Insert: {
          approval_workflow?: Json | null
          candidate_id: string
          created_at?: string
          ctc: number
          decline_reason?: string | null
          designation: string
          id?: string
          jd_id?: string | null
          joining_date: string
          location: string
          no_show_date?: string | null
          responded_at?: string | null
          sent_at?: string | null
          status?: string
          terms?: string[] | null
        }
        Update: {
          approval_workflow?: Json | null
          candidate_id?: string
          created_at?: string
          ctc?: number
          decline_reason?: string | null
          designation?: string
          id?: string
          jd_id?: string | null
          joining_date?: string
          location?: string
          no_show_date?: string | null
          responded_at?: string | null
          sent_at?: string | null
          status?: string
          terms?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_offers_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_pool_links: {
        Row: {
          added_at: string
          added_by: string | null
          candidate_id: string
          id: string
          pool_id: string
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          candidate_id: string
          id?: string
          pool_id: string
        }
        Update: {
          added_at?: string
          added_by?: string | null
          candidate_id?: string
          id?: string
          pool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_pool_links_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_pool_links_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_pool_links_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "talent_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_tags: {
        Row: {
          category: string
          color: string
          id: string
          name: string
        }
        Insert: {
          category: string
          color?: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          color?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      candidate_timeline: {
        Row: {
          automatic_change: boolean | null
          candidate_id: string
          changed_by: string | null
          from_status: string | null
          id: string
          jd_id: string | null
          notes: string | null
          reason: string | null
          timestamp: string
          to_status: string
        }
        Insert: {
          automatic_change?: boolean | null
          candidate_id: string
          changed_by?: string | null
          from_status?: string | null
          id?: string
          jd_id?: string | null
          notes?: string | null
          reason?: string | null
          timestamp?: string
          to_status: string
        }
        Update: {
          automatic_change?: boolean | null
          candidate_id?: string
          changed_by?: string | null
          from_status?: string | null
          id?: string
          jd_id?: string | null
          notes?: string | null
          reason?: string | null
          timestamp?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_timeline_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_timeline_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          aadhaar_card_number: string | null
          address: string | null
          alternate_email: string | null
          avatar_url: string | null
          city: string | null
          consent: boolean | null
          country: string | null
          created_at: string
          created_by: string | null
          current_ctc: number | null
          date_of_birth: string | null
          email: string
          expected_ctc: number | null
          expected_ctc_type: string | null
          experience: number
          first_name: string | null
          gdpr_compliant: boolean | null
          github_url: string | null
          id: string
          job_type: string | null
          languages_known: string[] | null
          last_name: string | null
          linkedin_url: string | null
          location: string
          marital_status: string | null
          middle_name: string | null
          name: string | null
          notice_period: number | null
          pan_card_number: string | null
          passport_number: string | null
          phone: string | null
          pincode: string | null
          preferred_shift: string | null
          recruiter_owner: string | null
          skills: string[] | null
          source: string
          state: string | null
          status: string
          status_extended: string | null
          updated_at: string
          willing_to_relocate: boolean | null
        }
        Insert: {
          aadhaar_card_number?: string | null
          address?: string | null
          alternate_email?: string | null
          avatar_url?: string | null
          city?: string | null
          consent?: boolean | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          current_ctc?: number | null
          date_of_birth?: string | null
          email: string
          expected_ctc?: number | null
          expected_ctc_type?: string | null
          experience?: number
          first_name?: string | null
          gdpr_compliant?: boolean | null
          github_url?: string | null
          id?: string
          job_type?: string | null
          languages_known?: string[] | null
          last_name?: string | null
          linkedin_url?: string | null
          location: string
          marital_status?: string | null
          middle_name?: string | null
          name?: string | null
          notice_period?: number | null
          pan_card_number?: string | null
          passport_number?: string | null
          phone?: string | null
          pincode?: string | null
          preferred_shift?: string | null
          recruiter_owner?: string | null
          skills?: string[] | null
          source: string
          state?: string | null
          status?: string
          status_extended?: string | null
          updated_at?: string
          willing_to_relocate?: boolean | null
        }
        Update: {
          aadhaar_card_number?: string | null
          address?: string | null
          alternate_email?: string | null
          avatar_url?: string | null
          city?: string | null
          consent?: boolean | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          current_ctc?: number | null
          date_of_birth?: string | null
          email?: string
          expected_ctc?: number | null
          expected_ctc_type?: string | null
          experience?: number
          first_name?: string | null
          gdpr_compliant?: boolean | null
          github_url?: string | null
          id?: string
          job_type?: string | null
          languages_known?: string[] | null
          last_name?: string | null
          linkedin_url?: string | null
          location?: string
          marital_status?: string | null
          middle_name?: string | null
          name?: string | null
          notice_period?: number | null
          pan_card_number?: string | null
          passport_number?: string | null
          phone?: string | null
          pincode?: string | null
          preferred_shift?: string | null
          recruiter_owner?: string | null
          skills?: string[] | null
          source?: string
          state?: string | null
          status?: string
          status_extended?: string | null
          updated_at?: string
          willing_to_relocate?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_spoc_mappings: {
        Row: {
          assigned_recruiter_ids: string[] | null
          client_id: string
          created_at: string | null
          created_by: string | null
          id: string
          primary_spoc_id: string
          secondary_spoc_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_recruiter_ids?: string[] | null
          client_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          primary_spoc_id: string
          secondary_spoc_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_recruiter_ids?: string[] | null
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          primary_spoc_id?: string
          secondary_spoc_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_spoc_mappings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_spoc_mappings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_spoc_mappings_primary_spoc_id_fkey"
            columns: ["primary_spoc_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_spoc_mappings_secondary_spoc_id_fkey"
            columns: ["secondary_spoc_id"]
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
          billing_currency: string | null
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          primary_spoc_id: string | null
          sla_override: string | null
          status: string
          type: string | null
          updated_at: string
        }
        Insert: {
          billing_currency?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          primary_spoc_id?: string | null
          sla_override?: string | null
          status?: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          billing_currency?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          primary_spoc_id?: string | null
          sla_override?: string | null
          status?: string
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
          name: string
          region: string | null
          sla_reference_url: string | null
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
          name: string
          region?: string | null
          sla_reference_url?: string | null
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
          name?: string
          region?: string | null
          sla_reference_url?: string | null
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
      crm_spoc_links: {
        Row: {
          created_at: string
          created_by: string | null
          entity_id: string
          entity_type: string
          id: string
          role: string
          spoc_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          entity_id: string
          entity_type: string
          id?: string
          role: string
          spoc_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          role?: string
          spoc_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_spoc_links_spoc_id_fkey"
            columns: ["spoc_id"]
            isOneToOne: false
            referencedRelation: "crm_spocs"
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
      interview_slots: {
        Row: {
          client_id: string
          created_at: string
          created_by: string
          date: string
          from_time: string
          id: string
          invite_id: string | null
          jd_id: string | null
          mode: Database["public"]["Enums"]["interview_mode"]
          notes: string | null
          panel_text: string | null
          project_id: string
          status: Database["public"]["Enums"]["slot_status"]
          to_time: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by: string
          date: string
          from_time: string
          id?: string
          invite_id?: string | null
          jd_id?: string | null
          mode?: Database["public"]["Enums"]["interview_mode"]
          notes?: string | null
          panel_text?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["slot_status"]
          to_time: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string
          date?: string
          from_time?: string
          id?: string
          invite_id?: string | null
          jd_id?: string | null
          mode?: Database["public"]["Enums"]["interview_mode"]
          notes?: string | null
          panel_text?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["slot_status"]
          to_time?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
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
          additional_notes: string | null
          approval_status: string | null
          approver_names: string[] | null
          attachments: Json | null
          business_justification: string | null
          business_unit: string | null
          client_name: string | null
          contract_period_months: number | null
          cost_center: string | null
          created_at: string
          created_by: string | null
          ctc_annual_max: number | null
          ctc_annual_min: number | null
          ctc_monthly_max: number | null
          ctc_monthly_min: number | null
          currency: string | null
          current_step: number | null
          department: string | null
          employment_type: string | null
          experience_max: number | null
          experience_min: number | null
          headcount: number | null
          id: string
          interview_rounds: Json | null
          is_internal: boolean | null
          is_replacement: boolean | null
          jd_id: string
          job_title: string | null
          job_type: string | null
          opex_capex: string | null
          pay_type: string | null
          positions: number | null
          priority: string | null
          project_name: string | null
          replacement_for: string | null
          required_skills: Json | null
          responsibilities: Json | null
          resume_deadline: string | null
          salary_band_max: number | null
          salary_band_min: number | null
          short_summary: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          target_date: string | null
          target_doj: string | null
          target_first_submission_days: number | null
          updated_at: string
          work_location: Json | null
        }
        Insert: {
          additional_notes?: string | null
          approval_status?: string | null
          approver_names?: string[] | null
          attachments?: Json | null
          business_justification?: string | null
          business_unit?: string | null
          client_name?: string | null
          contract_period_months?: number | null
          cost_center?: string | null
          created_at?: string
          created_by?: string | null
          ctc_annual_max?: number | null
          ctc_annual_min?: number | null
          ctc_monthly_max?: number | null
          ctc_monthly_min?: number | null
          currency?: string | null
          current_step?: number | null
          department?: string | null
          employment_type?: string | null
          experience_max?: number | null
          experience_min?: number | null
          headcount?: number | null
          id?: string
          interview_rounds?: Json | null
          is_internal?: boolean | null
          is_replacement?: boolean | null
          jd_id: string
          job_title?: string | null
          job_type?: string | null
          opex_capex?: string | null
          pay_type?: string | null
          positions?: number | null
          priority?: string | null
          project_name?: string | null
          replacement_for?: string | null
          required_skills?: Json | null
          responsibilities?: Json | null
          resume_deadline?: string | null
          salary_band_max?: number | null
          salary_band_min?: number | null
          short_summary?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          target_date?: string | null
          target_doj?: string | null
          target_first_submission_days?: number | null
          updated_at?: string
          work_location?: Json | null
        }
        Update: {
          additional_notes?: string | null
          approval_status?: string | null
          approver_names?: string[] | null
          attachments?: Json | null
          business_justification?: string | null
          business_unit?: string | null
          client_name?: string | null
          contract_period_months?: number | null
          cost_center?: string | null
          created_at?: string
          created_by?: string | null
          ctc_annual_max?: number | null
          ctc_annual_min?: number | null
          ctc_monthly_max?: number | null
          ctc_monthly_min?: number | null
          currency?: string | null
          current_step?: number | null
          department?: string | null
          employment_type?: string | null
          experience_max?: number | null
          experience_min?: number | null
          headcount?: number | null
          id?: string
          interview_rounds?: Json | null
          is_internal?: boolean | null
          is_replacement?: boolean | null
          jd_id?: string
          job_title?: string | null
          job_type?: string | null
          opex_capex?: string | null
          pay_type?: string | null
          positions?: number | null
          priority?: string | null
          project_name?: string | null
          replacement_for?: string | null
          required_skills?: Json | null
          responsibilities?: Json | null
          resume_deadline?: string | null
          salary_band_max?: number | null
          salary_band_min?: number | null
          short_summary?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          target_date?: string | null
          target_doj?: string | null
          target_first_submission_days?: number | null
          updated_at?: string
          work_location?: Json | null
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
      jd_ownership_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          client_spoc: string | null
          collaborator_ids: string[] | null
          created_at: string | null
          id: string
          jd_id: string
          primary_recruiter_id: string | null
          staffing_manager_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          client_spoc?: string | null
          collaborator_ids?: string[] | null
          created_at?: string | null
          id?: string
          jd_id: string
          primary_recruiter_id?: string | null
          staffing_manager_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          client_spoc?: string | null
          collaborator_ids?: string[] | null
          created_at?: string | null
          id?: string
          jd_id?: string
          primary_recruiter_id?: string | null
          staffing_manager_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jd_ownership_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jd_ownership_assignments_jd_id_fkey"
            columns: ["jd_id"]
            isOneToOne: true
            referencedRelation: "jd_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jd_ownership_assignments_primary_recruiter_id_fkey"
            columns: ["primary_recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jd_ownership_assignments_staffing_manager_id_fkey"
            columns: ["staffing_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jd_ownership_metadata: {
        Row: {
          created_at: string | null
          id: string
          is_locked: boolean | null
          jd_id: string
          locked_at: string | null
          locked_by: string | null
          open_pool_flag: boolean | null
          per_recruiter_submission_cap: number | null
          sla_deadline: string | null
          sla_status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          jd_id: string
          locked_at?: string | null
          locked_by?: string | null
          open_pool_flag?: boolean | null
          per_recruiter_submission_cap?: number | null
          sla_deadline?: string | null
          sla_status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          jd_id?: string
          locked_at?: string | null
          locked_by?: string | null
          open_pool_flag?: boolean | null
          per_recruiter_submission_cap?: number | null
          sla_deadline?: string | null
          sla_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jd_ownership_metadata_jd_id_fkey"
            columns: ["jd_id"]
            isOneToOne: true
            referencedRelation: "jd_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jd_ownership_metadata_locked_by_fkey"
            columns: ["locked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
        Relationships: [
          {
            foreignKeyName: "fk_msas_client_id"
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
        Relationships: [
          {
            foreignKeyName: "fk_purchase_orders_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
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
      slot_assignments: {
        Row: {
          booked_at: string
          candidate_email: string | null
          candidate_name: string
          candidate_phone: string | null
          id: string
          notes: string | null
          panel_text: string | null
          recruiter_id: string
          slot_id: string
        }
        Insert: {
          booked_at?: string
          candidate_email?: string | null
          candidate_name: string
          candidate_phone?: string | null
          id?: string
          notes?: string | null
          panel_text?: string | null
          recruiter_id: string
          slot_id: string
        }
        Update: {
          booked_at?: string
          candidate_email?: string | null
          candidate_name?: string
          candidate_phone?: string | null
          id?: string
          notes?: string | null
          panel_text?: string | null
          recruiter_id?: string
          slot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slot_assignments_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: true
            referencedRelation: "interview_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      slot_change_log: {
        Row: {
          action: Database["public"]["Enums"]["slot_action"]
          actor_id: string
          details: Json | null
          id: string
          no_show_type: Database["public"]["Enums"]["no_show_type"] | null
          reason_code: string | null
          reason_text: string | null
          slot_id: string
          timestamp: string
        }
        Insert: {
          action: Database["public"]["Enums"]["slot_action"]
          actor_id: string
          details?: Json | null
          id?: string
          no_show_type?: Database["public"]["Enums"]["no_show_type"] | null
          reason_code?: string | null
          reason_text?: string | null
          slot_id: string
          timestamp?: string
        }
        Update: {
          action?: Database["public"]["Enums"]["slot_action"]
          actor_id?: string
          details?: Json | null
          id?: string
          no_show_type?: Database["public"]["Enums"]["no_show_type"] | null
          reason_code?: string | null
          reason_text?: string | null
          slot_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "slot_change_log_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "interview_slots"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "fk_sows_msa_id"
            columns: ["msa_id"]
            isOneToOne: false
            referencedRelation: "msas"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_pools: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          shared_with: string[] | null
          tags: string[] | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          shared_with?: string[] | null
          tags?: string[] | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          shared_with?: string[] | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "talent_pools_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_expire_slots: { Args: never; Returns: undefined }
      get_approver_names_from_chain: { Args: never; Returns: string[] }
      get_current_user_role: { Args: never; Returns: string }
      get_jd_ownerships_with_details: {
        Args: never
        Returns: {
          assignment_updated_at: string
          client_name: string
          client_spoc: string
          collaborator_ids: string[]
          collaborator_names: string[]
          created_at: string
          is_locked: boolean
          jd_id: string
          jd_updated_at: string
          job_title: string
          open_pool_flag: boolean
          per_recruiter_submission_cap: number
          primary_recruiter_id: string
          primary_recruiter_name: string
          sla_deadline: string
          sla_status: string
          staffing_manager_id: string
          staffing_manager_name: string
          status: string
        }[]
      }
      get_recruiter_profiles: {
        Args: never
        Returns: {
          display_name: string
          first_name: string
          id: string
          last_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "ADMIN"
        | "MANAGEMENT"
        | "FINANCE_MANAGER"
        | "STAFFING_MANAGER"
        | "HR_MANAGER"
        | "HR_LEAD"
        | "HIRING_MANAGER"
        | "RECRUITER"
        | "PROJECT_LEAD"
        | "DELIVERY_HEAD"
        | "PAYROLL_SPECIALIST"
        | "FINANCE_ANALYST"
        | "IT_HELPDESK"
        | "AUDITOR_RO"
        | "DPO_PRIVACY"
        | "MANAGER"
        | "EMPLOYEE"
        | "VIEWER"
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
      interview_mode: "virtual" | "onsite"
      invoice_status: "draft" | "submitted" | "approved" | "paid" | "rejected"
      no_show_type: "candidate" | "panel" | "both"
      parser_status: "pending" | "success" | "failed" | "manual"
      slot_action:
        | "created"
        | "assigned"
        | "used"
        | "no_show"
        | "rescheduled"
        | "expired"
        | "cancelled"
        | "edited"
      slot_status: "available" | "booked" | "used" | "expired" | "cancelled"
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
      app_role: [
        "ADMIN",
        "MANAGEMENT",
        "FINANCE_MANAGER",
        "STAFFING_MANAGER",
        "HR_MANAGER",
        "HR_LEAD",
        "HIRING_MANAGER",
        "RECRUITER",
        "PROJECT_LEAD",
        "DELIVERY_HEAD",
        "PAYROLL_SPECIALIST",
        "FINANCE_ANALYST",
        "IT_HELPDESK",
        "AUDITOR_RO",
        "DPO_PRIVACY",
        "MANAGER",
        "EMPLOYEE",
        "VIEWER",
      ],
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
      interview_mode: ["virtual", "onsite"],
      invoice_status: ["draft", "submitted", "approved", "paid", "rejected"],
      no_show_type: ["candidate", "panel", "both"],
      parser_status: ["pending", "success", "failed", "manual"],
      slot_action: [
        "created",
        "assigned",
        "used",
        "no_show",
        "rescheduled",
        "expired",
        "cancelled",
        "edited",
      ],
      slot_status: ["available", "booked", "used", "expired", "cancelled"],
    },
  },
} as const
