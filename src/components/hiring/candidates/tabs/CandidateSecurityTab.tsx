import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { RolePermissionsTab } from './security/RolePermissionsTab';
import { AuditLogsTab } from './security/AuditLogsTab';
import { ComplianceTab } from './security/ComplianceTab';

export function CandidateSecurityTab() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & Permissions"
        description="Manage role-based access controls, audit logs, and compliance settings for the Candidates module"
      />
      
      <Tabs defaultValue="permissions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="permissions">Role Permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="permissions" className="space-y-6">
          <RolePermissionsTab />
        </TabsContent>
        
        <TabsContent value="audit" className="space-y-6">
          <AuditLogsTab />
        </TabsContent>
        
        <TabsContent value="compliance" className="space-y-6">
          <ComplianceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}