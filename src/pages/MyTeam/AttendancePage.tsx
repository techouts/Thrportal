import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { attendanceService } from '@/services/attendanceService';
import { AttendanceRecord } from '@/types/attendance';
import { useAuth } from '@/auth/AuthContext';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { usePendingRegularizationRequests, useApproveRegularization, useRejectRegularization } from '@/hooks/useAttendanceRegularization';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
export default function MyTeamAttendancePage() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [teamAttendance, setTeamAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvalsPage, setApprovalsPage] = useState(1);
  const APPROVALS_ITEMS_PER_PAGE = 10;
  
  // Rejection dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Use the hook for regularization requests
  const { data: pendingRegularizations = [], isLoading: regularizationsLoading } = usePendingRegularizationRequests(currentUser?.id);
  const approveRegularization = useApproveRegularization();
  const rejectRegularization = useRejectRegularization();

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const teamResponse = await attendanceService.getTeamAttendance(currentUser.id);

      if (teamResponse.success) {
        setTeamAttendance(teamResponse.data);
      }
    } catch (error) {
      console.error('Failed to load team attendance data:', error);
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

  const handleApproval = async (requestId: string) => {
    if (!currentUser?.id) return;
    approveRegularization.mutate({ requestId, approverId: currentUser.id });
  };

  const handleOpenRejectDialog = (requestId: string) => {
    setSelectedRequestId(requestId);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectSubmit = () => {
    if (!selectedRequestId || !currentUser?.id) return;
    
    rejectRegularization.mutate({
      requestId: selectedRequestId,
      approverId: currentUser.id,
      rejectionReason: rejectionReason.trim() || undefined
    });
    
    setRejectDialogOpen(false);
    setSelectedRequestId(null);
    setRejectionReason('');
  };

  const calculateTeamStats = () => {
    const present = teamAttendance.filter(r => r.status === 'present' || r.status === 'work_from_home').length;
    const late = teamAttendance.filter(r => r.status === 'late').length;
    const absent = teamAttendance.filter(r => r.status === 'absent').length;
    
    return { present, late, absent, total: teamAttendance.length };
  };

  const stats = calculateTeamStats();

  // Pagination logic for approvals
  const approvalsTotalPages = Math.ceil(pendingRegularizations.length / APPROVALS_ITEMS_PER_PAGE);
  const paginatedApprovals = pendingRegularizations.slice(
    (approvalsPage - 1) * APPROVALS_ITEMS_PER_PAGE,
    approvalsPage * APPROVALS_ITEMS_PER_PAGE
  );

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
            <span className="hidden sm:inline">Approvals ({pendingRegularizations.length})</span>
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
                Pending Regularization Requests ({pendingRegularizations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {regularizationsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : pendingRegularizations.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee Name</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Document</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedApprovals.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.employee_name}</TableCell>
                            <TableCell>{format(new Date(request.attendance_date), 'MMM dd, yyyy')}</TableCell>
                            <TableCell className="max-w-[200px] truncate" title={request.reason}>
                              {request.reason}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {request.document_url ? (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => window.open(request.document_url, '_blank')}
                                  className="h-8 px-2"
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApproval(request.id)}
                                  className="h-8 px-2"
                                  disabled={approveRegularization.isPending || rejectRegularization.isPending}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleOpenRejectDialog(request.id)}
                                  className="h-8 px-2"
                                  disabled={approveRegularization.isPending || rejectRegularization.isPending}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {approvalsTotalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Showing {((approvalsPage - 1) * APPROVALS_ITEMS_PER_PAGE) + 1} to {Math.min(approvalsPage * APPROVALS_ITEMS_PER_PAGE, pendingRegularizations.length)} of {pendingRegularizations.length} entries
                      </p>
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setApprovalsPage(p => Math.max(1, p - 1))}
                              className={approvalsPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          {Array.from({ length: approvalsTotalPages }, (_, i) => i + 1).map(page => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setApprovalsPage(page)}
                                isActive={approvalsPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setApprovalsPage(p => Math.min(approvalsTotalPages, p + 1))}
                              className={approvalsPage === approvalsTotalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No pending regularization requests
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rejection Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Regularization Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectSubmit}
              disabled={rejectRegularization.isPending}
            >
              {rejectRegularization.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}