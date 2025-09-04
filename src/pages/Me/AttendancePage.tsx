import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Calendar, TrendingUp, Timer, CheckCircle } from 'lucide-react';
import { attendanceService } from '@/services/attendanceService';
import { AttendanceRecord, AttendanceStats } from '@/types/attendance';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function AttendancePage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [clockingIn, setClockingin] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const [statsResponse, recordsResponse] = await Promise.all([
        attendanceService.getEmployeeStats(currentUser.employeeId),
        attendanceService.getEmployeeAttendance(currentUser.employeeId)
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (recordsResponse.success) {
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayRec = recordsResponse.data.find(r => r.date === today);
        setTodayRecord(todayRec || null);
        setRecentRecords(recordsResponse.data.slice(0, 10));
      }
    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    if (!currentUser) return;

    setClockingin(true);
    try {
      const response = await attendanceService.clockIn({
        employeeId: currentUser.employeeId,
        location: 'Office'
      });

      if (response.success) {
        setTodayRecord(response.data);
        toast.success(response.message);
        loadData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to clock in');
    } finally {
      setClockingin(false);
    }
  };

  const handleClockOut = async () => {
    if (!currentUser) return;

    setClockingin(true);
    try {
      const response = await attendanceService.clockOut(currentUser.employeeId);

      if (response.success) {
        setTodayRecord(response.data);
        toast.success(response.message);
        loadData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to clock out');
    } finally {
      setClockingin(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'work_from_home': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Attendance" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="rounded-2xl">
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Attendance"
        description="Track your daily attendance and view statistics"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="clock" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Clock-in</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Present Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Average Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageHours.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">Per day</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.currentStreak}</div>
                  <p className="text-xs text-muted-foreground">Days</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Late Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.lateDays}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="clock" className="space-y-6">
          <Card className="rounded-2xl shadow-sm max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                Today's Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {format(new Date(), 'HH:mm')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(), 'EEEE, MMM dd, yyyy')}
                </div>
              </div>

              {todayRecord ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Check-in:</span>
                    <span className="font-medium">{todayRecord.checkIn || 'Not recorded'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Check-out:</span>
                    <span className="font-medium">{todayRecord.checkOut || 'Not recorded'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Status:</span>
                    <Badge className={getStatusColor(todayRecord.status)}>
                      {todayRecord.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {!todayRecord.checkOut && (
                    <Button 
                      onClick={handleClockOut} 
                      disabled={clockingIn}
                      className="w-full"
                      variant="destructive"
                    >
                      {clockingIn ? 'Clocking Out...' : 'Clock Out'}
                    </Button>
                  )}
                </div>
              ) : (
                <Button 
                  onClick={handleClockIn} 
                  disabled={clockingIn}
                  className="w-full"
                  size="lg"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {clockingIn ? 'Clocking In...' : 'Clock In'}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentRecords.length > 0 ? (
                  recentRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">
                          {format(new Date(record.date), 'MMM dd, yyyy')}
                        </div>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {record.checkIn} - {record.checkOut || 'Ongoing'}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {record.location}
                        </div>
                        <div className="font-medium text-foreground">
                          {record.totalHours.toFixed(1)}h
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No attendance records found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}