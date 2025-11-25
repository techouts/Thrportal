import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { OnOffboardingService } from '@/services/onoffboardingService';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Settings,
  ArrowRight,
  Users,
  DollarSign,
  Monitor,
  Briefcase,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface IntegrationStatus {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  status: 'connected' | 'error' | 'pending';
  lastSync: string;
  errorMessage?: string;
  icon: React.ReactNode;
}

export const OnboardingIntegrationTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, this would come from the service
      const mockIntegrations: IntegrationStatus[] = [
        {
          id: '1',
          name: 'Hiring Module',
          description: 'Auto-trigger onboarding when offer is accepted in hiring module',
          enabled: true,
          status: 'connected',
          lastSync: '2024-02-10 14:30',
          icon: <Users className="h-5 w-5" />
        },
        {
          id: '2',
          name: 'Employee Master',
          description: 'Sync employee data to HR employee master database',
          enabled: true,
          status: 'connected',
          lastSync: '2024-02-10 14:25',
          icon: <Briefcase className="h-5 w-5" />
        },
        {
          id: '3',
          name: 'Payroll System',
          description: 'Setup payroll, tax calculations, and benefits enrollment',
          enabled: true,
          status: 'error',
          lastSync: '2024-02-10 10:15',
          errorMessage: 'Failed to sync tax calculation parameters',
          icon: <DollarSign className="h-5 w-5" />
        },
        {
          id: '4',
          name: 'IT Asset Management',
          description: 'Trigger IT asset allocation and access provisioning',
          enabled: true,
          status: 'connected',
          lastSync: '2024-02-10 14:20',
          icon: <Monitor className="h-5 w-5" />
        },
        {
          id: '5',
          name: 'Learning Management',
          description: 'Enroll new employees in mandatory training programs',
          enabled: false,
          status: 'pending',
          lastSync: 'Never',
          icon: <Users className="h-5 w-5" />
        }
      ];
      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleToggleIntegration = async (integrationId: string) => {
    const updatedIntegrations = integrations.map(integration => {
      if (integration.id === integrationId) {
        return { ...integration, enabled: !integration.enabled };
      }
      return integration;
    });
    setIntegrations(updatedIntegrations);
    // Here you would typically call an API to update the integration status
  };

  const handleRefreshIntegration = async (integrationId: string) => {
    const updatedIntegrations = integrations.map(integration => {
      if (integration.id === integrationId) {
        return { ...integration, status: 'pending' as const };
      }
      return integration;
    });
    setIntegrations(updatedIntegrations);
    
    // Simulate API call
    setTimeout(() => {
      const finalIntegrations = integrations.map(integration => {
        if (integration.id === integrationId) {
          return { 
            ...integration, 
            status: 'connected' as const, 
            lastSync: new Date().toLocaleString(),
            errorMessage: undefined
          };
        }
        return integration;
      });
      setIntegrations(finalIntegrations);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
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
        <h2 className="text-2xl font-bold">Onboarding Integration</h2>
        <p className="text-muted-foreground">
          Manage integrations with other systems for seamless onboarding workflow
        </p>
      </div>

      {/* Integration Flow Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Onboarding Flow Overview
          </CardTitle>
          <CardDescription>
            Automated workflow from offer acceptance to first day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-1 text-blue-600" />
                <div className="text-xs font-medium">Hiring</div>
                <div className="text-xs text-muted-foreground">Offer Accepted</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-1 text-green-600" />
                <div className="text-xs font-medium">Auto-Trigger</div>
                <div className="text-xs text-muted-foreground">Onboarding Started</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <Briefcase className="h-8 w-8 mx-auto mb-1 text-purple-600" />
                <div className="text-xs font-medium">Employee Master</div>
                <div className="text-xs text-muted-foreground">Profile Created</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <Monitor className="h-8 w-8 mx-auto mb-1 text-orange-600" />
                <div className="text-xs font-medium">IT Assets</div>
                <div className="text-xs text-muted-foreground">Access Granted</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-1 text-green-600" />
                <div className="text-xs font-medium">Payroll</div>
                <div className="text-xs text-muted-foreground">Setup Complete</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Cards */}
      <div className="grid gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id} className="border border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {integration.icon}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{integration.name}</h3>
                      <Badge variant="outline" className={getStatusColor(integration.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(integration.status)}
                          {integration.status}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {integration.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Last sync: {integration.lastSync}
                    </div>
                    {integration.errorMessage && (
                      <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div className="text-sm text-red-800">
                          {integration.errorMessage}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label htmlFor={`toggle-${integration.id}`} className="text-sm font-medium">
                      {integration.enabled ? 'Enabled' : 'Disabled'}
                    </label>
                    <Switch
                      id={`toggle-${integration.id}`}
                      checked={integration.enabled}
                      onCheckedChange={() => handleToggleIntegration(integration.id)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRefreshIntegration(integration.id)}
                    disabled={!integration.enabled}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Sync
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Global Integration Settings</CardTitle>
          <CardDescription>
            Configure global settings for onboarding integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium">Auto-trigger onboarding</div>
              <div className="text-sm text-muted-foreground">
                Automatically start onboarding when offer is accepted in hiring module
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium">Failure notifications</div>
              <div className="text-sm text-muted-foreground">
                Send email notifications when integration sync fails
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium">Retry failed syncs</div>
              <div className="text-sm text-muted-foreground">
                Automatically retry failed integration syncs up to 3 times
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};