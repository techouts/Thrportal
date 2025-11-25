import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Download, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { candidateSecurityService } from '@/services/candidateSecurityService';
import { SecurityConfiguration } from '@/types/candidateSecurity';

export function ComplianceTab() {
  const [config, setConfig] = useState<SecurityConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const data = await candidateSecurityService.getSecurityConfiguration();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuditSettingChange = (key: string, value: any) => {
    if (!config) return;
    
    setConfig({
      ...config,
      auditSettings: {
        ...config.auditSettings,
        [key]: value
      }
    });
    setUnsavedChanges(true);
  };

  const handleComplianceSettingChange = (key: string, value: any) => {
    if (!config) return;
    
    setConfig({
      ...config,
      complianceSettings: {
        ...config.complianceSettings,
        [key]: value
      }
    });
    setUnsavedChanges(true);
  };

  const saveConfiguration = async () => {
    if (!config) return;
    
    try {
      await candidateSecurityService.updateSecurityConfiguration(config);
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  };

  const exportComplianceReport = async () => {
    try {
      const reportUrl = await candidateSecurityService.exportComplianceReport();
      window.open(reportUrl, '_blank');
    } catch (error) {
      console.error('Failed to export compliance report:', error);
    }
  };

  if (loading || !config) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading compliance configuration...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance & Security Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Configure audit logging, data retention, and compliance settings for GDPR/DPDP
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unsavedChanges && (
                <Button onClick={saveConfiguration}>
                  Save Changes
                </Button>
              )}
              <Button variant="outline" onClick={exportComplianceReport}>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Audit Logging
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Enable Audit Logging</label>
                <p className="text-xs text-muted-foreground">Log all security events and actions</p>
              </div>
              <Switch
                checked={config.auditSettings.enableAuditLogging}
                onCheckedChange={(checked) => handleAuditSettingChange('enableAuditLogging', checked)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Log Retention (days)</label>
              <Input
                type="number"
                value={config.auditSettings.retentionDays}
                onChange={(e) => handleAuditSettingChange('retentionDays', parseInt(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Log Successful Actions</label>
                <p className="text-xs text-muted-foreground">Track successful operations</p>
              </div>
              <Switch
                checked={config.auditSettings.logSuccessfulActions}
                onCheckedChange={(checked) => handleAuditSettingChange('logSuccessfulActions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Log Failed Actions</label>
                <p className="text-xs text-muted-foreground">Track failed operations and security violations</p>
              </div>
              <Switch
                checked={config.auditSettings.logFailedActions}
                onCheckedChange={(checked) => handleAuditSettingChange('logFailedActions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Log Data Access</label>
                <p className="text-xs text-muted-foreground">Track access to sensitive candidate data</p>
              </div>
              <Switch
                checked={config.auditSettings.logDataAccess}
                onCheckedChange={(checked) => handleAuditSettingChange('logDataAccess', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Real-time Alerts</label>
                <p className="text-xs text-muted-foreground">Send alerts for suspicious activities</p>
              </div>
              <Switch
                checked={config.auditSettings.realTimeAlerts}
                onCheckedChange={(checked) => handleAuditSettingChange('realTimeAlerts', checked)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Failed Login Threshold</label>
                <Input
                  type="number"
                  value={config.auditSettings.alertThresholds.failedLoginAttempts}
                  onChange={(e) => handleAuditSettingChange('alertThresholds', {
                    ...config.auditSettings.alertThresholds,
                    failedLoginAttempts: parseInt(e.target.value)
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Suspicious Activity Score</label>
                <Input
                  type="number"
                  value={config.auditSettings.alertThresholds.suspiciousActivityScore}
                  onChange={(e) => handleAuditSettingChange('alertThresholds', {
                    ...config.auditSettings.alertThresholds,
                    suspiciousActivityScore: parseInt(e.target.value)
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data Protection Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">GDPR Compliance</label>
                <p className="text-xs text-muted-foreground">Enable GDPR data protection features</p>
              </div>
              <Switch
                checked={config.complianceSettings.gdprEnabled}
                onCheckedChange={(checked) => handleComplianceSettingChange('gdprEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">DPDP Compliance</label>
                <p className="text-xs text-muted-foreground">Enable India DPDP Act compliance</p>
              </div>
              <Switch
                checked={config.complianceSettings.dpdpEnabled}
                onCheckedChange={(checked) => handleComplianceSettingChange('dpdpEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Consent Required</label>
                <p className="text-xs text-muted-foreground">Require explicit consent for data processing</p>
              </div>
              <Switch
                checked={config.complianceSettings.consentRequired}
                onCheckedChange={(checked) => handleComplianceSettingChange('consentRequired', checked)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Retention (days)</label>
              <Input
                type="number"
                value={config.complianceSettings.dataRetentionDays}
                onChange={(e) => handleComplianceSettingChange('dataRetentionDays', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">How long to retain candidate data</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Data Anonymization</label>
                <p className="text-xs text-muted-foreground">Anonymize data after retention period</p>
              </div>
              <Switch
                checked={config.complianceSettings.anonymizationEnabled}
                onCheckedChange={(checked) => handleComplianceSettingChange('anonymizationEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Right to be Forgotten</label>
                <p className="text-xs text-muted-foreground">Allow candidates to request data deletion</p>
              </div>
              <Switch
                checked={config.complianceSettings.rightToForgotten}
                onCheckedChange={(checked) => handleComplianceSettingChange('rightToForgotten', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Data Portability</label>
                <p className="text-xs text-muted-foreground">Allow candidates to export their data</p>
              </div>
              <Switch
                checked={config.complianceSettings.dataPortability}
                onCheckedChange={(checked) => handleComplianceSettingChange('dataPortability', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Consent Withdrawal</label>
                <p className="text-xs text-muted-foreground">Allow candidates to withdraw consent</p>
              </div>
              <Switch
                checked={config.complianceSettings.consentWithdrawalEnabled}
                onCheckedChange={(checked) => handleComplianceSettingChange('consentWithdrawalEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-sm">Configuration Active</div>
                <div className="text-xs text-muted-foreground">Last updated: {new Date(config.updatedAt).toLocaleString()}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-sm">Audit Retention</div>
                <div className="text-xs text-muted-foreground">{config.auditSettings.retentionDays} days</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Shield className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-medium text-sm">Compliance Level</div>
                <div className="text-xs text-muted-foreground">
                  {config.complianceSettings.gdprEnabled && config.complianceSettings.dpdpEnabled 
                    ? 'Full Compliance' 
                    : 'Partial Compliance'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}