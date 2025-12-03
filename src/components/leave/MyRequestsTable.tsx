import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Search } from 'lucide-react';
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
}

interface MyRequestsTableProps {
  requests: LeaveRequest[];
  isLoading?: boolean;
  onCancel?: (id: string) => void;
}

const LEAVE_TYPE_LABELS: Record<string, string> = {
  CL: 'Casual Leave',
  ML: 'Maternity Leave',
  PL_PATERNITY: 'Paternity Leave',
  COMP_OFF: 'Comp Offs',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const ITEMS_PER_PAGE = 10;

export function MyRequestsTable({ requests, isLoading, onCancel }: MyRequestsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, leaveTypeFilter, statusFilter]);

  // Filter requests
  const filteredRequests = requests.filter((request) => {
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
    const start = new Date(startDate);
    const end = new Date(endDate);
    
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Leave Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
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

        <div className="text-sm text-muted-foreground">
          Total: {filteredRequests.length} requests
        </div>
      </div>

      {/* Table */}
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
                        {request.status === 'pending' && onCancel && (
                          <DropdownMenuItem 
                            onClick={() => onCancel(request.id)}
                            className="text-destructive"
                          >
                            Cancel Request
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
