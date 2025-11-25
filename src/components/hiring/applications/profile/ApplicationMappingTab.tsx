import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MappingJDTab } from './mapping/MappingJDTab'
import { MappingCandidateTab } from './mapping/MappingCandidateTab'
import { MappingSmartMapperTab } from './mapping/MappingSmartMapperTab'

interface ApplicationMappingTabProps {
  applicationId: string
  candidateId: string
  jdId: string
}

export const ApplicationMappingTab: React.FC<ApplicationMappingTabProps> = ({ 
  applicationId, 
  candidateId, 
  jdId 
}) => {
  const [activeTab, setActiveTab] = useState('jd')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="jd">JD Matching</TabsTrigger>
        <TabsTrigger value="candidate">Candidate Matching</TabsTrigger>
        <TabsTrigger value="smart-mapper">Smart Mapper</TabsTrigger>
      </TabsList>

      <TabsContent value="jd" className="space-y-6">
        <MappingJDTab candidateId={candidateId} />
      </TabsContent>

      <TabsContent value="candidate" className="space-y-6">
        <MappingCandidateTab jdId={jdId} />
      </TabsContent>

      <TabsContent value="smart-mapper" className="space-y-6">
        <MappingSmartMapperTab />
      </TabsContent>
    </Tabs>
  )
}