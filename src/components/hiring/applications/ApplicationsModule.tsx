import { useState } from 'react'
import { FileText } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { ManageTab } from './ManageTab'
import { JDResumeMatchTab } from './JDResumeMatchTab'
import { DashboardTab } from './DashboardTab'
import { moduleRegistry } from '@/lib/moduleRegistry'

export function ApplicationsModule() {
  const [activeTab, setActiveTab] = useState('manage')

  const moduleSpec = moduleRegistry.getModuleSpec('/Hiring/Applications') || 
    moduleRegistry.registerModuleSpec('/Hiring/Applications', {
      brdStatus: 'draft',
      promptStatus: 'pending',
      description: 'Applications management with resume processing and JD matching'
    })

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Applications"
        icon={FileText}
        breadcrumbs={[
          { label: 'Hiring', href: '/Hiring/Dashboard' },
          { label: 'Applications', href: '/Hiring/Applications' }
        ]}
        moduleSpec={moduleSpec}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="jd-resume-match">JD-Resume Match</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          <ManageTab />
        </TabsContent>

        <TabsContent value="jd-resume-match" className="space-y-6">
          <JDResumeMatchTab />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <DashboardTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}