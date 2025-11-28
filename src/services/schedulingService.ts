import { supabase } from '@/integrations/supabase/client'
import type { 
  InterviewSlot, 
  SlotAssignment, 
  SlotChangeLog, 
  SchedulingFilters, 
  SchedulingDashboardStats,
  SchedulingMetrics,
  CreateSlotRequest,
  AssignCandidateRequest,
  UpdateSlotStatusRequest,
  BulkSlotEntry,
  InterviewerDetail
} from '@/types/scheduling'

class SchedulingService {
  private static instance: SchedulingService

  static getInstance(): SchedulingService {
    if (!SchedulingService.instance) {
      SchedulingService.instance = new SchedulingService()
    }
    return SchedulingService.instance
  }

  // Get current user ID with DEV user fallback
  private async getCurrentUserId(): Promise<string> {
    // Check for DEV user first
    const storedDevUser = localStorage.getItem('dev_user')
    if (storedDevUser) {
      const devUser = JSON.parse(storedDevUser)
      return devUser.id
    }
    
    // Fall back to Supabase auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    return user.id
  }

  // Get interview slots with filters
  async getInterviewSlots(filters?: SchedulingFilters): Promise<InterviewSlot[]> {
    let query = supabase
      .from('interview_slots')
      .select(`
        *,
        slot_assignments (
          id, slot_id, candidate_id, candidate_name, candidate_email, 
          candidate_phone, recruiter_id, interview_level, panel_text, notes, booked_at
        )
      `)
      .order('date', { ascending: true })
      .order('from_time', { ascending: true })

    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id)
    }

    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id)
    }

    if (filters?.date_from) {
      query = query.gte('date', filters.date_from)
    }

    if (filters?.date_to) {
      query = query.lte('date', filters.date_to)
    }

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status as any)
    }

    if (filters?.mode) {
      query = query.eq('mode', filters.mode as any)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching interview slots:', error)
      throw error
    }

    if (!data || data.length === 0) {
      return []
    }

    // Fetch client and project names
    const clientIds = [...new Set(data.map(slot => slot.client_id))]
    const projectIds = [...new Set(data.map(slot => slot.project_id))]

    const [clientsResult, projectsResult] = await Promise.all([
      supabase.from('crm_clients').select('id, name').in('id', clientIds),
      supabase.from('crm_projects').select('id, name').in('id', projectIds)
    ])

    const clientMap = new Map(clientsResult.data?.map(c => [c.id, c.name]) || [])
    const projectMap = new Map(projectsResult.data?.map(p => [p.id, p.name]) || [])

    // Map slot_assignments to assignment field with client/project names
    return data.map(slot => {
      const assignments = (slot as any).slot_assignments as any[] | null
      const assignment = assignments && assignments.length > 0 ? assignments[0] : undefined
      return {
        ...slot,
        interviewer_details: (slot.interviewer_details as unknown) as InterviewerDetail[] | undefined,
        client_name: clientMap.get(slot.client_id) || 'Unknown Client',
        project_name: projectMap.get(slot.project_id) || 'Unknown Project',
        created_by_name: undefined,
        assignment: assignment ? {
          id: assignment.id,
          slot_id: assignment.slot_id,
          candidate_id: assignment.candidate_id,
          candidate_name: assignment.candidate_name,
          candidate_email: assignment.candidate_email,
          candidate_phone: assignment.candidate_phone,
          recruiter_id: assignment.recruiter_id,
          interview_level: assignment.interview_level,
          panel_text: assignment.panel_text,
          notes: assignment.notes,
          booked_at: assignment.booked_at
        } : undefined
      }
    })
  }

  // Get upcoming slots for dashboard
  async getUpcomingSlots(days: number): Promise<InterviewSlot[]> {
    const today = new Date().toISOString().split('T')[0]
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)
    const futureDateStr = futureDate.toISOString().split('T')[0]

    return this.getInterviewSlots({
      date_from: today,
      date_to: futureDateStr,
      status: ['available', 'booked']
    })
  }

  // Get dashboard statistics
  async getDashboardStats(): Promise<SchedulingDashboardStats> {
    const { data: slotsData, error: slotsError } = await supabase
      .from('interview_slots')
      .select('status')

    if (slotsError) {
      console.error('Error fetching slots for stats:', slotsError)
      throw slotsError
    }

    const slots = slotsData || []
    const total_slots = slots.length
    const available_slots = slots.filter(s => s.status === 'available').length
    const booked_slots = slots.filter(s => s.status === 'booked').length
    const used_slots = slots.filter(s => s.status === 'used').length
    const expired_slots = slots.filter(s => s.status === 'expired').length

    const fill_rate = total_slots > 0 ? (used_slots / total_slots) * 100 : 0

    // Get no-show rates
    const { data: noShowData } = await supabase
      .from('slot_change_log')
      .select('no_show_type')
      .eq('action', 'no_show')

    const totalNoShows = noShowData?.length || 0
    const candidateNoShows = noShowData?.filter(log => log.no_show_type === 'candidate' || log.no_show_type === 'both').length || 0
    const panelNoShows = noShowData?.filter(log => log.no_show_type === 'panel' || log.no_show_type === 'both').length || 0

    const candidate_no_show_rate = booked_slots > 0 ? (candidateNoShows / booked_slots) * 100 : 0
    const panel_no_show_rate = booked_slots > 0 ? (panelNoShows / booked_slots) * 100 : 0

    // Get upcoming counts
    const upcoming_tomorrow = (await this.getUpcomingSlots(1)).length
    const upcoming_3days = (await this.getUpcomingSlots(3)).length
    const upcoming_7days = (await this.getUpcomingSlots(7)).length
    const upcoming_10days = (await this.getUpcomingSlots(10)).length

    return {
      total_slots,
      available_slots,
      booked_slots,
      used_slots,
      expired_slots,
      fill_rate,
      candidate_no_show_rate,
      panel_no_show_rate,
      upcoming_tomorrow,
      upcoming_3days,
      upcoming_7days,
      upcoming_10days
    }
  }

  // Create single slot
  async createSlot(request: CreateSlotRequest, userId: string): Promise<InterviewSlot> {
    if (!userId) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('interview_slots')
      .insert({
        client_id: request.client_id,
        project_id: request.project_id,
        jd_id: request.jd_id,
        panel_text: request.panel_text,
        date: request.date,
        from_time: request.from_time,
        to_time: request.to_time,
        mode: request.mode,
        notes: request.notes,
        interviewer_details: request.interviewer_details as any,
        created_by: userId
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating slot:', error)
      throw error
    }

    // Log the creation
    await this.logSlotChange(data.id, 'created', userId)

    return {
      ...data,
      interviewer_details: (data.interviewer_details as unknown) as InterviewerDetail[] | undefined
    }
  }

  // Create multiple slots (bulk)
  async createBulkSlots(request: BulkSlotEntry, userId: string): Promise<InterviewSlot[]> {
    if (!userId) throw new Error('User not authenticated')

    const slotsToCreate = request.slots.map(slot => ({
      client_id: request.client_id,
      project_id: request.project_id,
      ...slot,
      created_by: userId
    }))

    const { data, error } = await supabase
      .from('interview_slots')
      .insert(slotsToCreate)
      .select()

    if (error) {
      console.error('Error creating bulk slots:', error)
      throw error
    }

    // Log all creations
    for (const slot of data) {
      await this.logSlotChange(slot.id, 'created', userId)
    }

    return data.map(slot => ({
      ...slot,
      interviewer_details: (slot.interviewer_details as unknown) as InterviewerDetail[] | undefined
    }))
  }

  // Assign candidate to slot
  async assignCandidate(request: AssignCandidateRequest): Promise<SlotAssignment> {
    const userId = await this.getCurrentUserId()

    // Check if slot is still available
    const { data: slot, error: slotError } = await supabase
      .from('interview_slots')
      .select('status')
      .eq('id', request.slot_id)
      .single()

    if (slotError || !slot) {
      throw new Error('Slot not found')
    }

    if (slot.status !== 'available') {
      throw new Error('Slot is no longer available')
    }

    // Start transaction-like operations
    const { data: assignment, error: assignmentError } = await supabase
      .from('slot_assignments')
      .insert({
        slot_id: request.slot_id,
        candidate_id: request.candidate_id,
        candidate_name: request.candidate_name,
        candidate_email: request.candidate_email,
        candidate_phone: request.candidate_phone,
        interview_level: request.interview_level || 'screening',
        panel_text: request.panel_text,
        notes: request.notes,
        recruiter_id: request.recruiter_id || userId
      })
      .select()
      .single()

    if (assignmentError) {
      console.error('Error creating assignment:', assignmentError)
      throw assignmentError
    }

    // Update slot status to booked
    const { error: updateError } = await supabase
      .from('interview_slots')
      .update({ 
        status: 'booked',
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', request.slot_id)

    if (updateError) {
      console.error('Error updating slot status:', updateError)
      throw updateError
    }

    // Log the assignment
    await this.logSlotChange(request.slot_id, 'assigned', userId)

    return assignment
  }

  // Assign candidate to slot with interview level (new method)
  async assignCandidateToSlot(data: {
    slot_id: string
    candidate_id: string
    candidate_name: string
    candidate_email?: string
    candidate_phone?: string
    interview_level: string
  }): Promise<SlotAssignment> {
    return this.assignCandidate({
      slot_id: data.slot_id,
      candidate_id: data.candidate_id,
      candidate_name: data.candidate_name,
      candidate_email: data.candidate_email,
      candidate_phone: data.candidate_phone,
      interview_level: data.interview_level
    })
  }

  // Cancel slot with reason
  async cancelSlot(slotId: string, reason: string): Promise<void> {
    const userId = await this.getCurrentUserId()

    const { error } = await supabase
      .from('interview_slots')
      .update({ 
        status: 'cancelled' as any,
        cancellation_reason: reason,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', slotId)

    if (error) {
      console.error('Error cancelling slot:', error)
      throw error
    }

    // Log the cancellation
    await this.logSlotChange(slotId, 'cancelled', userId, reason)
  }

  // Update slot status (used, no-show, cancelled, etc.)
  async updateSlotStatus(request: UpdateSlotStatusRequest): Promise<void> {
    const userId = await this.getCurrentUserId()

    // Map no_show to used status in database
    const dbStatus = request.status === 'no_show' ? 'used' : request.status

    const { error } = await supabase
      .from('interview_slots')
      .update({ 
        status: dbStatus as any,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', request.slot_id)

    if (error) {
      console.error('Error updating slot status:', error)
      throw error
    }

    // Log the status change
    await this.logSlotChange(
      request.slot_id, 
      request.status === 'no_show' ? 'no_show' : request.status as any,
      userId,
      request.reason_code,
      request.reason_text,
      request.no_show_type
    )
  }

  // Get change log for a slot
  async getSlotChangeLog(slotId: string): Promise<SlotChangeLog[]> {
    const { data, error } = await supabase
      .from('slot_change_log')
      .select('*')
      .eq('slot_id', slotId)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Error fetching change log:', error)
      throw error
    }

    return (data || []).map(log => ({
      ...log,
      details: log.details as Record<string, any> || {},
      actor_name: undefined
    }))
  }

  // Auto-expire slots (called by cron)
  async autoExpireSlots(): Promise<void> {
    const { error } = await supabase.rpc('auto_expire_slots')
    
    if (error) {
      console.error('Error auto-expiring slots:', error)
      throw error
    }
  }

  // Private method to log slot changes
  private async logSlotChange(
    slotId: string, 
    action: string, 
    actorId: string,
    reasonCode?: string,
    reasonText?: string,
    noShowType?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('slot_change_log')
      .insert([{
        slot_id: slotId,
        action: action as any,
        reason_code: reasonCode,
        reason_text: reasonText,
        no_show_type: noShowType as any,
        actor_id: actorId
      }])

    if (error) {
      console.error('Error logging slot change:', error)
      // Don't throw here as it shouldn't block the main operation
    }
  }

  // Get panel types from master table
  async getPanelTypes(): Promise<Array<{ id: string; name: string }>> {
    const { data, error } = await supabase
      .from('interview_panel_types')
      .select('id, name')
      .eq('is_active', true)
      .order('display_order')

    if (error) {
      console.error('Error fetching panel types:', error)
      throw error
    }

    return data || []
  }

  // Export slots data
  async exportSlotsData(filters?: SchedulingFilters): Promise<any[]> {
    const slots = await this.getInterviewSlots(filters)
    
    return slots.map(slot => ({
      'Slot ID': slot.id,
      'Client': slot.client_name,
      'Project': slot.project_name,
      'Date': slot.date,
      'From Time': slot.from_time,
      'To Time': slot.to_time,
      'Mode': slot.mode,
      'Status': slot.status,
      'Panel': slot.panel_text || '',
      'Candidate': slot.assignment?.candidate_name || '',
      'Recruiter': slot.assignment?.recruiter_name || '',
      'Created By': slot.created_by_name,
      'Created At': new Date(slot.created_at).toLocaleString(),
      'Notes': slot.notes || ''
    }))
  }
}

export const schedulingService = SchedulingService.getInstance()