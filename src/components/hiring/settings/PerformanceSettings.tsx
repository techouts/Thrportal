import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TargetsTab } from './TargetsTab'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Award } from 'lucide-react'

interface PerformanceSettingsProps {
  activeSubTab?: string
}

export function PerformanceSettings({ activeSubTab }: PerformanceSettingsProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(activeSubTab || 'targets')

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    navigate(`/Hiring/Settings/performance/${value}`)
  }

  const subTabs = [
    { id: 'targets', label: 'Targets', icon: TrendingUp },
    { id: 'metrics', label: 'Metrics', icon: Award, disabled: true, badge: 'Future' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Performance Configuration</h3>
        <p className="text-muted-foreground">
          Manage recruiter targets, team goals, and performance tracking metrics
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          {subTabs.map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id} 
              disabled={tab.disabled}
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

        <TabsContent value="targets" className="space-y-6">
          <TargetsTab />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Configure KPI weights and performance scoring algorithms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium">Performance Metrics</div>
                <div className="text-sm">Coming soon - Advanced performance tracking and scoring</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}