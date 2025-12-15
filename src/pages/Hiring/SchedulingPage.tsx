import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { CalendarDays, Clock, Users, TrendingUp, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { schedulingService } from '@/services/schedulingService'
import { SlotsList } from '@/components/scheduling/SlotsList'
import { SchedulingDashboard } from '@/components/scheduling/SchedulingDashboard'
import { CreateSlotDialog } from '@/components/scheduling/CreateSlotDialog'
import type { SchedulingFilters as FiltersType, SchedulingDashboardStats, InterviewSlot } from '@/types/scheduling'

export default function SchedulingPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [filters, setFilters] = useState<FiltersType>({})
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [stats, setStats] = useState<SchedulingDashboardStats>({
    total_slots: 0,
    available_slots: 0,
    booked_slots: 0,
    used_slots: 0,
    expired_slots: 0,
    fill_rate: 0,
    candidate_no_show_rate: 0,
    panel_no_show_rate: 0,
    upcoming_tomorrow: 0,
    upcoming_3days: 0,
    upcoming_7days: 0,
    upcoming_10days: 0
  })
  const [slots, setSlots] = useState<InterviewSlot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsData, slotsData] = await Promise.all([
        schedulingService.getDashboardStats(),
        schedulingService.getInterviewSlots(filters)
      ])
      setStats(statsData)
      setSlots(slotsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load scheduling data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSlotCreated = () => {
    setShowCreateDialog(false)
    loadData()
    toast({
      title: 'Success',
      description: 'Interview slot(s) created successfully'
    })
  }

  const handleSlotUpdated = () => {
    loadData()
    toast({
      title: 'Success',
      description: 'Slot updated successfully'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Scheduling</h1>
          <p className="text-muted-foreground">
            Manage client-provided interview slots and track candidate assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Slot
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_slots}</div>
            <p className="text-xs text-muted-foreground">
              {stats.available_slots} available, {stats.booked_slots} booked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fill Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fill_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.used_slots} of {stats.total_slots} slots used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming_tomorrow}</div>
            <p className="text-xs text-muted-foreground">
              Tomorrow | {stats.upcoming_7days} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-Show Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.candidate_no_show_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Candidate | {stats.panel_no_show_rate.toFixed(1)}% panel
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="slots">Slots List</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <SchedulingDashboard 
            stats={stats}
            filters={filters}
            onSlotClick={(slotId) => {
              setActiveTab('slots')
              // TODO: Navigate to specific slot
            }}
          />
        </TabsContent>

        <TabsContent value="slots" className="space-y-4">
          <SlotsList
            slots={slots}
            loading={loading}
            onSlotUpdated={handleSlotUpdated}
          />
        </TabsContent>
      </Tabs>

      {/* Create Slot Dialog */}
      <CreateSlotDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSlotCreated={handleSlotCreated}
      />
    </div>
  )
}