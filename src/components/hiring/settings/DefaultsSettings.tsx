import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GlobalDefaultsTab } from './GlobalDefaultsTab'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Bell } from 'lucide-react'

interface DefaultsSettingsProps {
  activeSubTab?: string
}

export function DefaultsSettings({ activeSubTab }: DefaultsSettingsProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(activeSubTab || 'global')

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    navigate(`/Hiring/Settings/defaults/${value}`)
  }

  const subTabs = [
    { id: 'global', label: 'Global', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: 'Future' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Default Settings</h3>
        <p className="text-muted-foreground">
          Configure global defaults, templates, and notification preferences
        </p>
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

        <TabsContent value="global" className="space-y-6">
          <GlobalDefaultsTab />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure notification channels, cadence, and escalation flows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium">Notification Configuration</div>
                <div className="text-sm">Coming soon - Advanced notification management</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}