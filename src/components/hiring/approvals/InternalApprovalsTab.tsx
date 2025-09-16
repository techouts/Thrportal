import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Eye, Send, MessageSquare } from 'lucide-react';
import { JDApproval, JDApprovalStep } from '@/types/approvals';
import { approvalsService } from '@/services/approvalsService';
import { useToast } from '@/hooks/use-toast';

interface ApprovalItem {
  approval: JDApproval;
  currentStep: JDApprovalStep | null;
}

export function InternalApprovalsTab() {
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  const [approvedApprovals, setApprovedApprovals] = useState<ApprovalItem[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      // This would need to be implemented to fetch approvals from Supabase
      // For now, return empty arrays
      setPendingApprovals([]);
      setApprovedApprovals([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load approvals",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (stepId: string, action: 'approve' | 'reject' | 'request_changes') => {
    try {
      if (action === 'approve') {
        await approvalsService.approveStep(stepId, comment);
        toast({
          title: "Success",
          description: "Approval step completed successfully"
        });
      } else if (action === 'reject') {
        await approvalsService.rejectStep(stepId, comment);
        toast({
          title: "Success",
          description: "JD rejected and returned to submitter"
        });
      }
      setComment('');
      await loadApprovals();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process approval",
        variant: "destructive"
      });
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
      default:
        return <Badge variant="outline">{status}</Badge>;
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
      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Internal Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending internal approvals
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>JD ID</TableHead>
                    <TableHead>Project/Client</TableHead>
                    <TableHead>Headcount</TableHead>
                    <TableHead>Salary Band</TableHead>
                    <TableHead>Current Step</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApprovals.map((item) => (
                    <TableRow key={item.approval.id}>
                      <TableCell className="font-medium">{item.approval.jd_id}</TableCell>
                      <TableCell>
                        {item.approval.project_name || item.approval.client_name || 'Not specified'}
                      </TableCell>
                      <TableCell>{item.approval.headcount || 1}</TableCell>
                      <TableCell>
                        {item.approval.salary_band_min && item.approval.salary_band_max ? (
                          <>
                            {formatCurrency(item.approval.salary_band_min, item.approval.currency || 'USD')} - {formatCurrency(item.approval.salary_band_max, item.approval.currency || 'USD')}
                          </>
                        ) : (
                          'Not specified'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.currentStep?.approver_role || 'Pending Assignment'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(item.approval.submitted_at || item.approval.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setSelectedApproval(item)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Review JD Approval: {selectedApproval?.approval.jd_id}</DialogTitle>
                              </DialogHeader>
                              {selectedApproval && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Approval Details</h4>
                                      <div className="space-y-2 text-sm">
                                        <p><strong>JD ID:</strong> {selectedApproval.approval.jd_id}</p>
                                        <p><strong>Status:</strong> {getStatusBadge(selectedApproval.approval.status)}</p>
                                        <p><strong>Current Step:</strong> {selectedApproval.approval.current_step}</p>
                                        <p><strong>Submitted By:</strong> {selectedApproval.approval.submitted_by || 'N/A'}</p>
                                        <p><strong>Submitted At:</strong> {selectedApproval.approval.submitted_at ? formatDate(selectedApproval.approval.submitted_at) : 'N/A'}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Request Details</h4>
                                      <div className="space-y-2 text-sm">
                                        <p><strong>Headcount:</strong> {selectedApproval.approval.headcount || 1}</p>
                                        <p><strong>Project:</strong> {selectedApproval.approval.project_name || 'Not specified'}</p>
                                        <p><strong>Client:</strong> {selectedApproval.approval.client_name || 'Not specified'}</p>
                                        <p><strong>Cost Center:</strong> {selectedApproval.approval.cost_center || 'Not specified'}</p>
                                        <p><strong>Is Replacement:</strong> {selectedApproval.approval.is_replacement ? 'Yes' : 'No'}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Financial Details</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <p><strong>Salary Band:</strong> {formatCurrency(selectedApproval.approval.salary_band_min, selectedApproval.approval.currency || 'USD')} - {formatCurrency(selectedApproval.approval.salary_band_max, selectedApproval.approval.currency || 'USD')}</p>
                                      <p><strong>OPEX/CAPEX:</strong> {selectedApproval.approval.opex_capex || 'Not specified'}</p>
                                    </div>
                                  </div>

                                  {selectedApproval.approval.business_justification && (
                                    <div>
                                      <h4 className="font-medium mb-2">Business Justification</h4>
                                      <p className="text-sm bg-muted p-3 rounded-md">{selectedApproval.approval.business_justification}</p>
                                    </div>
                                  )}

                                  <div>
                                    <h4 className="font-medium mb-2">Approval Comments</h4>
                                    <Textarea
                                      value={comment}
                                      onChange={(e) => setComment(e.target.value)}
                                      placeholder="Add your approval comments..."
                                      rows={3}
                                    />
                                  </div>

                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => selectedApproval.currentStep && handleApproval(selectedApproval.currentStep.id, 'request_changes')}
                                      disabled={!selectedApproval.currentStep}
                                    >
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Request Changes
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => selectedApproval.currentStep && handleApproval(selectedApproval.currentStep.id, 'reject')}
                                      disabled={!selectedApproval.currentStep}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                    <Button
                                      onClick={() => selectedApproval.currentStep && handleApproval(selectedApproval.currentStep.id, 'approve')}
                                      disabled={!selectedApproval.currentStep}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved JDs Ready for Management Review */}
      <Card>
        <CardHeader>
          <CardTitle>Approved - Awaiting Management Review</CardTitle>
        </CardHeader>
        <CardContent>
          {approvedApprovals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No approved JDs ready for publishing
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
                    <TableHead>Approved At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedApprovals.map((item) => (
                    <TableRow key={item.approval.id}>
                      <TableCell className="font-medium">{item.approval.jd_id}</TableCell>
                      <TableCell>
                        {item.approval.project_name || item.approval.client_name || 'Not specified'}
                      </TableCell>
                      <TableCell>{item.approval.headcount || 1}</TableCell>
                      <TableCell>{getStatusBadge(item.approval.status)}</TableCell>
                      <TableCell>{formatDate(item.approval.updated_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              toast({
                                title: "Info",
                                description: "Publishing functionality will be implemented in the Publishing tab"
                              });
                            }}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Ready to Publish
                          </Button>
                        </div>
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