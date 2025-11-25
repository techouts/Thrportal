import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { OnOffboardingService } from '@/services/onoffboardingService';
import { 
  Search, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle,
  XCircle,
  ArrowRight,
  Users,
  MessageSquare
} from 'lucide-react';

interface OnboardingApproval {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  joiningDate: string;
  currentStep: 'manager' | 'hr' | 'finance' | 'it';
  currentApprover: string;
  comments?: string;
  approvalSteps: Array<{
    step: string;
    status: 'pending' | 'approved' | 'rejected';
    approver?: string;
    date?: string;
    comments?: string;
  }>;
}

export const OnboardingApprovalsTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState<OnboardingApproval[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, this would come from the service
      const mockApprovals: OnboardingApproval[] = [
        {
          id: '1',
          employeeId: 'EMP101',
          employeeName: 'Rajesh Kumar',
          department: 'Engineering',
          status: 'pending',
          submittedDate: '2024-02-08',
          joiningDate: '2024-02-12',
          currentStep: 'hr',
          currentApprover: 'HR Manager',
          comments: 'All documents submitted and verified',
          approvalSteps: [
            { step: 'manager', status: 'approved', approver: 'Tech Lead', date: '2024-02-09', comments: 'Welcome to the team!' },
            { step: 'hr', status: 'pending' },
            { step: 'finance', status: 'pending' },
            { step: 'it', status: 'pending' }
          ]
        },
        {
          id: '2',
          employeeId: 'EMP102',
          employeeName: 'Priya Sharma',
          department: 'Marketing',
          status: 'approved',
          submittedDate: '2024-02-05',
          joiningDate: '2024-02-08',
          currentStep: 'it',
          currentApprover: 'IT Manager',
          approvalSteps: [
            { step: 'manager', status: 'approved', approver: 'Marketing Manager', date: '2024-02-06' },
            { step: 'hr', status: 'approved', approver: 'HR Manager', date: '2024-02-07' },
            { step: 'finance', status: 'approved', approver: 'Finance Manager', date: '2024-02-07' },
            { step: 'it', status: 'approved', approver: 'IT Manager', date: '2024-02-08' }
          ]
        },
        {
          id: '3',
          employeeId: 'EMP103',
          employeeName: 'Amit Patel',
          department: 'Sales',
          status: 'rejected',
          submittedDate: '2024-02-01',
          joiningDate: '2024-02-05',
          currentStep: 'hr',
          currentApprover: 'HR Manager',
          comments: 'Missing background verification documents',
          approvalSteps: [
            { step: 'manager', status: 'approved', approver: 'Sales Manager', date: '2024-02-02' },
            { step: 'hr', status: 'rejected', approver: 'HR Manager', date: '2024-02-03', comments: 'BGV documents pending' },
            { step: 'finance', status: 'pending' },
            { step: 'it', status: 'pending' }
          ]
        }
      ];
      setApprovals(mockApprovals);
    } catch (error) {
      console.error('Failed to load approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStepColor = (step: string) => {
    const colors = {
      'manager': 'bg-blue-100 text-blue-800 border-blue-200',
      'hr': 'bg-purple-100 text-purple-800 border-purple-200',
      'finance': 'bg-green-100 text-green-800 border-green-200',
      'it': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[step as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredApprovals = approvals.filter(approval => {
    const matchesFilter = filter === 'all' || approval.status === filter;
    const matchesSearch = 
      approval.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const approvalCounts = {
    all: approvals.length,
    pending: approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Onboarding Approvals</h2>
        <p className="text-muted-foreground">
          Manage approval workflows for new employee onboarding
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by employee name, ID, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {Object.entries(approvalCounts).map(([status, count]) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
          </Button>
        ))}
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <div className="text-lg font-medium">No approvals found</div>
              <div className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : `No ${filter} approvals at the moment`}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredApprovals.map((approval) => (
            <Card key={approval.id} className="border border-border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{approval.employeeName}</h3>
                        <Badge variant="outline" className={getStatusColor(approval.status)}>
                          {approval.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>ID: {approval.employeeId}</span>
                        <span>Department: {approval.department}</span>
                        <span>Joining Date: {approval.joiningDate}</span>
                        <span>Submitted: {approval.submittedDate}</span>
                      </div>
                    </div>
                    {approval.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Current Step Info */}
                  {approval.status === 'pending' && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Pending approval from {approval.currentApprover} ({approval.currentStep.toUpperCase()})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  {approval.comments && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-600 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-800">Comments</div>
                          <div className="text-sm text-gray-600">{approval.comments}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Approval Timeline */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Approval Timeline</h4>
                    <div className="grid grid-cols-4 gap-4">
                      {approval.approvalSteps.map((step, index) => (
                        <div key={step.step} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getStepColor(step.step)}>
                              {step.step.toUpperCase()}
                            </Badge>
                            {step.status === 'approved' && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            {step.status === 'rejected' && (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            {step.status === 'pending' && (
                              <Clock className="h-4 w-4 text-yellow-600" />
                            )}
                            {index < approval.approvalSteps.length - 1 && step.status === 'approved' && (
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="text-xs space-y-1">
                            <div className="font-medium">
                              {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                            </div>
                            {step.approver && (
                              <div className="text-muted-foreground">
                                by {step.approver}
                              </div>
                            )}
                            {step.date && (
                              <div className="text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {step.date}
                              </div>
                            )}
                            {step.comments && (
                              <div className="text-muted-foreground">
                                "{step.comments}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};