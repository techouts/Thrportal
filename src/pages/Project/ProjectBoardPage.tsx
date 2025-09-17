import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ProjectBoardPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Project Board</h1>
          <p className="text-muted-foreground">Execute and manage project operations</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.open('/CRM/ClientDesk', '_blank')}>
            <Settings className="h-4 w-4 mr-2" />
            Manage in Client Desk
          </Button>
        </div>
      </div>

      {projectId && (
        <div className="mb-6">
          <Badge variant="outline" className="mb-2">
            Project ID: {projectId}
          </Badge>
          <p className="text-sm text-muted-foreground">
            Displaying project-specific board for project {projectId}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Planning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Plan and organize project tasks, milestones, and deliverables.
            </p>
            <Button variant="outline" className="w-full">
              View Planning Board
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Task Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Track progress, assign tasks, and manage team workload.
            </p>
            <Button variant="outline" className="w-full">
              View Task Board
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Collaboration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Communicate with team members and stakeholders.
            </p>
            <Button variant="outline" className="w-full">
              View Collaboration Hub
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resource Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Manage team assignments and resource utilization.
            </p>
            <Button variant="outline" className="w-full">
              View Resource Board
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progress Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Monitor project progress and milestone completion.
            </p>
            <Button variant="outline" className="w-full">
              View Progress Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deliverables</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Track and manage project deliverables and outcomes.
            </p>
            <Button variant="outline" className="w-full">
              View Deliverables
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Execution Note</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is the execution view for project operations. For creating, editing, or managing 
              master data (clients, accounts, projects, SPOCs), please use the{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto text-primary"
                onClick={() => window.open('/CRM/ClientDesk', '_blank')}
              >
                Client Desk
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}