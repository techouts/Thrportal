import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Clock, 
  Search,
  Filter,
  Calendar,
  DollarSign,
  FileText,
  User
} from 'lucide-react';
import { format } from 'date-fns';

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
}

const ITEMS_PER_PAGE = 10;

export function ApprovalQueues({ 
  approvals, 
  loading, 
  onApprove, 
  onReject, 
  onBulkApprove, 
  onBulkReject 
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(paginatedApprovals.map(item => item.id));
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

  const filteredApprovals = approvals.filter(item => {
    const matchesSearch = !filters.search || 
      item.employeeName.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || item.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredApprovals.length / ITEMS_PER_PAGE);
  const paginatedApprovals = filteredApprovals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
                  onClick={() => onBulkApprove(selectedItems)}
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Bulk Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => onBulkReject(selectedItems, 'Bulk rejection')}
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
                    <Checkbox 
                      checked={selectedItems.length === paginatedApprovals.length && paginatedApprovals.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
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
                      <Checkbox 
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.employeeName}</div>
                        <div className="text-sm text-muted-foreground">{item.employeeId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </div>
                        {item.attachments && item.attachments > 0 && (
                          <div className="text-xs text-blue-600 mt-1">
                            {item.attachments} attachments
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(item.requestDate), 'MMM dd')}</div>
                        <div className="text-muted-foreground">
                          {format(new Date(item.submittedAt), 'HH:mm')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredApprovals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No pending approvals found
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

      {/* Rejection Dialog */}
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
    </div>
  );
}
