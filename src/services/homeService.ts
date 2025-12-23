// Home page API service

import { 
  Poll, 
  Holiday, 
  Recognition, 
  Celebration, 
  AttendanceEvent, 
  LeaveBalance, 
  LeaveUpcoming, 
  Notification,
  TeamAvailabilityRow,
  HRConfig,
  InspirationalQuote,
  ApprovalCounts
} from '@/types/home'
import { supabase } from '@/integrations/supabase/client'

class HomeService {
  // Org Section APIs
  async getInspirationalQuotes(): Promise<InspirationalQuote[]> {
    // Mock data - replace with actual API call
    return [
      {
        id: '1',
        quote: 'The way to get started is to quit talking and begin doing.',
        author: 'Walt Disney'
      },
      {
        id: '2', 
        quote: 'Innovation distinguishes between a leader and a follower.',
        author: 'Steve Jobs'
      },
      {
        id: '3',
        quote: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
        author: 'Winston Churchill'
      }
    ]
  }

  async getActivePolls(): Promise<Poll[]> {
    // Mock data - replace with actual API call
    return [
      {
        id: '1',
        question: 'What is your preferred work-from-home schedule?',
        options: [
          { id: 'opt1', text: 'Monday & Friday' },
          { id: 'opt2', text: 'Tuesday & Thursday' },
          { id: 'opt3', text: 'Wednesday only' },
          { id: 'opt4', text: 'No preference' }
        ],
        closesAt: '2024-12-10T23:59:59Z',
        isAnonymous: true,
        results: [
          { optionId: 'opt1', pct: 45 },
          { optionId: 'opt2', pct: 30 },
          { optionId: 'opt3', pct: 15 },
          { optionId: 'opt4', pct: 10 }
        ],
        hasVoted: false,
        participation: 78
      }
    ]
  }

  async voteOnPoll(pollId: string, optionId: string): Promise<void> {
    // Mock API call - replace with actual implementation
    console.log(`Voting on poll ${pollId} with option ${optionId}`)
  }

  async getHolidays(region: string = 'IN'): Promise<Holiday[]> {
    // Mock data - replace with actual API call
    return [
      {
        id: '1',
        name: 'Christmas Day',
        date: '2024-12-25',
        region: 'IN'
      },
      {
        id: '2',
        name: 'New Year\'s Day',
        date: '2025-01-01',
        region: 'IN'
      },
      {
        id: '3',
        name: 'Republic Day',
        date: '2025-01-26',
        region: 'IN'
      }
    ]
  }

  async getHolidayICS(holidayId: string): Promise<string> {
    // Mock ICS content - replace with actual API call
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Company//Holiday Calendar//EN
BEGIN:VEVENT
UID:${holidayId}@company.com
DTSTART:20241225
DTEND:20241226
SUMMARY:Christmas Day
DESCRIPTION:Company Holiday
END:VEVENT
END:VCALENDAR`
  }

  // Recognitions Section APIs
  async getRecognitions(params?: { since?: string; team?: string; category?: string }): Promise<Recognition[]> {
    // Mock data - replace with actual API call
    return [
      {
        id: '1',
        giverId: 'emp1',
        receiverId: 'emp2',
        category: 'CUSTOMER_DELIGHT',
        badges: ['Customer Champion', 'Excellence'],
        message: 'Outstanding support to client requirements and going above and beyond to ensure customer satisfaction.',
        createdAt: '2024-12-01T10:00:00Z',
        giver: { id: 'emp1', name: 'Sarah Johnson', email: 'sarah@company.com', team: 'Sales', dobDayMonth: '03-15', joinDate: '2020-01-15', birthdayVisibility: 'org' },
        receiver: { id: 'emp2', name: 'Mike Chen', email: 'mike@company.com', team: 'Support', dobDayMonth: '07-22', joinDate: '2021-03-10', birthdayVisibility: 'org' },
        applauds: 12
      },
      {
        id: '2',
        giverId: 'emp3',
        receiverId: 'emp4',
        category: 'INNOVATION_IMPACT',
        badges: ['Tech Innovator'],
        message: 'Brilliant solution to optimize our deployment pipeline, saving hours of manual work.',
        createdAt: '2024-11-30T15:30:00Z',
        giver: { id: 'emp3', name: 'Alex Rodriguez', email: 'alex@company.com', team: 'Engineering', dobDayMonth: '09-12', joinDate: '2019-06-01', birthdayVisibility: 'team' },
        receiver: { id: 'emp4', name: 'Lisa Park', email: 'lisa@company.com', team: 'DevOps', dobDayMonth: '11-05', joinDate: '2022-01-20', birthdayVisibility: 'org' },
        applauds: 8
      }
    ]
  }

  async createRecognition(recognition: Omit<Recognition, 'id' | 'createdAt' | 'giver' | 'receiver' | 'applauds'>): Promise<void> {
    // Mock API call - replace with actual implementation
    console.log('Creating recognition:', recognition)
  }

  async applaudRecognition(recognitionId: string): Promise<void> {
    // Mock API call - replace with actual implementation
    console.log(`Applauding recognition ${recognitionId}`)
  }

  // Celebrations Section APIs
  async getCelebrations(params: { type: 'birthday' | 'anniversary' | 'new_joiner'; window: string }): Promise<Celebration[]> {
    const today = new Date()
    const mockCelebrations: Celebration[] = [
      {
        id: '1',
        type: 'birthday',
        employeeId: 'emp5',
        employeeName: 'John Doe',
        date: '2024-12-03',
        team: 'Marketing'
      },
      {
        id: '2',
        type: 'birthday',
        employeeId: 'emp6',
        employeeName: 'Alice Smith',
        date: '2024-12-05',
        team: 'HR'
      },
      {
        id: '3',
        type: 'anniversary',
        employeeId: 'emp7',
        employeeName: 'Mike Brown',
        date: '2024-12-01',
        team: 'Engineering',
        years: 5
      },
      {
        id: '4',
        type: 'new_joiner',
        employeeId: 'emp8',
        employeeName: 'Emma Wilson',
        date: '2024-12-02',
        team: 'Design',
        role: 'Senior Designer',
        managerId: 'emp9',
        managerName: 'David Lee'
      }
    ]

    return mockCelebrations.filter(c => c.type === params.type)
  }

  async assignBuddy(joinerId: string, buddyId: string): Promise<void> {
    // Mock API call - replace with actual implementation
    console.log(`Assigning buddy ${buddyId} to joiner ${joinerId}`)
  }

  // Personal Section APIs
  async clockIn(mode: 'Web' | 'Remote' | 'WFH', note?: string): Promise<AttendanceEvent> {
    // Mock API call - replace with actual implementation
    const event: AttendanceEvent = {
      id: `att_${Date.now()}`,
      employeeId: 'current_user',
      timestamp: new Date().toISOString(),
      mode,
      note
    }
    return event
  }

  async getLeaveBalance(): Promise<LeaveBalance[]> {
    // Mock data - replace with actual API call
    return [
      { employeeId: 'current_user', type: 'Annual Leave', balance: 15 },
      { employeeId: 'current_user', type: 'Sick Leave', balance: 8 },
      { employeeId: 'current_user', type: 'Personal Leave', balance: 3 }
    ]
  }

  async getUpcomingLeave(): Promise<LeaveUpcoming[]> {
    // Mock data - replace with actual API call
    return [
      {
        id: 'leave1',
        employeeId: 'current_user',
        employeeName: 'Current User',
        start: '2024-12-20',
        end: '2024-12-27',
        type: 'Annual Leave',
        status: 'APPROVED'
      }
    ]
  }

  async getNotifications(unreadOnly: boolean = true): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (unreadOnly) {
        query = query.eq('read', false)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching notifications:', error)
        return []
      }

      return (data || []).map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        createdAt: n.created_at,
        read: n.read
      }))
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking notification as read:', error)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  async markAllNotificationsAsRead(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Team Section APIs (for managers/dotted leads)
  async getTeamAvailability(date: string = 'today'): Promise<TeamAvailabilityRow[]> {
    // Mock data - replace with actual API call
    return [
      {
        employeeId: 'emp1',
        employeeName: 'Sarah Johnson',
        status: 'in_office',
        location: 'New York',
        shift: '9:00 AM - 6:00 PM'
      },
      {
        employeeId: 'emp2',
        employeeName: 'Mike Chen',
        status: 'remote',
        location: 'San Francisco',
        shift: '10:00 AM - 7:00 PM',
        note: 'Client calls all day'
      },
      {
        employeeId: 'emp3',
        employeeName: 'Alex Rodriguez',
        status: 'leave',
        location: 'Boston',
        note: 'Sick leave'
      }
    ]
  }

  // Manager Approvals APIs
  async getApprovalCounts(): Promise<ApprovalCounts> {
    // Mock data - replace with actual API call
    return {
      pendingTimesheets: 5,
      pendingLeaveRequests: 3,
      pendingExpenses: 7
    }
  }

  // HR Config API
  async getHRConfig(): Promise<HRConfig> {
    // Mock data - replace with actual API call
    return {
      celebrationsVisibility: 'org',
      recognitionCategories: ['CUSTOMER_DELIGHT', 'INNOVATION_IMPACT', 'TEAMWORK_COLLAB', 'OWNERSHIP_LEADERSHIP', 'QUALITY_EXCELLENCE', 'RISING_STAR'],
      badges: ['Customer Champion', 'Excellence', 'Tech Innovator', 'Team Player', 'Rising Star'],
      coverageThreshold: 60
    }
  }
}

export const homeService = new HomeService()