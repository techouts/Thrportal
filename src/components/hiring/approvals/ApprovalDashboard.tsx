import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, CheckCircle, XCircle, AlertTriangle, Users, FileText } from 'lucide-react';
import { approvalsService } from '@/services/approvalsService';
import { JDApproval } from '@/types/approvals';
import { useToast } from '@/hooks/use-toast';

interface ApprovalMetrics {
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  avg_approval_time_hours: number;
  sla_breaches: number;
  my_pending_count: number;
}

export function ApprovalDashboard() {
  const [metrics, setMetrics] = useState<ApprovalMetrics>({
    total_pending: 0,
    total_approved: 0,
    total_rejected: 0,
    avg_approval_time_hours: 0,
    sla_breaches: 0,
    my_pending_count: 0
  });
  const [recentApprovals, setRecentApprovals] = useState<JDApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load recent approvals
      const pending = await approvalsService.getApprovalsByStatus(['submitted', 'on_hold']);
      const approved = await approvalsService.getApprovalsByStatus(['approved']);
      const rejected = await approvalsService.getApprovalsByStatus(['rejected']);

      setRecentApprovals([...pending, ...approved, ...rejected].slice(0, 10));
      
      setMetrics({
        total_pending: pending.length,
        total_approved: approved.length,
        total_rejected: rejected.length,
        avg_approval_time_hours: 36, // Mock data
        sla_breaches: 2, // Mock data
        my_pending_count: 5 // Mock data
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="outline">Submitted</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'changes_requested':
        return <Badge variant="secondary">Changes Requested</Badge>;
      case 'on_hold':
        return <Badge variant="outline">On Hold</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading approval dashboard...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{metrics.total_pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{metrics.total_approved}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{metrics.total_rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{metrics.avg_approval_time_hours}h</p>
                <p className="text-xs text-muted-foreground">Avg Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{metrics.sla_breaches}</p>
                <p className="text-xs text-muted-foreground">SLA Breaches</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{metrics.my_pending_count}</p>
                <p className="text-xs text-muted-foreground">My Queue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Approval Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentApprovals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent approval activity
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>JD ID</TableHead>
                    <TableHead>Project/Client</TableHead>
                    <TableHead>Headcount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Step</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentApprovals.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell className="font-medium">{approval.jd_id}</TableCell>
                      <TableCell>
                        {approval.project_name || approval.client_name || 'Not specified'}
                      </TableCell>
                      <TableCell>{approval.headcount || 1}</TableCell>
                      <TableCell>{getStatusBadge(approval.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Step {approval.current_step || 0}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(approval.submitted_at || approval.created_at)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}