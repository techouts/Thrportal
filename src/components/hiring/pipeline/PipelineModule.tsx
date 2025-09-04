import { useState } from 'react'
import { GitBranch } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { ManageTab } from './ManageTab'
import { ActiveJDsTab } from './ActiveJDsTab'
import { DashboardTab } from './DashboardTab'
import { moduleRegistry } from '@/lib/moduleRegistry'

export function PipelineModule() {
  const [activeTab, setActiveTab] = useState('manage')

  const moduleSpec = moduleRegistry.getModuleSpec('/Hiring/Pipeline') || 
    moduleRegistry.registerModuleSpec('/Hiring/Pipeline', {
      brdStatus: 'draft',
      promptStatus: 'pending',
      description: 'Application pipeline management with status tracking and workflow automation'
    })

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Pipeline"
        icon={GitBranch}
        breadcrumbs={[
          { label: 'Hiring', href: '/Hiring/Dashboard' },
          { label: 'Pipeline', href: '/Hiring/Pipeline' }
        ]}
        moduleSpec={moduleSpec}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="active-jds">Active JDs - No Submissions</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          <ManageTab />
        </TabsContent>

        <TabsContent value="active-jds" className="space-y-6">
          <ActiveJDsTab />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <DashboardTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}