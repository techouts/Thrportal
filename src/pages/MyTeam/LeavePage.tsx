import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, CheckCircle, XCircle, Clock, Users, Search, Filter } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { 
  usePendingL1Approvals, 
  useTeamCalendar,
  useApproveL1,
  useRejectL1,
  useBulkApproveL1
} from "@/hooks/useLeave";
import { LeaveType } from "@/types/leave";
import { RBACGuard } from "@/features/performance/components/guards/RBACGuard";
import { useToast } from "@/hooks/use-toast";

export default function MyTeamLeavePage() {
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [filters, setFilters] = useState<{
    search: string;
    type: LeaveType | "";
    status: string;
    hasConflict: boolean | undefined;
  }>({
    search: "",
    type: "",
    status: "",
    hasConflict: undefined
  });
  
  const currentMonth = new Date();
  const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
  
  const { data: pendingRequests, isLoading: pendingLoading } = usePendingL1Approvals({
    employeeId: filters.search || undefined,
    type: filters.type || undefined,
    hasConflict: typeof filters.hasConflict === 'boolean' ? filters.hasConflict : undefined,
    from: monthStart,
    to: monthEnd
  });
  const { data: teamCalendar, isLoading: calendarLoading } = useTeamCalendar(monthStart, monthEnd);
  
  const approveL1 = useApproveL1();
  const rejectL1 = useRejectL1();
  const bulkApprove = useBulkApproveL1();
  const { toast } = useToast();

  const handleApprove = (id: string) => {
    approveL1.mutate({ id });
  };

  const handleReject = (id: string, reason: string) => {
    rejectL1.mutate({ id, reason });
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
    bulkApprove.mutate({ ids: selectedRequests });
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
    const variants: Record<string, any> = {
      'pending_L1': 'default',
      'pending_L2': 'secondary',
      'approved': 'default',
      'rejected': 'destructive'
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getCoverageColor = (score: string) => {
    switch (score) {
      case 'High': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-red-600';
      default: return 'text-gray-600';
    }
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
            {selectedRequests.length > 0 && (
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
                      <SelectItem value="SL">Sick Leave</SelectItem>
                      <SelectItem value="PL">Privilege Leave</SelectItem>
                      <SelectItem value="COMP_OFF">Comp-Off</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filters.hasConflict === undefined ? "all" : String(filters.hasConflict)} onValueChange={(value) => setFilters({ ...filters, hasConflict: value === "true" ? true : value === "false" ? false : undefined })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Conflicts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Requests</SelectItem>
                      <SelectItem value="true">Has Conflicts</SelectItem>
                      <SelectItem value="false">No Conflicts</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" onClick={() => setFilters({ search: "", type: "", status: "", hasConflict: undefined })}>
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
                  Pending Approvals ({pendingRequests?.data?.length || 0})
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
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input 
                            type="checkbox" 
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRequests(pendingRequests?.data?.map(r => r.id) || []);
                              } else {
                                setSelectedRequests([]);
                              }
                            }}
                            checked={selectedRequests.length === pendingRequests?.data?.length && pendingRequests?.data?.length > 0}
                          />
                        </TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Coverage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests?.data?.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <input 
                              type="checkbox" 
                              checked={selectedRequests.includes(request.id)}
                              onChange={(e) => handleSelectRequest(request.id, e.target.checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{request.employeeName}</p>
                              <p className="text-sm text-muted-foreground">{request.reason}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{request.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd')}</p>
                              {request.halfDay && <p className="text-muted-foreground">Half Day ({request.halfDay})</p>}
                            </div>
                          </TableCell>
                          <TableCell>{request.totalDays}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${getCoverageColor(request.coverageScore)}`}>
                                {request.coverageScore}
                              </span>
                              {request.conflictsWith.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {request.conflictsWith.length} conflicts
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleApprove(request.id)}
                                disabled={approveL1.isPending}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleReject(request.id, "Manager declined")}
                                disabled={rejectL1.isPending}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                
                {!pendingLoading && (!pendingRequests?.data || pendingRequests.data.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending approvals found
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
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamCalendar?.data?.map((member) => (
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
                )}
                
                {!calendarLoading && (!teamCalendar?.data || teamCalendar.data.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No team calendar data found
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
                <p className="text-muted-foreground">
                  Coverage analysis and team availability insights will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RBACGuard>
  );
}