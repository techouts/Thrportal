import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Eye, MoreVertical } from 'lucide-react';
import { JDApproval, JDApprovalStep } from '@/types/approvals';
import { approvalsService } from '@/services/approvalsService';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useProfile } from '@/hooks/useProfile';

export function ExternalApprovalsTab() {
  const { profile } = useProfile();
  const userRole = profile?.role || '';

  const [pendingApprovals, setPendingApprovals] = useState<JDApproval[]>([]);
  const [hrReviewApprovals, setHrReviewApprovals] = useState<JDApproval[]>([]);
  const [selectedJD, setSelectedJD] = useState<JDApproval | null>(null);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  // Permission checks
  const canViewTab = ['ADMIN', 'STAFFING_MANAGER', 'HR_MANAGER', 'MANAGEMENT', 'RECRUITER', 'HIRING_MANAGER'].includes(userRole);
  const canApproveStaffing = userRole === 'STAFFING_MANAGER';
  const canApproveHR = userRole === 'HR_MANAGER';

  const { toast } = useToast();

  useEffect(() => {
    if (canViewTab) {
      loadApprovals();
    }
  }, [canViewTab]);

  const loadApprovals = async () => {
    if (!canViewTab) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [pending, hrReview] = await Promise.all([
        approvalsService.getPendingExternalApprovals(),
        approvalsService.getApprovedAwaitingHRExternal()
      ]);
      
      setPendingApprovals(pending);
      setHrReviewApprovals(hrReview);
      
      console.log(`Loaded ${pending.length} pending external approvals, ${hrReview.length} awaiting HR review`);
    } catch (error) {
      console.error('Error loading external approvals:', error);
      toast({
        title: "Error",
        description: "Failed to load external approvals",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (jd: JDApproval) => {
    const isHRReviewJD = hrReviewApprovals.some(hrJd => hrJd.id === jd.id);
    
    if (isHRReviewJD && userRole !== 'HR_MANAGER') {
      toast({
        title: "Permission Denied",
        description: "Only HR Manager can approve external JDs in HR review",
        variant: "destructive"
      });
      return;
    }

    if (!isHRReviewJD && userRole !== 'STAFFING_MANAGER') {
      toast({
        title: "Permission Denied",
        description: "Only Staffing Manager can approve pending external JDs",
        variant: "destructive"
      });
      return;
    }

    setActionLoading(true);
    try {
      const steps = await approvalsService.getApprovalSteps(jd.id);
      const pendingStep = steps.find(s => s.approver_role === userRole && s.status === 'pending');
      
      if (!pendingStep) {
        toast({
          title: "Error",
          description: "No pending approval step found for your role",
          variant: "destructive"
        });
        return;
      }

      await approvalsService.approveJD(jd.id, pendingStep.id, userRole, comment);
      
      toast({
        title: "Success",
        description: "External JD approved successfully"
      });
      
      setComment('');
      setViewDialogOpen(false);
      await loadApprovals();
    } catch (error) {
      console.error('Error approving external JD:', error);
      toast({
        title: "Error",
        description: "Failed to approve external JD",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedJD) return;
    
    const isHRReviewJD = hrReviewApprovals.some(hrJd => hrJd.id === selectedJD.id);
    
    if (isHRReviewJD && userRole !== 'HR_MANAGER') {
      toast({
        title: "Permission Denied",
        description: "Only HR Manager can reject external JDs in HR review",
        variant: "destructive"
      });
      return;
    }

    if (!isHRReviewJD && userRole !== 'STAFFING_MANAGER') {
      toast({
        title: "Permission Denied",
        description: "Only Staffing Manager can reject pending external JDs",
        variant: "destructive"
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      });
      return;
    }

    setActionLoading(true);
    try {
      const steps = await approvalsService.getApprovalSteps(selectedJD.id);
      const pendingStep = steps.find(s => s.approver_role === userRole && s.status === 'pending');
      
      if (!pendingStep) {
        toast({
          title: "Error",
          description: "No pending approval step found for your role",
          variant: "destructive"
        });
        return;
      }

      await approvalsService.rejectJD(selectedJD.id, pendingStep.id, userRole, comment);
      
      toast({
        title: "Success",
        description: "External JD rejected"
      });
      
      setComment('');
      setRejectDialogOpen(false);
      setViewDialogOpen(false);
      await loadApprovals();
    } catch (error) {
      console.error('Error rejecting external JD:', error);
      toast({
        title: "Error",
        description: "Failed to reject external JD",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number | undefined, currency: string) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading external approvals...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending External Approvals - STAFFING_MANAGER */}
      <Card>
        <CardHeader>
          <CardTitle>Pending External Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending external approvals
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Positions</TableHead>
                    <TableHead>Salary Range</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApprovals.map((jd) => (
                    <TableRow key={jd.id}>
                      <TableCell className="font-medium">{jd.job_title || 'Not specified'}</TableCell>
                      <TableCell>{jd.client_name || 'Not specified'}</TableCell>
                      <TableCell>{jd.project_name || 'Not specified'}</TableCell>
                      <TableCell>{jd.positions || 1}</TableCell>
                      <TableCell>
                        {formatCurrency(jd.ctc_annual_min, jd.currency || 'USD')} - {formatCurrency(jd.ctc_annual_max, jd.currency || 'USD')}
                      </TableCell>
                      <TableCell>{formatDate(jd.submitted_at || jd.created_at)}</TableCell>
                      <TableCell className="text-right">
                        {canApproveStaffing ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={actionLoading}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background z-50">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedJD(jd);
                                  setViewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleApprove(jd)}
                                disabled={actionLoading}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedJD(jd);
                                  setRejectDialogOpen(true);
                                }}
                                disabled={actionLoading}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedJD(jd);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved - Awaiting HR Review */}
      <Card>
        <CardHeader>
          <CardTitle>Approved - Awaiting HR Review</CardTitle>
        </CardHeader>
        <CardContent>
          {hrReviewApprovals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No external JDs awaiting HR review
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Positions</TableHead>
                    <TableHead>Salary Range</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hrReviewApprovals.map((jd) => (
                    <TableRow key={jd.id}>
                      <TableCell className="font-medium">{jd.job_title || 'Not specified'}</TableCell>
                      <TableCell>{jd.client_name || 'Not specified'}</TableCell>
                      <TableCell>{jd.project_name || 'Not specified'}</TableCell>
                      <TableCell>{jd.positions || 1}</TableCell>
                      <TableCell>
                        {formatCurrency(jd.ctc_annual_min, jd.currency || 'USD')} - {formatCurrency(jd.ctc_annual_max, jd.currency || 'USD')}
                      </TableCell>
                      <TableCell>{formatDate(jd.updated_at)}</TableCell>
                      <TableCell className="text-right">
                        {canApproveHR ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={actionLoading}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background z-50">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedJD(jd);
                                  setViewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleApprove(jd)}
                                disabled={actionLoading}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedJD(jd);
                                  setRejectDialogOpen(true);
                                }}
                                disabled={actionLoading}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedJD(jd);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>External JD Details: {selectedJD?.job_title}</DialogTitle>
          </DialogHeader>
          {selectedJD && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Client Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Client:</strong> {selectedJD.client_name || 'Not specified'}</p>
                    <p><strong>Project:</strong> {selectedJD.project_name || 'Not specified'}</p>
                    <p><strong>Cost Center:</strong> {selectedJD.cost_center || 'Not specified'}</p>
                    <p><strong>Business Unit:</strong> {selectedJD.business_unit || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Job Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Job Title:</strong> {selectedJD.job_title || 'Not specified'}</p>
                    <p><strong>Department:</strong> {selectedJD.department || 'Not specified'}</p>
                    <p><strong>Positions:</strong> {selectedJD.positions || 1}</p>
                    <p><strong>Employment Type:</strong> {selectedJD.employment_type || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Compensation</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><strong>Annual CTC:</strong> {formatCurrency(selectedJD.ctc_annual_min, selectedJD.currency || 'USD')} - {formatCurrency(selectedJD.ctc_annual_max, selectedJD.currency || 'USD')}</p>
                  <p><strong>Currency:</strong> {selectedJD.currency || 'USD'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Business Justification</h4>
                <p className="text-sm">{selectedJD.business_justification || 'Not provided'}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Comments</h4>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add your comments..."
                  rows={3}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject External JD</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this external JD.
            </p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Reason for rejection..."
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={actionLoading || !comment.trim()}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}