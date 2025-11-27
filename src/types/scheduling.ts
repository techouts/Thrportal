export interface InterviewerDetail {
  name: string
  email?: string
  phone?: string
}

export interface InterviewSlot {
  id: string
  client_id: string
  project_id: string
  jd_id?: string
  panel_text?: string
  date: string
  from_time: string
  to_time: string
  mode: 'virtual' | 'onsite'
  notes?: string
  status: 'available' | 'booked' | 'used' | 'expired' | 'cancelled'
  invite_id?: string
  interviewer_details?: InterviewerDetail[]
  created_by: string
  created_at: string
  updated_by?: string
  updated_at: string
  
  // Joined data
  client_name?: string
  project_name?: string
  created_by_name?: string
  assignment?: SlotAssignment
}

export interface SlotAssignment {
  id: string
  slot_id: string
  candidate_name: string
  candidate_email?: string
  candidate_phone?: string
  recruiter_id: string
  panel_text?: string
  notes?: string
  booked_at: string
  
  // Joined data
  recruiter_name?: string
}

export interface SlotChangeLog {
  id: string
  slot_id: string
  action: 'created' | 'assigned' | 'used' | 'no_show' | 'rescheduled' | 'expired' | 'cancelled' | 'edited'
  reason_code?: string
  reason_text?: string
  no_show_type?: 'candidate' | 'panel' | 'both'
  actor_id: string
  timestamp: string
  details?: Record<string, any>
  
  // Joined data
  actor_name?: string
}

export interface SchedulingFilters {
  client_id?: string
  project_id?: string
  date_from?: string
  date_to?: string
  status?: string[]
  mode?: string
}

export interface SchedulingDashboardStats {
  total_slots: number
  available_slots: number
  booked_slots: number
  used_slots: number
  expired_slots: number
  fill_rate: number
  candidate_no_show_rate: number
  panel_no_show_rate: number
  upcoming_tomorrow: number
  upcoming_3days: number
  upcoming_7days: number
  upcoming_10days: number
}

export interface SchedulingMetrics {
  slots_by_client: Array<{ client_name: string; total: number; used: number; fill_rate: number }>
  slots_by_mode: Array<{ mode: string; count: number; percentage: number }>
  aging_available_slots: Array<{ slot_id: string; days_old: number; client_name: string; project_name: string }>
  reschedule_reasons: Array<{ reason: string; count: number; percentage: number }>
  recruiter_utilization: Array<{ recruiter_name: string; converted_slots: number; total_assigned: number }>
}

export interface CreateSlotRequest {
  client_id: string
  project_id: string
  jd_id?: string
  panel_text?: string
  date: string
  from_time: string
  to_time: string
  mode: 'virtual' | 'onsite'
  notes?: string
  interviewer_details?: InterviewerDetail[]
}

export interface AssignCandidateRequest {
  slot_id: string
  candidate_name: string
  candidate_email?: string
  candidate_phone?: string
  recruiter_id: string
  panel_text?: string
  notes?: string
}

export interface UpdateSlotStatusRequest {
  slot_id: string
  status: 'used' | 'no_show' | 'cancelled' | 'rescheduled'
  reason_code?: string
  reason_text?: string
  no_show_type?: 'candidate' | 'panel' | 'both'
}

export interface BulkSlotEntry {
  client_id: string
  project_id: string
  slots: Array<{
    jd_id?: string
    panel_text?: string
    date: string
    from_time: string
    to_time: string
    mode: 'virtual' | 'onsite'
    notes?: string
  }>
}