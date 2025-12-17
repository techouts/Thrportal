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
import { format, startOfMonth, endOfMonth } from "date-fns";
import { 
  usePendingLeaveApprovals, 
  useTeamCalendarSupabase,
  useApproveLeaveRequest,
  useApproveCompOffRequest,
  useRejectLeaveRequest,
  useRejectCompOffRequest,
  useBulkApproveLeaveRequests,
  PendingLeaveRequest
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
  
  const currentMonth = new Date();
  const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

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
  const { data: teamCalendar, isLoading: calendarLoading } = useTeamCalendarSupabase(currentUserId, monthStart, monthEnd);
  
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
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Team Calendar - {format(currentMonth, 'MMMM yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {calendarLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-24 bg-muted rounded" />
                      </div>
                    ))}
                  </div>
                ) : teamCalendar?.data && teamCalendar.data.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamCalendar.data.map((member) => (
                      <Card key={member.employeeId} className="p-4">
                        <h4 className="font-medium mb-3">{member.employeeName}</h4>
                        <div className="space-y-2 text-sm">
                          {member.leaves.map((leave) => (
                            <div key={leave.id} className="flex justify-between items-center">
                              <span>{leave.type}</span>
                              <Badge variant="outline" className="text-xs">
                                {format(new Date(leave.startDate), 'dd/MM')} - {format(new Date(leave.endDate), 'dd/MM')}
                              </Badge>
                            </div>
                          ))}
                          {member.wfhDays.length > 0 && (
                            <div className="pt-2 border-t">
                              <p className="text-muted-foreground text-xs">WFH Days: {member.wfhDays.length}</p>
                            </div>
                          )}
                          {member.leaves.length === 0 && member.wfhDays.length === 0 && (
                            <p className="text-muted-foreground">No leaves this month</p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No team members found
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