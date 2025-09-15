import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Eye, Send } from 'lucide-react';
import { JobDescription } from '@/types/hiring-extended';
import { hiringExtendedService } from '@/services/hiringExtendedService';
import { useToast } from '@/hooks/use-toast';

export function ExternalApprovalsTab() {
  const [pendingJDs, setPendingJDs] = useState<JobDescription[]>([]);
  const [approvedJDs, setApprovedJDs] = useState<JobDescription[]>([]);
  const [selectedJD, setSelectedJD] = useState<JobDescription | null>(null);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      const allJDs = await hiringExtendedService.getJDs({ approval_path: 'EXTERNAL' });
      setPendingJDs(allJDs.filter(jd => jd.status === 'PendingApproval'));
      setApprovedJDs(allJDs.filter(jd => jd.status === 'Approved'));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load external approvals",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (jdId: string) => {
    try {
      await hiringExtendedService.approveJD(jdId, 'STAFFING_MANAGER', comment);
      toast({
        title: "Success",
        description: "External JD approved successfully"
      });
      setComment('');
      await loadApprovals();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve JD",
        variant: "destructive"
      });
    }
  };

  const handlePublish = async (jdId: string) => {
    try {
      await hiringExtendedService.publishJD(jdId);
      toast({
        title: "Success",
        description: "External JD published successfully"
      });
      await loadApprovals();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish JD",
        variant: "destructive"
      });
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
      {/* Pending External Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Pending External Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingJDs.length === 0 ? (
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
                    <TableHead>Priority</TableHead>
                    <TableHead>CTC Range</TableHead>
                    <TableHead>Hiring Manager</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingJDs.map((jd) => (
                    <TableRow key={jd.id}>
                      <TableCell className="font-medium">{jd.job_title}</TableCell>
                      <TableCell>{jd.client_name || 'Not specified'}</TableCell>
                      <TableCell>
                        <Badge variant={jd.priority === 'Critical' ? 'destructive' : jd.priority === 'High' ? 'default' : 'secondary'}>
                          {jd.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {jd.min_ctc_annual && jd.max_ctc_annual ? (
                          <>
                            {formatCurrency(jd.min_ctc_annual, jd.currency)} - {formatCurrency(jd.max_ctc_annual, jd.currency)}
                          </>
                        ) : (
                          'Not specified'
                        )}
                      </TableCell>
                      <TableCell>{jd.hiring_manager_email}</TableCell>
                      <TableCell>{new Date(jd.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setSelectedJD(jd)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Review External JD: {selectedJD?.job_title}</DialogTitle>
                              </DialogHeader>
                              {selectedJD && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Client Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <p><strong>Client:</strong> {selectedJD.client_name || 'Not specified'}</p>
                                        <p><strong>Project Code:</strong> {selectedJD.project_code || 'Not specified'}</p>
                                        <p><strong>Hiring Manager:</strong> {selectedJD.hiring_manager_email}</p>
                                        <p><strong>Recruiter:</strong> {selectedJD.recruiter_owner_email}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Job Details</h4>
                                      <div className="space-y-2 text-sm">
                                        <p><strong>Department:</strong> {selectedJD.department}</p>
                                        <p><strong>Openings:</strong> {selectedJD.openings}</p>
                                        <p><strong>Priority:</strong> {selectedJD.priority}</p>
                                        <p><strong>Employment Type:</strong> {selectedJD.employment_type}</p>
                                        <p><strong>Location:</strong> {selectedJD.location}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-2">Compensation & Experience</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <p><strong>CTC Range:</strong> {formatCurrency(selectedJD.min_ctc_annual, selectedJD.currency)} - {formatCurrency(selectedJD.max_ctc_annual, selectedJD.currency)}</p>
                                      <p><strong>Experience:</strong> {selectedJD.min_exp_years}-{selectedJD.max_exp_years} years</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Skills Required</h4>
                                    <div className="space-y-2">
                                      <div>
                                        <span className="text-sm font-medium">Primary: </span>
                                        {selectedJD.skills_primary?.map((skill, index) => (
                                          <Badge key={index} variant="default" className="mr-1">{skill}</Badge>
                                        ))}
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium">Secondary: </span>
                                        {selectedJD.skills_secondary?.map((skill, index) => (
                                          <Badge key={index} variant="secondary" className="mr-1">{skill}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-2">Job Description</h4>
                                    <p className="text-sm bg-muted p-3 rounded-md">{selectedJD.job_description}</p>
                                  </div>

                                  {selectedJD.must_have && (
                                    <div>
                                      <h4 className="font-medium mb-2">Must Have Requirements</h4>
                                      <p className="text-sm bg-muted p-3 rounded-md">{selectedJD.must_have}</p>
                                    </div>
                                  )}

                                  <div>
                                    <h4 className="font-medium mb-2">Staffing Manager Comments</h4>
                                    <Textarea
                                      value={comment}
                                      onChange={(e) => setComment(e.target.value)}
                                      placeholder="Add your approval comments..."
                                      rows={3}
                                    />
                                  </div>

                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="destructive"
                                      onClick={() => {
                                        toast({
                                          title: "JD Rejected",
                                          description: "This functionality would reject the external JD"
                                        });
                                      }}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                    <Button
                                      onClick={() => handleApproval(selectedJD.id)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve for Publishing
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

      {/* Approved External JDs Ready for Publishing */}
      <Card>
        <CardHeader>
          <CardTitle>Approved - Ready for Publishing</CardTitle>
        </CardHeader>
        <CardContent>
          {approvedJDs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No external JDs ready for publishing
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Approved By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedJDs.map((jd) => (
                    <TableRow key={jd.id}>
                      <TableCell className="font-medium">{jd.job_title}</TableCell>
                      <TableCell>{jd.client_name || 'Not specified'}</TableCell>
                      <TableCell>
                        <Badge variant={jd.priority === 'Critical' ? 'destructive' : jd.priority === 'High' ? 'default' : 'secondary'}>
                          {jd.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>Staffing Manager</TableCell>
                      <TableCell>
                        <Button 
                          size="sm"
                          onClick={() => handlePublish(jd.id)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Publish JD
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