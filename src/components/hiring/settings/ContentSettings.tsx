import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JDParserTab } from './JDParserTab'
import { RejectionReasonsTab } from './RejectionReasonsTab'
import { OfferMatrixTab } from './OfferMatrixTab'
import { FileText, XCircle, DollarSign } from 'lucide-react'

interface ContentSettingsProps {
  activeSubTab?: string
}

export function ContentSettings({ activeSubTab }: ContentSettingsProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(activeSubTab || 'parser')

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    navigate(`/Hiring/Settings/content/${value}`)
  }

  const subTabs = [
    { id: 'parser', label: 'Parser', icon: FileText },
    { id: 'reject-reasons', label: 'Reject Reasons', icon: XCircle },
    { id: 'offers', label: 'Offers', icon: DollarSign }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Content Management</h3>
        <p className="text-muted-foreground">
          Manage JD/CV parsers, rejection reasons, offer matrix, and content templates
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          {subTabs.map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="parser" className="space-y-6">
          <JDParserTab />
        </TabsContent>

        <TabsContent value="reject-reasons" className="space-y-6">
          <RejectionReasonsTab />
        </TabsContent>

        <TabsContent value="offers" className="space-y-6">
          <OfferMatrixTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}