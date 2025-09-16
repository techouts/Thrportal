import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { MappingJDTab } from './profile/mapping/MappingJDTab'
import { MappingCandidateTab } from './profile/mapping/MappingCandidateTab'
import { MappingSmartMapperTab } from './profile/mapping/MappingSmartMapperTab'

export const MappingModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('smart-mapper')

  // Handle URL parameters for context prefill
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const appId = urlParams.get('app_id')
    const candidateId = urlParams.get('candidate_id')
    const jdId = urlParams.get('jd_id')

    // Context prefill logic
    if (appId) {
      // If app_id present: preselect Candidate and JD; land on JD tab
      setActiveTab('jd')
    } else if (candidateId && !jdId) {
      // If candidate_id only: land on JD tab with candidate preselected
      setActiveTab('jd')
    } else if (jdId && !candidateId) {
      // If jd_id only: land on Candidate tab with JD preselected
      setActiveTab('candidate')
    } else {
      // If no context: land on Smart Mapper
      setActiveTab('smart-mapper')
    }
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mapping"
        description="Proactive JD↔Candidate matching with approvals, SLAs, outreach, and full audit"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jd">JD</TabsTrigger>
          <TabsTrigger value="candidate">Candidate</TabsTrigger>
          <TabsTrigger value="smart-mapper">Smart Mapper</TabsTrigger>
        </TabsList>

        <TabsContent value="jd" className="space-y-6">
          <MappingJDTab candidateId={new URLSearchParams(window.location.search).get('candidate_id') || undefined} />
        </TabsContent>

        <TabsContent value="candidate" className="space-y-6">
          <MappingCandidateTab jdId={new URLSearchParams(window.location.search).get('jd_id') || undefined} />
        </TabsContent>

        <TabsContent value="smart-mapper" className="space-y-6">
          <MappingSmartMapperTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}