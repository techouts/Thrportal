import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Clock, TrendingUp, Users } from 'lucide-react'
import type { SchedulingDashboardStats, SchedulingFilters } from '@/types/scheduling'

interface SchedulingDashboardProps {
  stats: SchedulingDashboardStats
  filters: SchedulingFilters
  onSlotClick: (slotId: string) => void
}

export function SchedulingDashboard({ stats, filters, onSlotClick }: SchedulingDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Upcoming Slots Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tomorrow</CardTitle>
            <CardDescription>Slots available tomorrow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.upcoming_tomorrow}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Actionable slots
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Next 3 Days</CardTitle>
            <CardDescription>Upcoming slots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.upcoming_3days}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Including tomorrow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Next 7 Days</CardTitle>
            <CardDescription>This week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.upcoming_7days}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Including weekend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Next 10 Days</CardTitle>
            <CardDescription>Extended view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.upcoming_10days}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Planning horizon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Fill Rate Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Overall Fill Rate</span>
                <span className="font-bold">{stats.fill_rate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${Math.min(stats.fill_rate, 100)}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Used</div>
                <div className="font-medium">{stats.used_slots}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Total</div>
                <div className="font-medium">{stats.total_slots}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2" />
              No-Show Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Candidate No-Shows</span>
                <span className="font-bold">{stats.candidate_no_show_rate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(stats.candidate_no_show_rate, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Panel No-Shows</span>
                <span className="font-bold">{stats.panel_no_show_rate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(stats.panel_no_show_rate, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CalendarDays className="h-5 w-5 mr-2" />
              Slot Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Available</span>
              <Badge variant="default">{stats.available_slots}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Booked</span>
              <Badge variant="secondary">{stats.booked_slots}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Used</span>
              <Badge variant="outline">{stats.used_slots}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Expired</span>
              <Badge variant="outline">{stats.expired_slots}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for interview scheduling management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" size="sm">
              View Available Slots
            </Button>
            <Button variant="outline" size="sm">
              Upcoming This Week
            </Button>
            <Button variant="outline" size="sm">
              Aging Slots Report
            </Button>
            <Button variant="outline" size="sm">
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}