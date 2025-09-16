import { useState } from 'react'
import { GitBranch } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { PipelineDashboardTab } from './PipelineDashboardTab'
import { JDPipelinesTab } from './JDPipelinesTab'
import { MyPipelineTab } from './MyPipelineTab'
import { TeamPipelineTab } from './TeamPipelineTab'
import { LeadershipViewTab } from './LeadershipViewTab'
import { AlertsNudgesTab } from './AlertsNudgesTab'
import { PipelineReportsTab } from './PipelineReportsTab'
import { PipelineSettingsTab } from './PipelineSettingsTab'
import { moduleRegistry } from '@/lib/moduleRegistry'

export function PipelineModule() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const moduleSpec = moduleRegistry.getModuleSpec('/Hiring/Pipeline') || 
    moduleRegistry.registerModuleSpec('/Hiring/Pipeline', {
      brdStatus: 'implemented',
      promptStatus: 'completed',
      description: 'Comprehensive pipeline management with real-time tracking, SLA monitoring, and multi-role access'
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
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="jd-pipelines">JD Pipelines</TabsTrigger>
          <TabsTrigger value="my-pipeline">My Pipeline</TabsTrigger>
          <TabsTrigger value="team-pipeline">Team Pipeline</TabsTrigger>
          <TabsTrigger value="leadership">Leadership View</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Nudges</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <PipelineDashboardTab />
        </TabsContent>

        <TabsContent value="jd-pipelines" className="space-y-6">
          <JDPipelinesTab />
        </TabsContent>

        <TabsContent value="my-pipeline" className="space-y-6">
          <MyPipelineTab />
        </TabsContent>

        <TabsContent value="team-pipeline" className="space-y-6">
          <TeamPipelineTab />
        </TabsContent>

        <TabsContent value="leadership" className="space-y-6">
          <LeadershipViewTab />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <AlertsNudgesTab />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <PipelineReportsTab />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <PipelineSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}