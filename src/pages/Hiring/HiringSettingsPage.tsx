import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JDParserTab } from '@/components/hiring/settings/JDParserTab'
import { OfferMatrixTab } from '@/components/hiring/settings/OfferMatrixTab'
import { SLATab } from '@/components/hiring/settings/SLATab'
import { RejectionReasonsTab } from '@/components/hiring/settings/RejectionReasonsTab'
import { FeedbackFollowupsTab } from '@/components/hiring/settings/FeedbackFollowupsTab'
import { ComplianceVendorsTab } from '@/components/hiring/settings/ComplianceVendorsTab'
import { GlobalDefaultsTab } from '@/components/hiring/settings/GlobalDefaultsTab'
import { TargetsTab } from '@/components/hiring/settings/TargetsTab'
import { ApprovalRulesTab } from '@/components/hiring/settings/ApprovalRulesTab'
import { PageHeader } from '@/components/shared/PageHeader'

export default function HiringSettingsPage() {
  const [activeTab, setActiveTab] = useState('jd-parser')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hiring Settings"
        description="Configure hiring workflows, SLAs, templates, and system defaults"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="targets">Targets</TabsTrigger>
          <TabsTrigger value="approval-rules">Approval Rules</TabsTrigger>
          <TabsTrigger value="jd-parser">JD Parser</TabsTrigger>
          <TabsTrigger value="offer-matrix">Offer Matrix</TabsTrigger>
          <TabsTrigger value="sla">SLA</TabsTrigger>
          <TabsTrigger value="rejection-reasons">Rejection Reasons</TabsTrigger>
          <TabsTrigger value="feedback-followups">Feedback & Follow-ups</TabsTrigger>
          <TabsTrigger value="compliance-vendors">Compliance & Vendors</TabsTrigger>
          <TabsTrigger value="global-defaults">Global Defaults</TabsTrigger>
        </TabsList>

        <TabsContent value="targets" className="space-y-6">
          <TargetsTab />
        </TabsContent>

        <TabsContent value="approval-rules" className="space-y-6">
          <ApprovalRulesTab />
        </TabsContent>

        <TabsContent value="jd-parser" className="space-y-6">
          <JDParserTab />
        </TabsContent>

        <TabsContent value="offer-matrix" className="space-y-6">
          <OfferMatrixTab />
        </TabsContent>

        <TabsContent value="sla" className="space-y-6">
          <SLATab />
        </TabsContent>

        <TabsContent value="rejection-reasons" className="space-y-6">
          <RejectionReasonsTab />
        </TabsContent>

        <TabsContent value="feedback-followups" className="space-y-6">
          <FeedbackFollowupsTab />
        </TabsContent>

        <TabsContent value="compliance-vendors" className="space-y-6">
          <ComplianceVendorsTab />
        </TabsContent>

        <TabsContent value="global-defaults" className="space-y-6">
          <GlobalDefaultsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}