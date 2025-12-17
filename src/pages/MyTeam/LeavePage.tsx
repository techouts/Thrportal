import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, CheckCircle, XCircle, Clock, Users, Search, Filter, FileText, ExternalLink, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { 
  usePendingLeaveApprovals, 
  useTeamCalendarTable,
  useApproveLeaveRequest,
  useApproveCompOffRequest,
  useRejectLeaveRequest,
  useRejectCompOffRequest,
  useBulkApproveLeaveRequests,
  PendingLeaveRequest,
  CalendarFilterType
} from "@/hooks/useManagerLeaveSupabase";
import { LeaveType } from "@/types/leave";
import { RBACGuard } from "@/features/performance/components/guards/RBACGuard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ITEMS_PER_PAGE = 10;

const LEAVE_TYPE_LABELS: Record<string, string> = {
  CL: "Casual Leave",
  ML: "Maternity Leave",
  PTL: "Paternity Leave",
  COMP_OFF: "Comp-Off",
};

export default function MyTeamLeavePage() {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    search: string;
    type: LeaveType | "";
    status: 'pending' | 'rejected';
  }>({
    search: "",
    type: "",
    status: "pending"
  });

  // Rejection dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestForReject, setSelectedRequestForReject] = useState<PendingLeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // View details sheet state
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<PendingLeaveRequest | null>(null);
  
  // Team calendar table state
  const [calendarFilter, setCalendarFilter] = useState<CalendarFilterType>('upcoming_week');
  const [calendarPage, setCalendarPage] = useState(1);
  const CALENDAR_ITEMS_PER_PAGE = 10;

  // Get current user ID
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    getUser();
  }, []);
  
  // Use Supabase hooks with status filter
  const { data: pendingRequests, isLoading: pendingLoading } = usePendingLeaveApprovals(currentUserId, filters.status);
  const { data: calendarTableData, isLoading: calendarTableLoading } = useTeamCalendarTable(currentUserId, calendarFilter);
  
  const approveRequest = useApproveLeaveRequest();
  const approveCompOffRequest = useApproveCompOffRequest();
  const rejectRequest = useRejectLeaveRequest();
  const rejectCompOffRequest = useRejectCompOffRequest();
  const bulkApprove = useBulkApproveLeaveRequests();
  const { toast } = useToast();

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Reset calendar page when filter changes
  useEffect(() => {
    setCalendarPage(1);
  }, [calendarFilter]);

  // Calendar table pagination
  const calendarEntries = calendarTableData?.data || [];
  const calendarTotalPages = Math.ceil(calendarEntries.length / CALENDAR_ITEMS_PER_PAGE);
  const paginatedCalendarEntries = calendarEntries.slice(
    (calendarPage - 1) * CALENDAR_ITEMS_PER_PAGE,
    calendarPage * CALENDAR_ITEMS_PER_PAGE
  );

  // Format date range helper
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (startDate === endDate) {
      return format(start, 'd MMM yyyy');
    }
    
    // Same year
    if (start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'd MMM')} - ${format(end, 'd MMM yyyy')}`;
    }
    
    return `${format(start, 'd MMM yyyy')} - ${format(end, 'd MMM yyyy')}`;
  };

  // Get empty state message based on filter
  const getCalendarEmptyMessage = () => {
    switch (calendarFilter) {
      case 'upcoming_week':
        return 'No leaves found for the upcoming week';
      case 'upcoming_month':
        return 'No leaves found for the upcoming month';
      case 'long_leave':
        return 'No long leaves (7+ days) found';
      default:
        return 'No leaves found';
    }
  };

  // Filter the requests based on filters
  const filteredRequests = pendingRequests?.data?.filter(request => {
    if (filters.search && !request.employeeName.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.type && request.type !== filters.type) {
      return false;
    }
    return true;
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleApprove = (request: PendingLeaveRequest) => {
    if (request.request_source === 'comp_off') {
      approveCompOffRequest.mutate({ id: request.id });
    } else {
      approveRequest.mutate({ id: request.id });
    }
  };

  const handleReject = (request: PendingLeaveRequest, reason: string) => {
    if (request.request_source === 'comp_off') {
      rejectCompOffRequest.mutate({ id: request.id, reason });
    } else {
      rejectRequest.mutate({ id: request.id, reason });
    }
  };

  const handleRejectSubmit = () => {
    if (selectedRequestForReject && rejectionReason.trim()) {
      handleReject(selectedRequestForReject, rejectionReason.trim());
      setRejectDialogOpen(false);
      setSelectedRequestForReject(null);
      setRejectionReason("");
    }
  };

  const handleBulkApprove = () => {
    if (selectedRequests.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select requests to approve",
        variant: "destructive"
      });
      return;
    }
    
    // Build request sources map
    const requestSources: Record<string, 'leave' | 'comp_off'> = {};
    selectedRequests.forEach(id => {
      const request = filteredRequests.find(r => r.id === id);
      if (request) {
        requestSources[id] = request.request_source;
      }
    });
    
    bulkApprove.mutate({ ids: selectedRequests, requestSources });
    setSelectedRequests([]);
  };

  const handleSelectRequest = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRequests([...selectedRequests, id]);
    } else {
      setSelectedRequests(selectedRequests.filter(reqId => reqId !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'pending': 'default',
      'pending_L1': 'default',
      'pending_L2': 'secondary',
      'approved': 'secondary',
      'rejected': 'destructive'
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getLeaveTypeLabel = (type: string) => {
    return LEAVE_TYPE_LABELS[type] || type;
  };

  return (
    <RBACGuard requiredRoles={["MANAGER", "HR", "ADMIN"]}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Team Leave Management</h1>
            <p className="text-muted-foreground">
              Review and approve leave requests from your team
            </p>
          </div>
          <div className="flex gap-2">
            {selectedRequests.length > 0 && filters.status === 'pending' && (
              <Button 
                onClick={handleBulkApprove}
                disabled={bulkApprove.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Selected ({selectedRequests.length})
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
            <TabsTrigger value="calendar">Team Calendar</TabsTrigger>
            <TabsTrigger value="coverage">Coverage Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search employee..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                  
                  <Select value={filters.type || "all"} onValueChange={(value) => setFilters({ ...filters, type: value === "all" ? "" : value as LeaveType })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Leave Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="CL">Casual Leave</SelectItem>
                      <SelectItem value="ML">Maternity Leave</SelectItem>
                      <SelectItem value="PTL">Paternity Leave</SelectItem>
                      <SelectItem value="COMP_OFF">Comp-Off</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value as 'pending' | 'rejected' })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" onClick={() => setFilters({ search: "", type: "", status: "pending" })}>
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pending Requests Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {filters.status === 'pending' ? 'Pending Approvals' : 'Rejected Requests'} ({filteredRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-12 bg-muted rounded" />
                      </div>
                    ))}
                  </div>
                ) : paginatedRequests.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {filters.status === 'pending' && (
                            <TableHead className="w-12">
                              <input 
                                type="checkbox" 
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedRequests(paginatedRequests.map(r => r.id));
                                  } else {
                                    setSelectedRequests([]);
                                  }
                                }}
                                checked={selectedRequests.length === paginatedRequests.length && paginatedRequests.length > 0}
                              />
                            </TableHead>
                          )}
                          <TableHead>Employee</TableHead>
                          <TableHead>Leave Type</TableHead>
                          <TableHead>Dates</TableHead>
                          <TableHead>Days</TableHead>
                          <TableHead>Evidence</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedRequests.map((request) => (
                          <TableRow key={request.id}>
                            {filters.status === 'pending' && (
                              <TableCell>
                                <input 
                                  type="checkbox" 
                                  checked={selectedRequests.includes(request.id)}
                                  onChange={(e) => handleSelectRequest(request.id, e.target.checked)}
                                />
                              </TableCell>
                            )}
                            <TableCell>
                              <div>
                                <p className="font-medium">{request.employeeName}</p>
                                <p className="text-sm text-muted-foreground">{request.reason || 'No reason provided'}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getLeaveTypeLabel(request.type)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd')}</p>
                                {request.halfDay && <p className="text-muted-foreground">Half Day ({request.halfDay})</p>}
                              </div>
                            </TableCell>
                            <TableCell>{request.totalDays}</TableCell>
                            <TableCell>
                              {request.evidence_url ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(request.evidence_url!, '_blank')}
                                  className="gap-1"
                                >
                                  <FileText className="h-3 w-3" />
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(request.status)}
                            </TableCell>
                            <TableCell>
                              {filters.status === 'pending' ? (
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    onClick={() => handleApprove(request)}
                                    disabled={approveRequest.isPending || approveCompOffRequest.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => {
                                      setSelectedRequestForReject(request);
                                      setRejectDialogOpen(true);
                                    }}
                                    disabled={rejectRequest.isPending || rejectCompOffRequest.isPending}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRequestForDetails(request);
                                    setDetailsSheetOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    {filteredRequests.length > 0 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredRequests.length)} of {filteredRequests.length} requests
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No {filters.status} requests found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Team Calendar
                  </CardTitle>
                  <Select 
                    value={calendarFilter} 
                    onValueChange={(val) => setCalendarFilter(val as CalendarFilterType)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming_week">Upcoming Week</SelectItem>
                      <SelectItem value="upcoming_month">Upcoming Month</SelectItem>
                      <SelectItem value="long_leave">Long Leave (7+ days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {calendarTableLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-12 bg-muted rounded" />
                      </div>
                    ))}
                  </div>
                ) : paginatedCalendarEntries.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedCalendarEntries.map((entry) => (
                          <TableRow key={`${entry.requestSource}-${entry.id}`}>
                            <TableCell className="font-medium">{entry.employeeName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {LEAVE_TYPE_LABELS[entry.leaveType] || entry.leaveType}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDateRange(entry.startDate, entry.endDate)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    {calendarEntries.length > 0 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Showing {((calendarPage - 1) * CALENDAR_ITEMS_PER_PAGE) + 1} to {Math.min(calendarPage * CALENDAR_ITEMS_PER_PAGE, calendarEntries.length)} of {calendarEntries.length} entries
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCalendarPage(p => Math.max(1, p - 1))}
                            disabled={calendarPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            Page {calendarPage} of {calendarTotalPages || 1}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCalendarPage(p => Math.min(calendarTotalPages, p + 1))}
                            disabled={calendarPage === calendarTotalPages || calendarTotalPages === 0}
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {getCalendarEmptyMessage()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coverage">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Coverage Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Coverage analysis coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Rejection Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Leave Request</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this request. This will be visible to the employee.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason("");
                setSelectedRequestForReject(null);
              }}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim() || rejectRequest.isPending || rejectCompOffRequest.isPending}
              >
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Sheet */}
        <Sheet open={detailsSheetOpen} onOpenChange={setDetailsSheetOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Leave Request Details</SheetTitle>
            </SheetHeader>
            {selectedRequestForDetails && (
              <div className="space-y-6 mt-6">
                <div>
                  <Label className="text-muted-foreground text-sm">Employee</Label>
                  <p className="font-medium">{selectedRequestForDetails.employeeName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Leave Type</Label>
                  <p className="font-medium">{getLeaveTypeLabel(selectedRequestForDetails.type)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Dates</Label>
                  <p className="font-medium">
                    {format(new Date(selectedRequestForDetails.startDate), 'MMM dd, yyyy')} - {format(new Date(selectedRequestForDetails.endDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Total Days</Label>
                  <p className="font-medium">{selectedRequestForDetails.totalDays}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Reason</Label>
                  <p className="font-medium">{selectedRequestForDetails.reason || 'No reason provided'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequestForDetails.status)}</div>
                </div>
                {selectedRequestForDetails.status === 'rejected' && selectedRequestForDetails.rejection_reason && (
                  <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                    <Label className="text-destructive text-sm font-medium">Rejection Reason</Label>
                    <p className="mt-1 text-destructive">{selectedRequestForDetails.rejection_reason}</p>
                  </div>
                )}
                {selectedRequestForDetails.evidence_url && (
                  <div>
                    <Label className="text-muted-foreground text-sm">Evidence</Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => window.open(selectedRequestForDetails.evidence_url!, '_blank')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Attachment
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </RBACGuard>
  );
}