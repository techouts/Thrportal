import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { ApprovalRulesTab } from './ApprovalRulesTab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Clock, AlertTriangle, Settings } from 'lucide-react';

function ApproverGroupsTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Approver Groups</h3>
          <p className="text-sm text-muted-foreground">
            Map roles to specific users for approval workflows
          </p>
        </div>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Add Mapping
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No approver groups configured yet
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SLASettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">SLA Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure default SLA hours and escalation rules
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Default SLA Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hr_sla">HR Manager</Label>
              <Input id="hr_sla" type="number" defaultValue="24" />
            </div>
            <div>
              <Label htmlFor="staffing_sla">Staffing Manager</Label>
              <Input id="staffing_sla" type="number" defaultValue="24" />
            </div>
            <div>
              <Label htmlFor="finance_sla">Finance Manager</Label>
              <Input id="finance_sla" type="number" defaultValue="48" />
            </div>
            <div>
              <Label htmlFor="management_sla">Management</Label>
              <Input id="management_sla" type="number" defaultValue="72" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Escalation Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="escalation_threshold">Escalation Threshold (%)</Label>
              <Input id="escalation_threshold" type="number" defaultValue="80" />
              <p className="text-xs text-muted-foreground mt-1">
                Escalate when SLA is X% complete
              </p>
            </div>
            <div>
              <Label htmlFor="escalation_to">Default Escalation Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANAGEMENT">Management</SelectItem>
                  <SelectItem value="HR_LEAD">HR Lead</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reminder_intervals">Reminder Intervals (hours)</Label>
              <Input id="reminder_intervals" defaultValue="12,24,48" />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated values
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ApprovalTemplatesTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Approval Templates</h3>
          <p className="text-sm text-muted-foreground">
            Pre-configured approval chains for quick application
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Standard Internal</CardTitle>
            <Badge variant="default">Default</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>1. HR Manager (24h)</div>
              <div>2. Management (48h)</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">High Value External</CardTitle>
            <Badge variant="outline">Custom</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>1. HR Manager (24h)</div>
              <div>2. Finance Manager (48h)</div>
              <div>3. Management (72h)</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Approval</CardTitle>
            <Badge variant="secondary">Fast Track</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>1. Staffing Manager (12h)</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ApprovalSettingsModule() {
  const [activeTab, setActiveTab] = useState('rules');

  return (
    <div className="space-y-6">
      <PageHeader
        title="JD Approval Settings"
        description="Configure approval workflows, rules, and SLA management"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="groups">Approver Groups</TabsTrigger>
          <TabsTrigger value="sla">SLAs</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <ApprovalRulesTab />
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <ApproverGroupsTab />
        </TabsContent>

        <TabsContent value="sla" className="space-y-4">
          <SLASettingsTab />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <ApprovalTemplatesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}