import { AttendanceRecord, AttendanceStats, ClockInRequest, AttendanceApproval, AttendancePolicy, ApiResponse } from '@/types/attendance';
import { format, startOfMonth, endOfMonth, parseISO, differenceInMinutes } from 'date-fns';

const TIMEZONE = 'Asia/Kolkata';

// Mock data service - in real app this would call APIs
class AttendanceService {
  private attendanceData: AttendanceRecord[] = [];
  private policies: AttendancePolicy[] = [];

  constructor() {
    this.loadMockData();
  }

  private async loadMockData() {
    try {
      const response = await fetch('/data/attendance.json');
      this.attendanceData = await response.json();
    } catch (error) {
      console.error('Failed to load attendance data:', error);
    }

    // Mock policies
    this.policies = [
      {
        id: 'pol-001',
        name: 'Standard Office Policy',
        officeStartTime: '09:00',
        officeEndTime: '17:30',
        lateGracePeriod: 15,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        minimumHours: 8,
        isActive: true,
        geofenceEnabled: true,
        geofenceRadius: 200,
        officeLocation: {
          lat: 12.9716,
          lng: 77.5946,
          address: 'Bangalore Office, India'
        }
      }
    ];
  }

  // Format time in user timezone (simplified for now)
  private formatInUserTimezone(date: string | Date, formatStr: string): string {
    return format(date, formatStr);
  }

  async getEmployeeAttendance(employeeId: string, month?: string): Promise<ApiResponse<AttendanceRecord[]>> {
    try {
      let filtered = this.attendanceData.filter(record => record.employeeId === employeeId);
      
      if (month) {
        const monthStart = startOfMonth(parseISO(month + '-01'));
        const monthEnd = endOfMonth(monthStart);
        filtered = filtered.filter(record => {
          const recordDate = parseISO(record.date);
          return recordDate >= monthStart && recordDate <= monthEnd;
        });
      }

      return {
        data: filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        message: 'Attendance records retrieved successfully',
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        data: [],
        message: 'Failed to retrieve attendance records',
        success: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getEmployeeStats(employeeId: string): Promise<ApiResponse<AttendanceStats>> {
    try {
      const currentMonth = format(new Date(), 'yyyy-MM');
      const records = this.attendanceData.filter(record => 
        record.employeeId === employeeId && 
        record.date.startsWith(currentMonth)
      );

      const presentDays = records.filter(r => r.status === 'present').length;
      const absentDays = records.filter(r => r.status === 'absent').length;
      const lateDays = records.filter(r => r.status === 'late').length;
      const totalHours = records.reduce((sum, r) => sum + r.totalHours, 0);

      const stats: AttendanceStats = {
        presentDays,
        absentDays,
        lateDays,
        totalWorkingDays: 22, // Mock working days in month
        averageHours: records.length > 0 ? totalHours / records.length : 0,
        currentStreak: this.calculateCurrentStreak(records),
        monthlyStats: [
          {
            month: currentMonth,
            present: presentDays,
            absent: absentDays,
            late: lateDays,
            totalHours
          }
        ]
      };

      return {
        data: stats,
        message: 'Attendance stats retrieved successfully',
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        data: {} as AttendanceStats,
        message: 'Failed to retrieve attendance stats',
        success: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  async clockIn(request: ClockInRequest): Promise<ApiResponse<AttendanceRecord>> {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const now = new Date();
      
      // Check if already clocked in today
      const existingRecord = this.attendanceData.find(
        record => record.employeeId === request.employeeId && record.date === today
      );

      if (existingRecord?.checkIn) {
        throw new Error('Already clocked in today');
      }

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId: request.employeeId,
        date: today,
        checkIn: this.formatInUserTimezone(now, 'HH:mm:ss'),
        breakTime: 0,
        totalHours: 0,
        status: this.determineStatus(now),
        location: request.location,
        coordinates: request.coordinates,
        notes: request.notes,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      if (existingRecord) {
        Object.assign(existingRecord, newRecord);
      } else {
        this.attendanceData.push(newRecord);
      }

      return {
        data: newRecord,
        message: 'Clocked in successfully',
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        data: {} as AttendanceRecord,
        message: error instanceof Error ? error.message : 'Failed to clock in',
        success: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  async clockOut(employeeId: string): Promise<ApiResponse<AttendanceRecord>> {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const now = new Date();
      
      const record = this.attendanceData.find(
        r => r.employeeId === employeeId && r.date === today
      );

      if (!record || !record.checkIn) {
        throw new Error('No check-in record found for today');
      }

      if (record.checkOut) {
        throw new Error('Already clocked out today');
      }

      const checkInTime = parseISO(`${today}T${record.checkIn}`);
      const totalMinutes = differenceInMinutes(now, checkInTime) - record.breakTime;
      
      record.checkOut = this.formatInUserTimezone(now, 'HH:mm:ss');
      record.totalHours = Math.max(0, totalMinutes / 60);
      record.updatedAt = now.toISOString();

      return {
        data: record,
        message: 'Clocked out successfully',
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        data: {} as AttendanceRecord,
        message: error instanceof Error ? error.message : 'Failed to clock out',
        success: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getTeamAttendance(managerId: string): Promise<ApiResponse<AttendanceRecord[]>> {
    try {
      // Mock: get team members attendance for today
      const today = format(new Date(), 'yyyy-MM-dd');
      const teamAttendance = this.attendanceData.filter(record => record.date === today);

      return {
        data: teamAttendance,
        message: 'Team attendance retrieved successfully',
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        data: [],
        message: 'Failed to retrieve team attendance',
        success: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getPendingApprovals(): Promise<ApiResponse<AttendanceApproval[]>> {
    try {
      // Mock pending approvals
      const approvals: AttendanceApproval[] = [
        {
          id: 'app-001',
          employeeId: 'emp-002',
          employeeName: 'Jane Smith',
          date: '2024-09-03',
          requestType: 'work_from_home',
          reason: 'Doctor appointment in the morning',
          status: 'pending',
          requestedBy: 'emp-002'
        },
        {
          id: 'app-002',
          employeeId: 'emp-004',
          employeeName: 'Mike Wilson',
          date: '2024-09-02',
          requestType: 'late_arrival',
          reason: 'Traffic due to heavy rain',
          status: 'pending',
          requestedBy: 'emp-004'
        }
      ];

      return {
        data: approvals,
        message: 'Pending approvals retrieved successfully',
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        data: [],
        message: 'Failed to retrieve pending approvals',
        success: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getAttendancePolicies(): Promise<ApiResponse<AttendancePolicy[]>> {
    try {
      return {
        data: this.policies,
        message: 'Attendance policies retrieved successfully',
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        data: [],
        message: 'Failed to retrieve attendance policies',
        success: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  private determineStatus(checkInTime: Date): AttendanceRecord['status'] {
    const policy = this.policies[0]; // Use default policy
    if (!policy) return 'present';

    const [startHour, startMinute] = policy.officeStartTime.split(':').map(Number);
    const startTime = new Date(checkInTime);
    startTime.setHours(startHour, startMinute, 0, 0);

    const minutesLate = differenceInMinutes(checkInTime, startTime);
    
    if (minutesLate > policy.lateGracePeriod) {
      return 'late';
    }
    return 'present';
  }

  private calculateCurrentStreak(records: AttendanceRecord[]): number {
    // Simple streak calculation - count consecutive present days
    let streak = 0;
    const sortedRecords = records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (const record of sortedRecords) {
      if (record.status === 'present') {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }
}

export const attendanceService = new AttendanceService();