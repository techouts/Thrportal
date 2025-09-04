import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ManageTab } from './ManageTab'
import { ApprovalsTab } from './ApprovalsTab'
import { ReportsTab } from './ReportsTab'
import type { JobRequisitionFilters } from '@/types/jobRequisitions'

export function JobRequisitionsModule() {
  const [activeTab, setActiveTab] = useState('manage')
  const [filters, setFilters] = useState<JobRequisitionFilters>({})

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Requisitions</h1>
          <p className="text-muted-foreground">
            Manage job requisitions, approvals, and analytics
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <ManageTab filters={filters} onFiltersChange={setFilters} />
        </TabsContent>

        <TabsContent value="approvals">
          <ApprovalsTab filters={filters} />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab filters={filters} />
        </TabsContent>
      </Tabs>
    </div>
  )
}