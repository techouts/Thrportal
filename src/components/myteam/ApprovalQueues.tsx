import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  Loader2,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

interface TimesheetEntry {
  id: string;
  entry_date: string;
  task_name: string;
  hours: number;
  comment: string | null;
  is_billable: boolean;
}

interface ApprovalItem {
  id: string;
  type: 'leave' | 'attendance' | 'expense' | 'timesheet' | 'profile';
  employeeName: string;
  employeeId: string;
  title: string;
  description: string;
  amount?: number;
  requestDate: string;
  submittedAt: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'escalated' | 'rejected';
  attachments?: number;
  additionalInfo?: Record<string, any>;
}

interface ApprovalQueuesProps {
  approvals: ApprovalItem[];
  loading?: boolean;
  onApprove: (id: string, comments?: string, type?: string) => void;
  onReject: (id: string, reason: string, type?: string) => void;
  onBulkApprove: (ids: string[], type?: string) => void;
  onBulkReject: (ids: string[], reason: string, type?: string) => void;
  onFetchTimesheetEntries?: (timesheetId: string) => Promise<TimesheetEntry[]>;
}

const ITEMS_PER_PAGE = 10;

export function ApprovalQueues({ 
  approvals, 
  loading, 
  onApprove, 
  onReject, 
  onBulkApprove, 
  onBulkReject,
  onFetchTimesheetEntries
}: ApprovalQueuesProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  
  // Rejection dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState<string | null>(null);
  const [selectedRejectType, setSelectedRejectType] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Bulk reject dialog state
  const [bulkRejectDialogOpen, setBulkRejectDialogOpen] = useState(false);
  const [bulkRejectionReason, setBulkRejectionReason] = useState('');

  // View request dialog state
  const [viewRequestDialogOpen, setViewRequestDialogOpen] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState<ApprovalItem | null>(null);
  const [timesheetEntries, setTimesheetEntries] = useState<TimesheetEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  // Details sheet state (for rejected items)
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<ApprovalItem | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select non-rejected items from current page
      const selectableIds = paginatedApprovals
        .filter(item => item.status !== 'rejected')
        .map(item => item.id);
      setSelectedItems(selectableIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    }
  };

  const handleOpenRejectDialog = (id: string, type: string) => {
    setSelectedRejectId(id);
    setSelectedRejectType(type);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectSubmit = () => {
    if (!selectedRejectId) return;
    onReject(selectedRejectId, rejectionReason.trim() || 'Rejected by manager', selectedRejectType || undefined);
    setRejectDialogOpen(false);
    setSelectedRejectId(null);
    setSelectedRejectType(null);
    setRejectionReason('');
  };

  const handleBulkRejectClick = () => {
    setBulkRejectionReason('');
    setBulkRejectDialogOpen(true);
  };

  const handleBulkRejectSubmit = () => {
    // Determine the type based on selected items (assuming all selected are same type or 'timesheet')
    const selectedApprovals = approvals.filter(a => selectedItems.includes(a.id));
    const type = selectedApprovals.length > 0 ? selectedApprovals[0].type : undefined;
    
    onBulkReject(selectedItems, bulkRejectionReason.trim() || 'Bulk rejection by manager', type);
    setBulkRejectDialogOpen(false);
    setBulkRejectionReason('');
    setSelectedItems([]);
  };

  const handleBulkApproveClick = () => {
    // Determine the type based on selected items
    const selectedApprovals = approvals.filter(a => selectedItems.includes(a.id));
    const type = selectedApprovals.length > 0 ? selectedApprovals[0].type : undefined;
    
    onBulkApprove(selectedItems, type);
    setSelectedItems([]);
  };

  const handleViewRequest = async (item: ApprovalItem) => {
    setSelectedTimesheet(item);
    setViewRequestDialogOpen(true);
    setTimesheetEntries([]);
    
    if (onFetchTimesheetEntries && item.type === 'timesheet') {
      setLoadingEntries(true);
      try {
        const entries = await onFetchTimesheetEntries(item.id);
        setTimesheetEntries(entries);
      } catch (error) {
        console.error('Error fetching timesheet entries:', error);
      } finally {
        setLoadingEntries(false);
      }
    }
  };

  const handleViewDetails = (item: ApprovalItem) => {
    setSelectedItemForDetails(item);
    setDetailsSheetOpen(true);
  };

  const filteredApprovals = approvals.filter(item => {
    const matchesSearch = !filters.search || 
      item.employeeName.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.title.toLowerCase().includes(filters.search.toLowerCase());
    
    // In default "all" view, exclude rejected items
    // Only show rejected when explicitly filtered
    const matchesStatus = filters.status === 'all' 
      ? item.status !== 'rejected'
      : item.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredApprovals.length / ITEMS_PER_PAGE);
  const paginatedApprovals = filteredApprovals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Only select non-rejected items for bulk actions
  const selectableItems = paginatedApprovals.filter(item => item.status !== 'rejected');

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    try {
      const start = format(new Date(startDate), 'MMM dd');
      if (endDate) {
        const end = format(new Date(endDate), 'MMM dd');
        return `${start} - ${end}`;
      }
      return start;
    } catch {
      return startDate;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-muted rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>

            <Select value={filters.status} onValueChange={(value) => handleFilterChange({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => handleFilterChange({ search: '', status: 'all' })}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card className="rounded-2xl shadow-sm border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedItems.length} items selected</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  onClick={handleBulkApproveClick}
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Bulk Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={handleBulkRejectClick}
                  className="flex items-center gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  Bulk Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approvals Table */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">
            Approval Queue ({filteredApprovals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    {selectableItems.length > 0 && (
                      <Checkbox 
                        checked={selectedItems.length === selectableItems.length && selectableItems.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    )}
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedApprovals.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.status !== 'rejected' ? (
                        <Checkbox 
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                        />
                      ) : (
                        <div className="w-4" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.employeeName}</div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-primary hover:text-primary/80 flex items-center gap-1"
                        onClick={() => handleViewRequest(item)}
                      >
                        <Eye className="h-4 w-4" />
                        View Request
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDateRange(item.requestDate, item.additionalInfo?.weekEnd)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.status === 'rejected' ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(item)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      ) : (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => onApprove(item.id, undefined, item.type)}
                            className="h-8 w-8 p-0"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleOpenRejectDialog(item.id, item.type)}
                            className="h-8 w-8 p-0"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredApprovals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No approvals found
            </div>
          )}

          {/* Pagination */}
          {filteredApprovals.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredApprovals.length)} of {filteredApprovals.length} entries
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
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
            <Button variant="destructive" onClick={handleRejectSubmit}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Rejection Dialog */}
      <Dialog open={bulkRejectDialogOpen} onOpenChange={setBulkRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {selectedItems.length} Requests</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting these requests.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-rejection-reason">Rejection Reason</Label>
              <Textarea
                id="bulk-rejection-reason"
                placeholder="Enter the reason for rejection..."
                value={bulkRejectionReason}
                onChange={(e) => setBulkRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkRejectSubmit}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Request Dialog */}
      <Dialog open={viewRequestDialogOpen} onOpenChange={setViewRequestDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Timesheet Details - {selectedTimesheet?.employeeName}</DialogTitle>
            <DialogDescription>
              Week: {selectedTimesheet ? formatDateRange(selectedTimesheet.requestDate, selectedTimesheet.additionalInfo?.weekEnd) : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Summary Section */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">Total Hours</div>
                <div className="text-lg font-semibold">{selectedTimesheet?.additionalInfo?.totalHours || 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Billable Hours</div>
                <div className="text-lg font-semibold">{selectedTimesheet?.additionalInfo?.billableHours || 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <Badge variant={getStatusBadgeVariant(selectedTimesheet?.status || 'pending')}>
                  {selectedTimesheet?.status}
                </Badge>
              </div>
            </div>

            {/* Submission Comment */}
            {selectedTimesheet?.additionalInfo?.submissionComment && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Employee Comment</div>
                <div className="text-sm">{selectedTimesheet.additionalInfo.submissionComment}</div>
              </div>
            )}

            {/* Entries Table */}
            <div>
              <h4 className="font-medium mb-3">Logged Hours</h4>
              {loadingEntries ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : timesheetEntries.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Billable</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timesheetEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(entry.entry_date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>{entry.task_name || '-'}</TableCell>
                          <TableCell className="text-right font-medium">{entry.hours}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {entry.comment || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={entry.is_billable ? 'default' : 'secondary'}>
                              {entry.is_billable ? 'Yes' : 'No'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground border rounded-lg">
                  No entries found for this timesheet
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewRequestDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Sheet for Rejected Items */}
      <Sheet open={detailsSheetOpen} onOpenChange={setDetailsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Timesheet Details</SheetTitle>
          </SheetHeader>
          {selectedItemForDetails && (
            <div className="space-y-6 mt-6">
              <div>
                <Label className="text-muted-foreground text-sm">Employee</Label>
                <p className="font-medium mt-1">{selectedItemForDetails.employeeName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Date Range</Label>
                <p className="font-medium mt-1">
                  {formatDateRange(selectedItemForDetails.requestDate, selectedItemForDetails.additionalInfo?.weekEnd)}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Total Hours</Label>
                <p className="font-medium mt-1">{selectedItemForDetails.additionalInfo?.totalHours || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Billable Hours</Label>
                <p className="font-medium mt-1">{selectedItemForDetails.additionalInfo?.billableHours || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Status</Label>
                <div className="mt-1">
                  <Badge variant="destructive">Rejected</Badge>
                </div>
              </div>
              {/* Rejection Reason - highlighted box */}
              {selectedItemForDetails.additionalInfo?.rejectionReason && (
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <Label className="text-destructive text-sm font-medium">Rejection Reason</Label>
                  <p className="mt-1 text-sm">{selectedItemForDetails.additionalInfo.rejectionReason}</p>
                </div>
              )}
              {/* Employee's submission comment */}
              {selectedItemForDetails.additionalInfo?.submissionComment && (
                <div>
                  <Label className="text-muted-foreground text-sm">Employee Comment</Label>
                  <p className="font-medium mt-1">{selectedItemForDetails.additionalInfo.submissionComment}</p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
