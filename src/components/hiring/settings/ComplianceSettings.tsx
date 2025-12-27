import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ComplianceVendorsTab } from './ComplianceVendorsTab'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, FileText } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'

interface ComplianceSettingsProps {
  activeSubTab?: string
}

export function ComplianceSettings({ activeSubTab }: ComplianceSettingsProps) {
  const navigate = useNavigate()
  const { user, can } = useAuth()
  const [activeTab, setActiveTab] = useState(activeSubTab || 'vendors')

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    navigate(`/Hiring/Settings/compliance/${value}`)
  }

  const subTabs = [
    { id: 'vendors', label: 'Vendors', icon: Shield },
    { id: 'data-audit', label: 'Data & Audit', icon: FileText, badge: 'Future' }
  ]

  // Check if user has write permissions
  const canEdit = can('hiring.settings.*') && (user?.role === 'STAFFING_MANAGER' || user?.role === 'HR_MANAGER' || user?.role === 'ADMIN' || user?.role === 'OPERATIONS_HR')
  const isReadOnly = !canEdit

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Compliance Configuration</h3>
        <p className="text-muted-foreground">
          Manage BGV vendors, compliance rules, data retention, and audit settings
        </p>
        {isReadOnly && (
          <div className="mt-2 p-3 bg-muted rounded-md text-sm text-muted-foreground">
            You have read-only access to compliance settings
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          {subTabs.map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.badge && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded">
                  {tab.badge}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="vendors" className="space-y-6">
          <ComplianceVendorsTab />
        </TabsContent>

        <TabsContent value="data-audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Data & Audit Configuration
              </CardTitle>
              <CardDescription>
                Configure DPDP/GDPR compliance, data retention policies, and audit access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium">Data & Audit Settings</div>
                <div className="text-sm">Coming soon - Advanced compliance and audit configuration</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}