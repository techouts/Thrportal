import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, ClipboardList, Users, Bell, Shield } from 'lucide-react';

// Settings sub-components - using inline components for now

export const OnOffboardingSettingsTab: React.FC = () => {
  const [activeSettingsTab, setActiveSettingsTab] = useState('templates');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">OnOffboarding Settings</h3>
        <p className="text-muted-foreground">
          Configure templates, approvals, notifications, and compliance settings
        </p>
      </div>

      <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="approvers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Approvers
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <ChecklistTemplatesSettings />
        </TabsContent>

        <TabsContent value="approvers" className="space-y-6">
          <ApproverMatrixSettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationsSettings />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <ComplianceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Placeholder settings components
const ChecklistTemplatesSettings: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Checklist Templates</CardTitle>
      <CardDescription>
        Manage onboarding and offboarding checklist templates by role and location
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-12 text-muted-foreground">
        <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <div className="text-lg font-medium">Checklist Templates</div>
        <div className="text-sm">Configure role-based and location-based templates</div>
      </div>
    </CardContent>
  </Card>
);

const ApproverMatrixSettings: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Approver Matrix</CardTitle>
      <CardDescription>
        Define approval workflows and assign approvers by role
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-12 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <div className="text-lg font-medium">Approver Matrix</div>
        <div className="text-sm">Set up approval chains and responsible parties</div>
      </div>
    </CardContent>
  </Card>
);

const NotificationsSettings: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Notifications & Reminders</CardTitle>
      <CardDescription>
        Configure automated notifications and reminder settings
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-12 text-muted-foreground">
        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <div className="text-lg font-medium">Notifications</div>
        <div className="text-sm">Set up email, SMS, and in-app notifications</div>
      </div>
    </CardContent>
  </Card>
);

const ComplianceSettings: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Compliance Configuration</CardTitle>
      <CardDescription>
        Configure compliance rules, validation, and data retention policies
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-12 text-muted-foreground">
        <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <div className="text-lg font-medium">Compliance Config</div>
        <div className="text-sm">Manage PAN, Aadhaar validation and DPDP compliance</div>
      </div>
    </CardContent>
  </Card>
);