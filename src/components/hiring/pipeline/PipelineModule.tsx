import { useState, useEffect } from 'react'
import { GitBranch } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { PipelineDashboardTab } from './PipelineDashboardTab'
import { PipelinesTab } from './PipelinesTab'
import { PipelineReportsTab } from './PipelineReportsTab'
import { moduleRegistry } from '@/lib/moduleRegistry'

export function PipelineModule() {
  const [activeTab, setActiveTab] = useState('dashboard')

  // Handle URL parameters for redirects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const view = params.get('view')
    const panel = params.get('panel')
    
    if (view === 'jd' || view === 'my' || view === 'team') {
      setActiveTab('pipelines')
    } else if (panel === 'leadership' || panel === 'recruiter') {
      setActiveTab('dashboard')
    }
  }, [])

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <PipelineDashboardTab />
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-6">
          <PipelinesTab />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <PipelineReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}