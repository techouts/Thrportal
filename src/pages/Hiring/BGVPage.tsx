import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChecksTab } from '@/components/hiring/bgv/ChecksTab'
import { OutcomesTab } from '@/components/hiring/bgv/OutcomesTab'
import { ExceptionsTab } from '@/components/hiring/bgv/ExceptionsTab'
import { SettingsTab } from '@/components/hiring/bgv/SettingsTab'
import { PageHeader } from '@/components/shared/PageHeader'

export default function BGVPage() {
  const [activeTab, setActiveTab] = useState('checks')

  const pageDescription = "Manage background verification cases with digital consent, vendor coordination, and automated workflows. Auto-purge: 90 days • SLA tracking • Exception handling"

  return (
    <div className="space-y-6">
      <PageHeader
        title="Background Verification (BGV)"
        description={pageDescription}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checks">Checks</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="checks" className="space-y-6">
          <ChecksTab />
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-6">
          <OutcomesTab />
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-6">
          <ExceptionsTab />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}