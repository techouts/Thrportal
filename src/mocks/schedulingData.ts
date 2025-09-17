import type { InterviewSlot, SlotAssignment, SlotChangeLog } from '@/types/scheduling'

// Sample recruiter data (these would typically come from profiles table)
export const mockRecruiters = [
  { id: 'recruiter-1', name: 'John Smith', email: 'john.smith@company.com' },
  { id: 'recruiter-2', name: 'Emma Johnson', email: 'emma.johnson@company.com' },
  { id: 'recruiter-3', name: 'David Lee', email: 'david.lee@company.com' },
  { id: 'recruiter-4', name: 'Sarah Brown', email: 'sarah.brown@company.com' }
]

// Sample interview slots using existing client/project/SPOC data
export const mockInterviewSlots: InterviewSlot[] = [
  {
    id: 'slot-1',
    client_id: 'crm-1',
    project_id: 'proj-1',
    jd_id: 'jd-001',
    panel_text: 'Sarah Thompson (Engineering Manager)',
    date: '2024-09-20',
    from_time: '09:00',
    to_time: '10:00',
    mode: 'virtual',
    notes: 'Senior Software Engineer position - Technical round',
    status: 'available',
    created_by: 'recruiter-1',
    created_at: '2024-09-15T10:00:00Z',
    updated_at: '2024-09-15T10:00:00Z',
    // Joined data
    client_name: 'Microsoft Corporation',
    project_name: 'Azure AI Platform Enhancement',
    created_by_name: 'John Smith'
  },
  {
    id: 'slot-2',
    client_id: 'crm-1',
    project_id: 'proj-2',
    panel_text: 'David Kim (Product Manager)',
    date: '2024-09-20',
    from_time: '11:00',
    to_time: '12:00',
    mode: 'virtual',
    notes: 'Product Manager role - Product design discussion',
    status: 'booked',
    created_by: 'recruiter-1',
    created_at: '2024-09-15T10:15:00Z',
    updated_at: '2024-09-16T14:30:00Z',
    // Joined data
    client_name: 'Microsoft Corporation',
    project_name: 'Office 365 Collaboration Suite',
    created_by_name: 'John Smith',
    assignment: {
      id: 'assign-1',
      slot_id: 'slot-2',
      candidate_name: 'Alice Thompson',
      candidate_email: 'alice.thompson@email.com',
      candidate_phone: '+1-555-0123',
      recruiter_id: 'recruiter-2',
      panel_text: 'David Kim (Product Manager), Sarah Chen (Senior PM)',
      notes: 'Strong background in product strategy',
      booked_at: '2024-09-16T14:30:00Z',
      recruiter_name: 'Emma Johnson'
    }
  },
  {
    id: 'slot-3',
    client_id: 'crm-2',
    project_id: 'proj-3',
    panel_text: 'Jennifer Martinez (Technical Lead)',
    date: '2024-09-21',
    from_time: '14:00',
    to_time: '15:30',
    mode: 'onsite',
    notes: 'AWS EC2 optimization - Architecture discussion',
    status: 'used',
    created_by: 'recruiter-2',
    created_at: '2024-09-14T09:00:00Z',
    updated_at: '2024-09-17T15:45:00Z',
    // Joined data
    client_name: 'Amazon Web Services',
    project_name: 'EC2 Performance Optimization',
    created_by_name: 'Emma Johnson',
    assignment: {
      id: 'assign-2',
      slot_id: 'slot-3',
      candidate_name: 'Robert Wilson',
      candidate_email: 'robert.wilson@email.com',
      candidate_phone: '+1-555-0124',
      recruiter_id: 'recruiter-2',
      panel_text: 'Jennifer Martinez (Technical Lead), Michael Chen (Senior Architect)',
      notes: 'Excellent cloud architecture experience',
      booked_at: '2024-09-15T11:20:00Z',
      recruiter_name: 'Emma Johnson'
    }
  },
  {
    id: 'slot-4',
    client_id: 'crm-3',
    project_id: 'proj-5',
    panel_text: 'Robert Anderson (VP Technology)',
    date: '2024-09-22',
    from_time: '10:00',
    to_time: '11:00',
    mode: 'virtual',
    notes: 'Investment Banking Tech - System design round',
    status: 'available',
    created_by: 'recruiter-3',
    created_at: '2024-09-16T08:30:00Z',
    updated_at: '2024-09-16T08:30:00Z',
    // Joined data
    client_name: 'Goldman Sachs',
    project_name: 'Trading Platform Modernization',
    created_by_name: 'David Lee'
  },
  {
    id: 'slot-5',
    client_id: 'crm-4',
    project_id: 'proj-7',
    panel_text: 'Elon Rodriguez (Autopilot Director)',
    date: '2024-09-23',
    from_time: '15:00',
    to_time: '16:30',
    mode: 'onsite',
    notes: 'Autopilot Engineering - AI/ML discussion',
    status: 'expired',
    created_by: 'recruiter-3',
    created_at: '2024-09-10T12:00:00Z',
    updated_at: '2024-09-18T00:00:00Z',
    // Joined data
    client_name: 'Tesla, Inc.',
    project_name: 'Autopilot Neural Network Enhancement',
    created_by_name: 'David Lee'
  },
  {
    id: 'slot-6',
    client_id: 'crm-5',
    project_id: 'proj-9',
    panel_text: 'James Wilson (Digital Banking CTO)',
    date: '2024-09-24',
    from_time: '13:00',
    to_time: '14:00',
    mode: 'virtual',
    notes: 'Digital Banking platform - Backend architecture',
    status: 'booked',
    created_by: 'recruiter-4',
    created_at: '2024-09-17T16:45:00Z',
    updated_at: '2024-09-18T10:15:00Z',
    // Joined data
    client_name: 'JPMorgan Chase',
    project_name: 'Digital Banking Platform V2',
    created_by_name: 'Sarah Brown',
    assignment: {
      id: 'assign-3',
      slot_id: 'slot-6',
      candidate_name: 'Maria Garcia',
      candidate_email: 'maria.garcia@email.com',
      candidate_phone: '+1-555-0125',
      recruiter_id: 'recruiter-4',
      panel_text: 'James Wilson (Digital Banking CTO), Patricia Lee (Tech Lead)',
      notes: 'Strong fintech background with microservices expertise',
      booked_at: '2024-09-18T10:15:00Z',
      recruiter_name: 'Sarah Brown'
    }
  },
  {
    id: 'slot-7',
    client_id: 'crm-6',
    project_id: 'proj-11',
    panel_text: 'Mark Benioff Jr. (Sales Cloud PM)',
    date: '2024-09-25',
    from_time: '09:30',
    to_time: '10:30',
    mode: 'virtual',
    notes: 'Sales Cloud enhancement - Product strategy',
    status: 'cancelled',
    created_by: 'recruiter-1',
    created_at: '2024-09-16T13:20:00Z',
    updated_at: '2024-09-18T09:00:00Z',
    // Joined data
    client_name: 'Salesforce',
    project_name: 'Sales Cloud Analytics Enhancement',
    created_by_name: 'John Smith'
  },
  {
    id: 'slot-8',
    client_id: 'crm-7',
    project_id: 'proj-13',
    panel_text: 'Reed Johnson (Content Platform VP)',
    date: '2024-09-26',
    from_time: '16:00',
    to_time: '17:00',
    mode: 'virtual',
    notes: 'Content streaming optimization - Performance engineering',
    status: 'available',
    created_by: 'recruiter-2',
    created_at: '2024-09-18T11:30:00Z',
    updated_at: '2024-09-18T11:30:00Z',
    // Joined data
    client_name: 'Netflix',
    project_name: 'Content Delivery Optimization',
    created_by_name: 'Emma Johnson'
  },
  {
    id: 'slot-9',
    client_id: 'crm-2',
    project_id: 'proj-4',
    panel_text: 'Michael Chen (Senior Engineer)',
    date: '2024-09-27',
    from_time: '11:00',
    to_time: '12:30',
    mode: 'onsite',
    notes: 'S3 Security enhancement - Cryptography expertise required',
    status: 'available',
    created_by: 'recruiter-3',
    created_at: '2024-09-18T14:15:00Z',
    updated_at: '2024-09-18T14:15:00Z',
    // Joined data
    client_name: 'Amazon Web Services',
    project_name: 'S3 Security Enhancement',
    created_by_name: 'David Lee'
  },
  {
    id: 'slot-10',
    client_id: 'crm-1',
    project_id: 'proj-1',
    panel_text: 'Sarah Thompson (Engineering Manager), David Kim (Product Manager)',
    date: '2024-09-28',
    from_time: '10:00',
    to_time: '11:30',
    mode: 'virtual',
    notes: 'Final round - Combined technical and product discussion',
    status: 'booked',
    created_by: 'recruiter-1',
    created_at: '2024-09-18T15:45:00Z',
    updated_at: '2024-09-18T16:30:00Z',
    // Joined data
    client_name: 'Microsoft Corporation',
    project_name: 'Azure AI Platform Enhancement',
    created_by_name: 'John Smith',
    assignment: {
      id: 'assign-4',
      slot_id: 'slot-10',
      candidate_name: 'Kevin Patel',
      candidate_email: 'kevin.patel@email.com',
      candidate_phone: '+1-555-0126',
      recruiter_id: 'recruiter-1',
      panel_text: 'Sarah Thompson (Engineering Manager), David Kim (Product Manager)',
      notes: 'Excellent performance in previous rounds',
      booked_at: '2024-09-18T16:30:00Z',
      recruiter_name: 'John Smith'
    }
  }
]

// Sample change log entries
export const mockSlotChangeLogs: SlotChangeLog[] = [
  {
    id: 'log-1',
    slot_id: 'slot-2',
    action: 'created',
    actor_id: 'recruiter-1',
    timestamp: '2024-09-15T10:15:00Z',
    details: { mode: 'virtual', duration: '1 hour' },
    actor_name: 'John Smith'
  },
  {
    id: 'log-2',
    slot_id: 'slot-2',
    action: 'assigned',
    actor_id: 'recruiter-2',
    timestamp: '2024-09-16T14:30:00Z',
    details: { candidate_name: 'Alice Thompson', candidate_email: 'alice.thompson@email.com' },
    actor_name: 'Emma Johnson'
  },
  {
    id: 'log-3',
    slot_id: 'slot-3',
    action: 'used',
    actor_id: 'recruiter-2',
    timestamp: '2024-09-17T15:45:00Z',
    details: { interview_completed: true, feedback_submitted: true },
    actor_name: 'Emma Johnson'
  },
  {
    id: 'log-4',
    slot_id: 'slot-5',
    action: 'expired',
    actor_id: '00000000-0000-0000-0000-000000000000',
    timestamp: '2024-09-18T00:00:00Z',
    details: { auto_expired: true, original_date: '2024-09-17' },
    actor_name: 'System'
  },
  {
    id: 'log-5',
    slot_id: 'slot-7',
    action: 'cancelled',
    reason_code: 'CLIENT_REQUEST',
    reason_text: 'Client postponed hiring for this role',
    actor_id: 'recruiter-1',
    timestamp: '2024-09-18T09:00:00Z',
    details: { cancelled_by_client: true },
    actor_name: 'John Smith'
  }
]

// Export consolidated data
export const schedulingMockData = {
  slots: mockInterviewSlots,
  changeLogs: mockSlotChangeLogs,
  recruiters: mockRecruiters
}