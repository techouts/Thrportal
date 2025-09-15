import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';

export default function CRMProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage strategic recruitment projects"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Projects Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Project management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}