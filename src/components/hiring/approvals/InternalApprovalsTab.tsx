import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CheckCircle, XCircle, Eye, MoreVertical } from 'lucide-react';
import { JDApproval, JDApprovalStep } from '@/types/approvals';
import { approvalsService } from '@/services/approvalsService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/auth/AuthContext';

export function InternalApprovalsTab() {
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState<JDApproval[]>([]);
  const [hrReviewApprovals, setHrReviewApprovals] = useState<JDApproval[]>([]);
  const [selectedJD, setSelectedJD] = useState<JDApproval | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const userRole = user?.role || '';
  
  // Permission checks
  const canViewTab = ['ADMIN', 'MANAGEMENT', 'STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER'].includes(userRole);
  const canApprove = ['MANAGEMENT', 'STAFFING_MANAGER', 'HR_MANAGER'].includes(userRole);

  useEffect(() => {
    if (canViewTab) {
      loadApprovals();
    }
  }, [canViewTab, userRole]);

  const loadApprovals = async () => {
    setIsLoading(true);
    try {
      // Load pending approvals for user's role if they can approve
      if (canApprove && userRole) {
        const pending = await approvalsService.getPendingApprovals(userRole);
        setPendingApprovals(pending);
      }

      // Load HR review queue (visible to all)
      const hrReview = await approvalsService.getApprovedAwaitingHR();
      setHrReviewApprovals(hrReview);
    } catch (error) {
      console.error('Error loading approvals:', error);
      toast({
        title: "Error",
        description: "Failed to load approvals",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (jd: JDApproval) => {
    if (!canApprove) return;

    setActionLoading(true);
    try {
      const steps = await approvalsService.getApprovalSteps(jd.id);
      const step = steps.find(
        s => s.approver_role === userRole && s.status === 'pending'
      );

      if (!step) {
        throw new Error("No pending step found for your role");
      }

      await approvalsService.approveJD(
        jd.id,
        step.id,
        undefined,
        user?.id,
        userRole
      );

      toast({
        title: "Success",
        description: `JD "${jd.job_title || jd.jd_id}" approved successfully`
      });

      await loadApprovals();
    } catch (error: any) {
      console.error('Error approving JD:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve JD",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!canApprove || !selectedJD || !rejectReason.trim()) return;

    setActionLoading(true);
    try {
      const steps = await approvalsService.getApprovalSteps(selectedJD.id);
      const step = steps.find(
        s => s.approver_role === userRole && s.status === 'pending'
      );

      if (!step) {
        throw new Error("No pending step found for your role");
      }

      await approvalsService.rejectJD(
        selectedJD.id,
        step.id,
        rejectReason,
        user?.id,
        userRole
      );

      toast({
        title: "Success",
        description: `JD "${selectedJD.job_title || selectedJD.jd_id}" rejected`
      });

      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedJD(null);
      await loadApprovals();
    } catch (error: any) {
      console.error('Error rejecting JD:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject JD",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number | null | undefined, currency: string | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const getPositionType = (isInternal: boolean | null | undefined) => {
    return isInternal ? 'Internal' : 'External';
  };

  if (!canViewTab) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            You don't have permission to view internal approvals
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading internal approvals...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Internal Approvals */}
      {canApprove && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Internal Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending approvals for your role
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Position Type</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Headcount</TableHead>
                      <TableHead>Salary Range</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingApprovals.map((jd) => (
                      <TableRow key={jd.id}>
                        <TableCell className="font-medium">{jd.job_title || jd.jd_id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getPositionType(jd.is_internal)}</Badge>
                        </TableCell>
                        <TableCell>{jd.department || '-'}</TableCell>
                        <TableCell>{jd.headcount || 1}</TableCell>
                        <TableCell>
                          {jd.salary_band_min && jd.salary_band_max ? (
                            <>
                              {formatCurrency(jd.salary_band_min, jd.currency)} - {formatCurrency(jd.salary_band_max, jd.currency)}
                            </>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{formatDate(jd.submitted_at || jd.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={actionLoading}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Approved - Awaiting HR Review */}
      <Card>
        <CardHeader>
          <CardTitle>Approved - Awaiting HR Review</CardTitle>
        </CardHeader>
        <CardContent>
          {hrReviewApprovals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No JDs awaiting HR review
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Position Type</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Headcount</TableHead>
                    <TableHead>Approval Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hrReviewApprovals.map((jd) => (
                    <TableRow key={jd.id}>
                      <TableCell className="font-medium">{jd.job_title || jd.jd_id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getPositionType(jd.is_internal)}</Badge>
                      </TableCell>
                      <TableCell>{jd.department || '-'}</TableCell>
                      <TableCell>{jd.headcount || 1}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">In Review</Badge>
                      </TableCell>
                      <TableCell>{formatDate(jd.updated_at)}</TableCell>
                      <TableCell className="text-right">
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
            <DialogTitle>JD Details: {selectedJD?.job_title || selectedJD?.jd_id}</DialogTitle>
          </DialogHeader>
          {selectedJD && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Job Title:</strong> {selectedJD.job_title || '-'}</p>
                    <p><strong>Position Type:</strong> {getPositionType(selectedJD.is_internal)}</p>
                    <p><strong>Department:</strong> {selectedJD.department || '-'}</p>
                    <p><strong>Business Unit:</strong> {selectedJD.business_unit || '-'}</p>
                    <p><strong>Headcount:</strong> {selectedJD.headcount || 1}</p>
                    <p><strong>Priority:</strong> {selectedJD.priority || 'Normal'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Financial Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Salary Band:</strong> {formatCurrency(selectedJD.salary_band_min, selectedJD.currency)} - {formatCurrency(selectedJD.salary_band_max, selectedJD.currency)}</p>
                    <p><strong>Currency:</strong> {selectedJD.currency || 'USD'}</p>
                    <p><strong>OPEX/CAPEX:</strong> {selectedJD.opex_capex || '-'}</p>
                    <p><strong>Cost Center:</strong> {selectedJD.cost_center || '-'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Work Location</h4>
                <p className="text-sm">
                  {selectedJD.work_location ? 
                    `${(selectedJD.work_location as any).city || '-'} (${(selectedJD.work_location as any).mode || '-'})` 
                    : '-'}
                </p>
              </div>

              {selectedJD.business_justification && (
                <div>
                  <h4 className="font-medium mb-2">Business Justification</h4>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedJD.business_justification}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Experience Required</h4>
                  <p className="text-sm">{selectedJD.experience_min || 0} - {selectedJD.experience_max || 0} years</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Target DOJ</h4>
                  <p className="text-sm">{formatDate(selectedJD.target_doj)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject JD Approval</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this JD approval:
            </p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason('');
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectReason.trim() || actionLoading}
            >
              {actionLoading ? 'Rejecting...' : 'Reject JD'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
