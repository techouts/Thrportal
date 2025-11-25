import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Target, Clock, AlertTriangle } from 'lucide-react';

export default function CRMDashboardPage() {
  // Mock data for dashboard - will be replaced with real data from CrmService
  const metrics = {
    total_clients: 45,
    active_clients: 38,
    total_jds: 23,
    avg_health_score: 75,
    sla_compliance: 85,
    recent_interactions: 12
  };

  const topClients = [
    { id: '1', name: 'TechCorp Inc', industry: 'Technology', jds: 8, closures: 5, health_score: 92 },
    { id: '2', name: 'Global Finance Ltd', industry: 'Finance', jds: 12, closures: 7, health_score: 88 },
    { id: '3', name: 'HealthCare Plus', industry: 'Healthcare', jds: 6, closures: 4, health_score: 85 }
  ];

  const slaAlerts = [
    { client: 'TechCorp Inc', type: 'JD Response Time', overdue_days: 2, priority: 'High' },
    { client: 'StartupXYZ', type: 'Document Renewal', overdue_days: 15, priority: 'Medium' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM Dashboard"
        description="Recruitment Customer Relationship Management overview"
      />
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_clients}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.active_clients} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active JDs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_jds}</div>
            <p className="text-xs text-muted-foreground">
              Across all clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Health Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avg_health_score}%</div>
            <Progress value={metrics.avg_health_score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sla_compliance}%</div>
            <Progress value={metrics.sla_compliance} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Clients</CardTitle>
            <CardDescription>
              Ranked by JDs and closure rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between border-b pb-2">
                  <div className="space-y-1">
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.industry}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{client.jds} JDs</Badge>
                      <Badge variant="outline">{client.closures} Closures</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Health:</span>
                      <Badge 
                        variant={client.health_score >= 80 ? "default" : "secondary"}
                      >
                        {client.health_score}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SLA Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              SLA Alerts
            </CardTitle>
            <CardDescription>
              Active SLA breaches and upcoming deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {slaAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div className="space-y-1">
                    <p className="font-medium">{alert.client}</p>
                    <p className="text-sm text-muted-foreground">{alert.type}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge 
                      variant={alert.priority === 'High' ? "destructive" : "secondary"}
                    >
                      {alert.priority}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {alert.overdue_days} days overdue
                    </p>
                  </div>
                </div>
              ))}
              {slaAlerts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active SLA alerts
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recruiter Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Recruiter Performance by Client</CardTitle>
          <CardDescription>
            Top performing recruiters across key clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Recruiter performance data will be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}