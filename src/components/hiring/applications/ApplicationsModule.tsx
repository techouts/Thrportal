import { useState } from 'react'
import { FileText } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { ApplicationListTab } from './ApplicationListTab'
import { ApplicationProfileTab } from './ApplicationProfileTab'
import { InterviewsTab } from './InterviewsTab'
import { OffersTab } from './OffersTab'
import { ApplicationReportsTab } from './ApplicationReportsTab'
import { moduleRegistry } from '@/lib/moduleRegistry'

export function ApplicationsModule() {
  const [activeTab, setActiveTab] = useState('list')
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)

  const handleViewApplication = (applicationId: string) => {
    setSelectedApplicationId(applicationId)
    setActiveTab('profile')
  }

  const moduleSpec = moduleRegistry.getModuleSpec('/Hiring/Applications') || 
    moduleRegistry.registerModuleSpec('/Hiring/Applications', {
      brdStatus: 'draft',
      promptStatus: 'pending',
      description: 'Manage candidate applications, interviews, offers, and pipeline tracking'
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="list">Application List</TabsTrigger>
          <TabsTrigger value="profile">Application Profile</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <ApplicationListTab onViewApplication={handleViewApplication} />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <ApplicationProfileTab 
            applicationId={selectedApplicationId}
            onBack={() => setActiveTab('list')}
          />
        </TabsContent>

        <TabsContent value="interviews" className="space-y-6">
          <InterviewsTab />
        </TabsContent>

        <TabsContent value="offers" className="space-y-6">
          <OffersTab />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ApplicationReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}