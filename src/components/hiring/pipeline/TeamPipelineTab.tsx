import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/DataTable'
import { ChartKit } from '@/components/shared/ChartKit'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Users, AlertTriangle, TrendingDown, MoreHorizontal, UserPlus, Send } from 'lucide-react'
import { pipelineService } from '@/services/pipelineService'
import { TeamPipelineStats } from '@/types/pipeline'

export function TeamPipelineTab() {
  const [teamStats, setTeamStats] = useState<TeamPipelineStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTeamStats()
  }, [])

  const loadTeamStats = async () => {
    try {
      setLoading(true)
      const data = await pipelineService.getTeamStats()
      setTeamStats(data)
    } catch (error) {
      console.error('Failed to load team stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReassignApplication = async (applicationId: string) => {
    // TODO: Implement application reassignment
    console.log('Reassign application:', applicationId)
  }

  const handleBulkReminder = async (type: 'recruiters' | 'clients') => {
    // TODO: Implement bulk reminder
    console.log('Send bulk reminder to:', type)
  }

  const handleStatusOverride = async (applicationId: string, newStatus: string) => {
    // TODO: Implement status override
    console.log('Status override:', applicationId, newStatus)
  }

  if (loading || !teamStats) {
    return <div className="flex items-center justify-center h-96">Loading team pipeline...</div>
  }

  const teamFunnelData = teamStats.teamFunnel.flatMap(recruiter =>
    recruiter.funnel.map(stage => ({
      recruiter: recruiter.recruiter,
      stage: stage.stage.replace('-', ' '),
      count: stage.count,
      conversion: stage.conversionRate
    }))
  )

  const teamColumns = [
    {
      accessorKey: 'recruiter',
      header: 'Recruiter',
    },
    {
      accessorKey: 'activeJDs',
      header: 'Active JDs',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.activeJDs || 0}</div>
      )
    },
    {
      accessorKey: 'activeCandidates',
      header: 'Active Candidates',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.activeCandidates || 0}</div>
      )
    },
    {
      accessorKey: 'submissions',
      header: 'Submissions',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.submissions || 0}</div>
      )
    },
    {
      accessorKey: 'shortlistPercent',
      header: 'Shortlist %',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.shortlistPercent || 0}%</div>
      )
    },
    {
      accessorKey: 'offerPercent',
      header: 'Offer %',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.offerPercent || 0}%</div>
      )
    },
    {
      accessorKey: 'joinPercent',
      header: 'Join %',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.joinPercent || 0}%</div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleReassignApplication(row.original.id)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Reassign Applications
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkReminder('recruiters')}>
              <Send className="h-4 w-4 mr-2" />
              Send Reminder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  const atRiskColumns = [
    {
      accessorKey: 'jdTitle',
      header: 'JD Title',
    },
    {
      accessorKey: 'client',
      header: 'Client',
    },
    {
      accessorKey: 'issue',
      header: 'Issue',
      cell: ({ row }: any) => (
        <div className="text-sm text-red-600">{row.original.issue}</div>
      )
    },
    {
      accessorKey: 'daysSinceLastSubmission',
      header: 'Days Since Last Submission',
      cell: ({ row }: any) => (
        <Badge variant="destructive">{row.original.daysSinceLastSubmission} days</Badge>
      )
    }
  ]

  // Mock team data for demonstration
  const mockTeamData = [
    {
      recruiter: 'Alice Smith',
      activeJDs: 8,
      activeCandidates: 24,
      submissions: 45,
      shortlistPercent: 68,
      offerPercent: 32,
      joinPercent: 22
    },
    {
      recruiter: 'Bob Johnson',
      activeJDs: 6,
      activeCandidates: 18,
      submissions: 32,
      shortlistPercent: 56,
      offerPercent: 28,
      joinPercent: 19
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Pipeline Management</h2>
        <div className="flex gap-2">
          <Button onClick={() => handleBulkReminder('recruiters')}>
            <Send className="h-4 w-4 mr-2" />
            Remind Recruiters
          </Button>
          <Button onClick={() => handleBulkReminder('clients')}>
            <Send className="h-4 w-4 mr-2" />
            Remind Clients
          </Button>
        </div>
      </div>

      {/* Team Funnel Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Team Funnel by Recruiter</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartKit
            type="bar"
            data={teamFunnelData}
            config={{
              xField: 'stage',
              yField: 'count',
              colorField: 'recruiter',
              stackField: 'recruiter'
            }}
          />
        </CardContent>
      </Card>

      {/* At-Risk JDs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            At-Risk JDs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={atRiskColumns}
            data={teamStats.atRiskJDs}
          />
        </CardContent>
      </Card>

      {/* Round-wise Stalls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-amber-500" />
            Round-wise Stalls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamStats.roundStalls.map((stall, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{stall.round}</h4>
                  <p className="text-sm text-muted-foreground">Interviews/feedback stuck</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{stall.count} items</p>
                  <p className="text-sm text-muted-foreground">{stall.avgAgeing} days avg</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={teamColumns}
            data={mockTeamData}
          />
        </CardContent>
      </Card>
    </div>
  )
}