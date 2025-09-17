import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssignmentProjectSection } from '@/components/assignments/AssignmentProjectSection';
import { AssignmentEmployeeSection } from '@/components/assignments/AssignmentEmployeeSection';

export function ProjectAssignmentsPage() {
  const [activeTab, setActiveTab] = useState('project');

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Project Assignments</h1>
          <p className="text-muted-foreground">Manage resource allocations and track utilization</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="project" className="flex items-center gap-2">
              Project View
            </TabsTrigger>
            <TabsTrigger value="employee" className="flex items-center gap-2">
              Employee View
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-6">
            <TabsContent value="project" className="h-full">
              <AssignmentProjectSection />
            </TabsContent>
            
            <TabsContent value="employee" className="h-full">
              <AssignmentEmployeeSection />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}