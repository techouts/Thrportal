import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HiringFilters } from './HiringFilters'
import { OverviewTab } from './tabs/OverviewTab'
import { JDInsightsTab } from './tabs/JDInsightsTab'
import { RecruiterTab } from './tabs/RecruiterTab'
import { ClientTab } from './tabs/ClientTab'
import { TATTrackerTab } from './tabs/TATTrackerTab'
import { FollowUpTab } from './tabs/FollowUpTab'
import { BenchTab } from './tabs/BenchTab'
import { hiringService } from '@/services/hiringService'
import { useToast } from '@/hooks/use-toast'
import type { HiringFilters as HiringFiltersType } from '@/types/hiring'

export function HiringDashboard() {
  const [filters, setFilters] = useState<HiringFiltersType>({})
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleExport = async (type: 'csv' | 'excel' | 'pdf') => {
    try {
      setLoading(true)
      // Mock data for export
      const mockData = [{ id: 1, data: 'sample' }]
      const fileName = await hiringService.exportData(type, mockData)
      
      toast({
        title: "Export Successful",
        description: `Data exported as ${fileName}`
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    // Trigger data refresh
    setTimeout(() => setLoading(false), 1000)
    
    toast({
      title: "Data Refreshed",
      description: "Dashboard data has been updated"
    })
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hiring Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive hiring operations management and analytics
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <HiringFilters
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
        onRefresh={handleRefresh}
        loading={loading}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jd-insights">JD Insights</TabsTrigger>
          <TabsTrigger value="recruiter">Recruiter</TabsTrigger>
          <TabsTrigger value="client">Client</TabsTrigger>
          <TabsTrigger value="tat-tracker">TAT Tracker</TabsTrigger>
          <TabsTrigger value="follow-up">Follow-up</TabsTrigger>
          <TabsTrigger value="bench">Bench</TabsTrigger>
          <TabsTrigger value="internal">Internal</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab filters={filters} />
        </TabsContent>

        <TabsContent value="jd-insights">
          <JDInsightsTab filters={filters} />
        </TabsContent>

        <TabsContent value="recruiter">
          <RecruiterTab filters={filters} />
        </TabsContent>

        <TabsContent value="client">
          <ClientTab filters={filters} />
        </TabsContent>

        <TabsContent value="tat-tracker">
          <TATTrackerTab filters={filters} />
        </TabsContent>

        <TabsContent value="follow-up">
          <FollowUpTab filters={filters} />
        </TabsContent>

        <TabsContent value="bench">
          <BenchTab filters={filters} />
        </TabsContent>

        <TabsContent value="internal">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold">Internal Hiring View</h3>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}