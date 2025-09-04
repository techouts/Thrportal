import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ManageTab } from './ManageTab'
import { UnassignedTab } from './UnassignedTab'
import { UnattendedTab } from './UnattendedTab'
import { ReportsTab } from './ReportsTab'
import type { AssignmentFilters } from '@/types/assignment'

export function AssignmentModule() {
  const [activeTab, setActiveTab] = useState('manage')
  const [filters, setFilters] = useState<AssignmentFilters>({})

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assignment Management</h1>
          <p className="text-muted-foreground">
            Assign recruiters, manage JDs, and track progress
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
          <TabsTrigger value="unattended">Unattended</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <ManageTab filters={filters} onFiltersChange={setFilters} />
        </TabsContent>

        <TabsContent value="unassigned">
          <UnassignedTab filters={filters} />
        </TabsContent>

        <TabsContent value="unattended">
          <UnattendedTab />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}