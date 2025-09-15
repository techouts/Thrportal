import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';

export default function CRMClientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage client organizations and their details"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Clients Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Client management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}