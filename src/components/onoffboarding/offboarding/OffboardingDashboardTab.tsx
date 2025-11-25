import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, AlertTriangle, CheckCircle, Clock, FileText, Package } from 'lucide-react';
import { OnOffboardingService } from '@/services/onoffboardingService';
import type { OffboardingEmployee } from '@/types/onoffboarding';

export const OffboardingDashboardTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<OffboardingEmployee[]>([]);
  const [stats, setStats] = useState({
    totalResignations: 0,
    pendingApprovals: 0,
    exitInterviewsCompleted: 0,
    assetRecoveryPending: 0,
    fnfSettlementPending: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [employeesResponse, statsResponse] = await Promise.all([
        OnOffboardingService.getOffboardingEmployees(),
        OnOffboardingService.getOffboardingStats()
      ]);

      if (employeesResponse.success) {
        setEmployees(employeesResponse.data);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load offboarding dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-amber-500/20 text-amber-700';
      case 'approved':
        return 'bg-blue-500/20 text-blue-700';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-700';
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Resignations
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResignations}</div>
            <p className="text-xs text-muted-foreground">
              Employees in offboarding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats.pendingApprovals}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting manager approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Exit Interviews
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {stats.exitInterviewsCompleted}%
            </div>
            <p className="text-xs text-muted-foreground">
              Completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Asset Recovery
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.assetRecoveryPending}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending returns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              FnF Settlement
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.fnfSettlementPending}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending settlements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Offboarding Employees */}
      <Card>
        <CardHeader>
          <CardTitle>Active Offboarding Pipeline</CardTitle>
          <CardDescription>
            Employees currently in the offboarding process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {employee.employeeName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{employee.employeeName}</div>
                    <div className="text-sm text-muted-foreground">
                      {employee.department} • Last Working Day: {new Date(employee.lastWorkingDay).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {employee.completionPercentage}% Complete
                    </div>
                    <Progress value={employee.completionPercentage} className="w-20" />
                  </div>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(employee.status)}
                  >
                    {employee.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
              </div>
            ))}
            {employees.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium">No Active Offboarding</div>
                <div className="text-sm">All employees are successfully onboarded</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};