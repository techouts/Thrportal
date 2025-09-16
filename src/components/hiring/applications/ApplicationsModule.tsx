import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { ApplicationListTab } from './ApplicationListTab'
import { ApplicationProfileTab } from './ApplicationProfileTab'
import { JDResumeMatchTab } from './JDResumeMatchTab'

export const ApplicationsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list')
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>('app-001') // Default to first application for demo

  const handleApplicationSelect = (applicationId: string) => {
    setSelectedApplicationId(applicationId)
    setActiveTab('profile')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Manage candidate applications, submissions, and matching"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">All Applications</TabsTrigger>
          <TabsTrigger value="profile">
            Application Profile
          </TabsTrigger>
          <TabsTrigger value="matching">JD-Resume Matching</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <ApplicationListTab onApplicationSelect={handleApplicationSelect} />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          {selectedApplicationId ? (
            <ApplicationProfileTab 
              applicationId={selectedApplicationId}
              onApplicationChange={setSelectedApplicationId}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Select an application from the list to view its profile</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="matching" className="space-y-6">
          <JDResumeMatchTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}