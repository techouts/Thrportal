export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  breakTime: number; // minutes
  totalHours: number;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'work_from_home' | 'regularization_pending' | 'leave_requested' | 'on_leave' | 'week_off';
  location: 'Office' | 'Remote' | 'Field' | 'WFH';
  coordinates?: {
    lat: number;
    lng: number;
  };
  notes?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  // For joining with regularization requests
  regularizationRequest?: AttendanceRegularizationRequest;
}

export interface AttendancePolicy {
  id: string;
  name: string;
  officeStartTime: string;
  officeEndTime: string;
  lateGracePeriod: number; // minutes
  workingDays: string[];
  minimumHours: number;
  isActive: boolean;
  geofenceEnabled: boolean;
  geofenceRadius: number; // meters
  officeLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface AttendanceStats {
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalWorkingDays: number;
  averageHours: number;
  currentStreak: number;
  monthlyStats: {
    month: string;
    present: number;
    absent: number;
    late: number;
    totalHours: number;
  }[];
}

export interface ClockInRequest {
  employeeId: string;
  location: 'Office' | 'Remote' | 'Field' | 'WFH';
  coordinates?: {
    lat: number;
    lng: number;
  };
  notes?: string;
}

export interface AttendanceApproval {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  requestType: 'late_arrival' | 'early_departure' | 'work_from_home' | 'manual_entry';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}

export interface AttendanceRegularizationRequest {
  id: string;
  employeeId: string;
  attendanceRecordId: string;
  attendanceDate: string;
  reason: string;
  documentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
};

// Filter types for attendance
export type AttendanceStatsFilter = '1month' | '3months';
export type AttendanceLogsFilter = '30_days' | string; // string for month like '2024-11'
