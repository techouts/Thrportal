import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Settings, CheckCircle, AlertTriangle, RefreshCw, Link } from 'lucide-react';
import { OnOffboardingService } from '@/services/onoffboardingService';

interface IntegrationStatus {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  status: 'connected' | 'error' | 'pending';
  lastSync?: string;
  errorMessage?: string;
}

export const OffboardingIntegrationTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      // Mock integration data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockIntegrations: IntegrationStatus[] = [
        {
          id: 'hr_employee_master',
          name: 'HR Employee Master',
          description: 'Update employee status and records in the master database',
          enabled: true,
          status: 'connected',
          lastSync: new Date().toISOString()
        },
        {
          id: 'finance_payroll',
          name: 'Finance & Payroll',
          description: 'Trigger FnF settlement and final payroll processing',
          enabled: true,
          status: 'connected',
          lastSync: new Date().toISOString()
        },
        {
          id: 'it_assets',
          name: 'IT Asset Management',
          description: 'Initiate asset recovery and access deactivation',
          enabled: true,
          status: 'connected',
          lastSync: new Date().toISOString()
        },
        {
          id: 'attendance_system',
          name: 'Attendance System',
          description: 'Deactivate biometric and attendance tracking',
          enabled: true,
          status: 'connected',
          lastSync: new Date().toISOString()
        },
        {
          id: 'email_deactivation',
          name: 'Email & Communication',
          description: 'Deactivate email accounts and communication access',
          enabled: false,
          status: 'pending'
        },
        {
          id: 'learning_platform',
          name: 'Learning Platform',
          description: 'Export learning records and deactivate access',
          enabled: true,
          status: 'error',
          errorMessage: 'API authentication failed'
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
      case 'connected':
        return 'bg-emerald-500/20 text-emerald-700';
      case 'error':
        return 'bg-red-500/20 text-red-700';
      case 'pending':
        return 'bg-amber-500/20 text-amber-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  const handleToggleIntegration = async (integrationId: string, enabled: boolean) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, enabled, status: enabled ? 'connected' : 'pending' }
          : integration
      )
    );
    
    // Here you would make an API call to actually toggle the integration
    console.log(`Toggling integration ${integrationId} to ${enabled}`);
  };

  const handleRefreshIntegration = async (integrationId: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'pending' }
          : integration
      )
    );
    
    // Simulate refresh
    setTimeout(() => {
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, status: 'connected', lastSync: new Date().toISOString() }
            : integration
        )
      );
    }, 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
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
      <div>
        <h3 className="text-lg font-semibold">Offboarding Integrations</h3>
        <p className="text-muted-foreground">
          Configure how offboarding processes integrate with other systems
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Link className="h-4 w-4" />
                    <span>{integration.name}</span>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {integration.description}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className={getStatusColor(integration.status)}
                  >
                    {getStatusIcon(integration.status)}
                    <span className="ml-1 capitalize">{integration.status}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Enable Integration</span>
                  </div>
                  <Switch
                    checked={integration.enabled}
                    onCheckedChange={(enabled) => 
                      handleToggleIntegration(integration.id, enabled)
                    }
                  />
                </div>

                {integration.lastSync && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Last Sync:</span>
                    <span className="font-medium">
                      {new Date(integration.lastSync).toLocaleString()}
                    </span>
                  </div>
                )}

                {integration.errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Error:</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">{integration.errorMessage}</p>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRefreshIntegration(integration.id)}
                    disabled={!integration.enabled}
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Sync
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!integration.enabled}
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Settings</CardTitle>
          <CardDescription>
            Global settings for offboarding integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Auto-trigger integrations</div>
                <div className="text-sm text-muted-foreground">
                  Automatically trigger integrations when offboarding is approved
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Send notifications on failure</div>
                <div className="text-sm text-muted-foreground">
                  Send email notifications when integrations fail
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Retry failed integrations</div>
                <div className="text-sm text-muted-foreground">
                  Automatically retry failed integrations up to 3 times
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};