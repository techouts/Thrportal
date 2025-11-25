import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Shield,
  Edit,
  Eye
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ProfileChangeMetrics {
  totalChanges: number;
  pendingChanges: number;
  approvedChanges: number;
  rejectedChanges: number;
  sensitiveChanges: number;
  changesByCategory: Array<{ category: string; count: number; sensitive: boolean }>;
  recentChanges: Array<{
    id: string;
    employeeName: string;
    changeType: string;
    field: string;
    oldValue: string;
    newValue: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    sensitive: boolean;
    reviewedBy?: string;
  }>;
}

interface ProfileChangesDashboardProps {
  metrics: ProfileChangeMetrics;
  loading?: boolean;
}

export function ProfileChangesDashboard({ metrics, loading }: ProfileChangesDashboardProps) {
  // Safely define data with null checks
  const statusData = metrics ? [
    { name: 'Approved', value: metrics.approvedChanges, color: '#22c55e' },
    { name: 'Pending', value: metrics.pendingChanges, color: '#f59e0b' },
    { name: 'Rejected', value: metrics.rejectedChanges, color: '#ef4444' }
  ] : [];

  const categoryData = [
    { category: 'Personal Info', changes: 15, sensitive: 3 },
    { category: 'Contact Details', changes: 22, sensitive: 0 },
    { category: 'Bank Details', changes: 8, sensitive: 8 },
    { category: 'Emergency Contact', changes: 12, sensitive: 0 },
    { category: 'Tax Information', changes: 6, sensitive: 6 },
    { category: 'Address', changes: 18, sensitive: 2 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSensitivityBadge = (sensitive: boolean) => {
    if (sensitive) {
      return (
        <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">
          <Shield className="w-3 h-3 mr-1" />
          Sensitive
        </Badge>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-2xl animate-pulse">
              <CardHeader><div className="h-4 bg-muted rounded w-24" /></CardHeader>
              <CardContent><div className="h-8 bg-muted rounded w-16" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Total Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalChanges || 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{metrics?.pendingChanges || 0}</div>
              {metrics && metrics.pendingChanges > 10 && (
                <Badge variant="destructive" className="text-xs">High</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Requires approval</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-500" />
              Sensitive Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.sensitiveChanges || 0}</div>
            <p className="text-xs text-muted-foreground">Dual approval required</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Approval Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics && (metrics.approvedChanges + metrics.rejectedChanges) > 0 
                ? Math.round((metrics.approvedChanges / (metrics.approvedChanges + metrics.rejectedChanges)) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Change Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Changes by Category */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Changes by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="changes" fill="#3b82f6" name="Total Changes" />
                <Bar dataKey="sensitive" fill="#ef4444" name="Sensitive" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Changes */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Recent Profile Changes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(metrics?.recentChanges || []).slice(0, 10).map((change) => (
              <div key={change.id} className={`border rounded-xl p-4 ${change.sensitive ? 'border-red-200 bg-red-50' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium">{change.employeeName}</div>
                    <div className="text-sm text-muted-foreground">
                      {change.changeType} • {new Date(change.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSensitivityBadge(change.sensitive)}
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(change.status)}
                    >
                      {change.status.charAt(0).toUpperCase() + change.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Field:</span> {change.field}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-red-600">From:</span>
                      <div className="bg-red-50 border border-red-200 rounded p-2 mt-1">
                        {change.oldValue || 'Not set'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-green-600">To:</span>
                      <div className="bg-green-50 border border-green-200 rounded p-2 mt-1">
                        {change.newValue}
                      </div>
                    </div>
                  </div>
                  {change.reviewedBy && (
                    <div className="text-xs text-muted-foreground">
                      Reviewed by: {change.reviewedBy}
                    </div>
                  )}
                </div>

                {change.status === 'pending' && (
                  <div className="flex gap-2 pt-3 border-t mt-3">
                    <Button size="sm" className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Reject
                    </Button>
                    <Button size="sm" variant="ghost" className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      View Details
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Analysis */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Change Category Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(metrics?.changesByCategory || []).map((category, index) => (
              <div key={index} className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{category.category}</h4>
                  {category.sensitive && (
                    <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 text-xs">
                      Sensitive
                    </Badge>
                  )}
                </div>
                <div className="text-2xl font-bold">{category.count}</div>
                <div className="text-xs text-muted-foreground">
                  Changes this month
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}