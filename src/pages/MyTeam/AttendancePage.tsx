import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { attendanceService } from '@/services/attendanceService';
import { AttendanceRecord, AttendanceApproval } from '@/types/attendance';
import { useAuth } from '@/auth/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyTeamAttendancePage() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [teamAttendance, setTeamAttendance] = useState<AttendanceRecord[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<AttendanceApproval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const [teamResponse, approvalsResponse] = await Promise.all([
        attendanceService.getTeamAttendance(currentUser.employeeId),
        attendanceService.getPendingApprovals()
      ]);

      if (teamResponse.success) {
        setTeamAttendance(teamResponse.data);
      }

      if (approvalsResponse.success) {
        setPendingApprovals(approvalsResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load team attendance data');
    } finally {
      setLoading(false);
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

  const handleApproval = async (approvalId: string, action: 'approve' | 'reject') => {
    // Mock approval action
    const approval = pendingApprovals.find(a => a.id === approvalId);
    if (approval) {
      approval.status = action === 'approve' ? 'approved' : 'rejected';
      approval.reviewedBy = currentUser?.employeeId;
      approval.reviewedAt = new Date().toISOString();
      
      setPendingApprovals(prev => prev.filter(a => a.id !== approvalId));
      toast.success(`Request ${action}d successfully`);
    }
  };

  const calculateTeamStats = () => {
    const present = teamAttendance.filter(r => r.status === 'present' || r.status === 'work_from_home').length;
    const late = teamAttendance.filter(r => r.status === 'late').length;
    const absent = teamAttendance.filter(r => r.status === 'absent').length;
    
    return { present, late, absent, total: teamAttendance.length };
  };

  const stats = calculateTeamStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Team Attendance" />
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
        title="Team Attendance"
        description="Monitor and manage your team's attendance"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Approvals ({pendingApprovals.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Members</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Present Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% attendance
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Late Arrivals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                <p className="text-xs text-muted-foreground">Today</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                <p className="text-xs text-muted-foreground">Today</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Today's Team Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamAttendance.length > 0 ? (
                  teamAttendance.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">Employee {record.employeeId}</div>
                          <div className="text-sm text-muted-foreground">{record.location}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          {record.checkIn && (
                            <span>In: {record.checkIn}</span>
                          )}
                          {record.checkOut && (
                            <span className="ml-2">Out: {record.checkOut}</span>
                          )}
                        </div>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status.replace('_', ' ')}
                        </Badge>
                        <div className="text-sm font-medium w-12 text-right">
                          {record.totalHours.toFixed(1)}h
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No attendance records found for today
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.length > 0 ? (
                  pendingApprovals.map((approval) => (
                    <div key={approval.id} className="border rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{approval.employeeName}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(approval.date), 'MMM dd, yyyy')} • {approval.requestType.replace('_', ' ')}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {approval.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm">
                        <strong>Reason:</strong> {approval.reason}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproval(approval.id, 'approve')}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleApproval(approval.id, 'reject')}
                          className="flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending approvals
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