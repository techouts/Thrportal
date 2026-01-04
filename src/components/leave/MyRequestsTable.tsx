import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Search, Calendar, Eye, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { LeaveRequestDetailsSheet } from './LeaveRequestDetailsSheet';
import { CancelRequestDialog } from './CancelRequestDialog';
import { cn } from '@/lib/utils';

interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: string;
  requested_by: string | null;
  reason: string | null;
  rejection_reason: string | null;
  approved_at: string | null;
  created_at: string;
  evidence_url?: string | null;
  request_source?: 'leave' | 'comp_off';
}

interface MyRequestsTableProps {
  requests: LeaveRequest[];
  isLoading?: boolean;
  onCancel?: (id: string, requestSource?: 'leave' | 'comp_off') => void;
  userGender?: string;
}

const LEAVE_TYPE_LABELS: Record<string, string> = {
  CL: 'Casual Leave',
  ML: 'Maternity Leave',
  PL_PATERNITY: 'Paternity Leave',
  COMP_OFF: 'Comp Offs',
  LOP: 'Unpaid Leave',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const ITEMS_PER_PAGE = 10;

export function MyRequestsTable({ requests, isLoading, onCancel, userGender }: MyRequestsTableProps) {
  const isMobile = useIsMobile();
  
  // Filter leave types based on user gender
  const filteredLeaveTypes = useMemo(() => {
    return Object.entries(LEAVE_TYPE_LABELS).filter(([value]) => {
      // Hide Paternity Leave for non-males
      if (value === 'PL_PATERNITY') {
        return userGender === 'Male';
      }
      // Hide Maternity Leave for non-females
      if (value === 'ML') {
        return userGender === 'Female';
      }
      return true;
    });
  }, [userGender]);
  const [searchQuery, setSearchQuery] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Sheet and dialog state
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<string | null>(null);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, leaveTypeFilter, statusFilter]);

  // Helper to check if a date string is valid
  const isValidDate = (dateStr: string | null | undefined): boolean => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  // Filter requests - also filter out requests with invalid dates
  const filteredRequests = requests.filter((request) => {
    // Filter out requests with invalid date fields
    if (!isValidDate(request.start_date) || !isValidDate(request.end_date)) {
      console.warn('[MyRequestsTable] Skipping request with invalid dates:', request.id);
      return false;
    }

    const matchesSearch = searchQuery === '' || 
      (request.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       request.requested_by?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = leaveTypeFilter === 'all' || request.leave_type === leaveTypeFilter;
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatDateRange = (startDate: string, endDate: string, totalDays: number) => {
    // Defensive check for invalid dates
    if (!startDate || !endDate) {
      return (
        <div>
          <div className="font-medium text-muted-foreground">Invalid date</div>
          <div className="text-xs text-muted-foreground">{totalDays || 0} day(s)</div>
        </div>
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if dates are valid (not NaN)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return (
        <div>
          <div className="font-medium text-muted-foreground">Invalid date</div>
          <div className="text-xs text-muted-foreground">{totalDays || 0} day(s)</div>
        </div>
      );
    }
    
    if (startDate === endDate) {
      return (
        <div>
          <div className="font-medium">{format(start, 'dd MMM yyyy')}</div>
          <div className="text-xs text-muted-foreground">{totalDays} day</div>
        </div>
      );
    }
    
    return (
      <div>
        <div className="font-medium">
          {format(start, 'dd MMM')} - {format(end, 'dd MMM yyyy')}
        </div>
        <div className="text-xs text-muted-foreground">{totalDays} days</div>
      </div>
    );
  };

  const handleViewRequest = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setShowDetailsSheet(true);
  };

  const handleCancelClick = (requestId: string, requestSource?: 'leave' | 'comp_off') => {
    setRequestToCancel(requestId);
    setRequestSourceToCancel(requestSource);
    setShowCancelDialog(true);
  };

  const [requestSourceToCancel, setRequestSourceToCancel] = useState<'leave' | 'comp_off' | undefined>();

  const handleConfirmCancel = () => {
    if (requestToCancel && onCancel) {
      onCancel(requestToCancel, requestSourceToCancel);
    }
    setShowCancelDialog(false);
    setRequestToCancel(null);
    setRequestSourceToCancel(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Mobile card render
  const renderMobileCard = (request: LeaveRequest) => {
    // Defensive check for invalid dates
    if (!request.start_date || !request.end_date) {
      return (
        <Card key={request.id} className="overflow-hidden">
          <CardContent className="p-4">
            <p className="text-muted-foreground">Invalid request data</p>
          </CardContent>
        </Card>
      );
    }

    const start = new Date(request.start_date);
    const end = new Date(request.end_date);
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return (
        <Card key={request.id} className="overflow-hidden">
          <CardContent className="p-4">
            <p className="text-muted-foreground">Invalid date format</p>
          </CardContent>
        </Card>
      );
    }

    const isSameDay = request.start_date === request.end_date;
    
    return (
      <Card key={request.id} className="overflow-hidden">
        <CardContent className="p-4 space-y-3">
          {/* Header with type and status */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">
              {LEAVE_TYPE_LABELS[request.leave_type] || request.leave_type}
            </span>
            <Badge className={STATUS_COLORS[request.status] || ''}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>
          
          {/* Date range */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {isSameDay 
                ? format(start, 'dd MMM yyyy')
                : `${format(start, 'dd MMM')} - ${format(end, 'dd MMM yyyy')}`
              }
            </span>
            <Badge variant="secondary" className="text-xs">
              {request.total_days} {request.total_days === 1 ? 'day' : 'days'}
            </Badge>
          </div>
          
          {/* Reason */}
          {request.reason && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {request.reason}
            </p>
          )}
          
          {/* Rejection reason if applicable */}
          {request.rejection_reason && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {request.rejection_reason}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => handleViewRequest(request)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {request.status === 'pending' && onCancel && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-destructive hover:text-destructive"
                onClick={() => handleCancelClick(request.id, request.request_source)}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className={cn(
        "flex gap-4",
        isMobile ? "flex-col" : "flex-wrap items-center"
      )}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className={cn(
          "flex gap-2",
          isMobile ? "w-full" : ""
        )}>
          <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
            <SelectTrigger className={isMobile ? "flex-1" : "w-[180px]"}>
              <SelectValue placeholder="Leave Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {filteredLeaveTypes.map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={isMobile ? "flex-1" : "w-[150px]"}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          Total: {filteredRequests.length} requests
        </div>
      </div>

      {/* Mobile: Card layout */}
      {isMobile ? (
        <div className="space-y-3">
          {paginatedRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leave requests found
            </div>
          ) : (
            paginatedRequests.map(renderMobileCard)
          )}
        </div>
      ) : (
        /* Desktop: Table layout */
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leave Dates</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Action Taken On</TableHead>
                <TableHead>Leave Note</TableHead>
                <TableHead>Reject/Cancellation Reason</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No leave requests found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {formatDateRange(request.start_date, request.end_date, request.total_days)}
                    </TableCell>
                    <TableCell>
                      {LEAVE_TYPE_LABELS[request.leave_type] || request.leave_type}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[request.status] || ''}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.requested_by || '-'}</TableCell>
                    <TableCell>
                      {request.approved_at 
                        ? format(new Date(request.approved_at), 'dd MMM yyyy')
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {request.reason || '-'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {request.rejection_reason || '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewRequest(request)}>
                            View Request
                          </DropdownMenuItem>
                          {request.status === 'pending' && onCancel && (
                            <DropdownMenuItem 
                              onClick={() => handleCancelClick(request.id, request.request_source)}
                              className="text-destructive"
                            >
                              Cancel Request
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {Math.max(1, totalPages)} ({filteredRequests.length} items)
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(Math.max(1, totalPages), p + 1))}
                className={currentPage === totalPages || totalPages === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Details Sheet */}
      <LeaveRequestDetailsSheet
        request={selectedRequest}
        open={showDetailsSheet}
        onOpenChange={setShowDetailsSheet}
      />

      {/* Cancel Confirmation Dialog */}
      <CancelRequestDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
