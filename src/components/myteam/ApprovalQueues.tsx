import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
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
  status: 'pending' | 'escalated';
  attachments?: number;
  additionalInfo?: Record<string, any>;
}

interface ApprovalQueuesProps {
  approvals: ApprovalItem[];
  loading?: boolean;
  onApprove: (id: string, comments?: string) => void;
  onReject: (id: string, reason: string) => void;
  onBulkApprove: (ids: string[]) => void;
  onBulkReject: (ids: string[], reason: string) => void;
}

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
    type: 'all',
    priority: 'all',
    status: 'all'
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'leave': return <Calendar className="h-4 w-4" />;
      case 'attendance': return <Clock className="h-4 w-4" />;
      case 'expense': return <DollarSign className="h-4 w-4" />;
      case 'timesheet': return <FileText className="h-4 w-4" />;
      case 'profile': return <User className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'leave': return 'bg-blue-100 text-blue-800';
      case 'attendance': return 'bg-green-100 text-green-800';
      case 'expense': return 'bg-yellow-100 text-yellow-800';
      case 'timesheet': return 'bg-purple-100 text-purple-800';
      case 'profile': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredApprovals.map(item => item.id));
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

  const filteredApprovals = approvals.filter(item => {
    const matchesSearch = !filters.search || 
      item.employeeName.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = filters.type === 'all' || item.type === filters.type;
    const matchesPriority = filters.priority === 'all' || item.priority === filters.priority;
    const matchesStatus = filters.status === 'all' || item.status === filters.status;
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const urgentCount = approvals.filter(item => item.priority === 'critical' || item.priority === 'high').length;
  const escalatedCount = approvals.filter(item => item.status === 'escalated').length;

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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvals.length}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Urgent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Escalated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{escalatedCount}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedItems.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
            
            <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="leave">Leave</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="timesheet">Timesheet</SelectItem>
                <SelectItem value="profile">Profile</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => setFilters({ search: '', type: 'all', priority: 'all', status: 'all' })}
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
                      checked={selectedItems.length === filteredApprovals.length && filteredApprovals.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApprovals.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <Badge className={getTypeColor(item.type)}>
                          {item.type}
                        </Badge>
                      </div>
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
                      {item.amount && (
                        <div className="font-medium">
                          ₹{item.amount.toLocaleString()}
                        </div>
                      )}
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
                      <Badge 
                        variant="outline" 
                        className={getPriorityColor(item.priority)}
                      >
                        {item.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={item.status === 'escalated' ? 'destructive' : 'secondary'}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => onApprove(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => onReject(item.id, 'Rejected by manager')}
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
        </CardContent>
      </Card>
    </div>
  );
}