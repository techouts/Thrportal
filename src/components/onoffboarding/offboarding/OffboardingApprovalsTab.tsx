import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Clock, AlertTriangle, User, Calendar, MessageSquare } from 'lucide-react';
import { OnOffboardingService } from '@/services/onoffboardingService';
import type { OffboardingApproval } from '@/types/onoffboarding';

export const OffboardingApprovalsTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState<OffboardingApproval[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const response = await OnOffboardingService.getOffboardingApprovals();
      if (response.success) {
        setApprovals(response.data);
      }
    } catch (error) {
      console.error('Failed to load offboarding approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/20 text-amber-700';
      case 'approved':
        return 'bg-emerald-500/20 text-emerald-700';
      case 'rejected':
        return 'bg-red-500/20 text-red-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStepColor = (step: string) => {
    switch (step) {
      case 'manager':
        return 'bg-blue-500/20 text-blue-700';
      case 'hr':
        return 'bg-purple-500/20 text-purple-700';
      case 'finance':
        return 'bg-green-500/20 text-green-700';
      case 'it':
        return 'bg-orange-500/20 text-orange-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredApprovals = approvals.filter(approval => {
    if (filter === 'all') return true;
    return approval.status === filter;
  });

  const approvalCounts = {
    all: approvals.length,
    pending: approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex space-x-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Offboarding Approvals</h3>
          <p className="text-muted-foreground">
            Track and manage offboarding approval workflows
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All ({approvalCounts.all})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          size="sm"
        >
          Pending ({approvalCounts.pending})
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          onClick={() => setFilter('approved')}
          size="sm"
        >
          Approved ({approvalCounts.approved})
        </Button>
        <Button
          variant={filter === 'rejected' ? 'default' : 'outline'}
          onClick={() => setFilter('rejected')}
          size="sm"
        >
          Rejected ({approvalCounts.rejected})
        </Button>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.map((approval) => (
          <Card key={approval.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-lg">{approval.employeeName}</h4>
                    <Badge
                      variant="outline"
                      className={getStepColor(approval.currentStep)}
                    >
                      {approval.currentStep.toUpperCase()} Review
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Department: {approval.department}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Submitted: {new Date(approval.submittedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Last Working Day: {new Date(approval.lastWorkingDay).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Current Approver: {approval.currentApprover}</span>
                  </div>

                  {approval.comments && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Comments:</span>
                      </div>
                      <p className="text-sm text-muted-foreground italic">"{approval.comments}"</p>
                    </div>
                  )}

                  {/* Approval Timeline */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Approval Progress:</h5>
                    <div className="flex space-x-4">
                      {['manager', 'hr', 'finance', 'it'].map((step, index) => {
                        const isCompleted = approval.approvalSteps.some(
                          s => s.step === step && s.status === 'approved'
                        );
                        const isCurrent = approval.currentStep === step;
                        const isRejected = approval.approvalSteps.some(
                          s => s.step === step && s.status === 'rejected'
                        );

                        return (
                          <div key={step} className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                              isCompleted 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : isCurrent 
                                ? 'border-blue-500 text-blue-500'
                                : isRejected
                                ? 'border-red-500 text-red-500'
                                : 'border-muted text-muted-foreground'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : isCurrent ? (
                                <Clock className="h-4 w-4" />
                              ) : isRejected ? (
                                <AlertTriangle className="h-4 w-4" />
                              ) : (
                                <span className="text-xs">{index + 1}</span>
                              )}
                            </div>
                            <span className="text-xs capitalize">{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-3">
                  <Badge
                    variant="secondary"
                    className={getStatusColor(approval.status)}
                  >
                    {approval.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                  
                  <div className="flex space-x-2">
                    {approval.status === 'pending' && (
                      <>
                        <Button variant="outline" size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button variant="outline" size="sm">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApprovals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <div className="text-lg font-medium mb-2">
              No {filter !== 'all' ? filter + ' ' : ''}approvals found
            </div>
            <div className="text-muted-foreground">
              {filter === 'all' 
                ? 'No offboarding approvals have been submitted yet'
                : `No ${filter} approvals at the moment`
              }
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};