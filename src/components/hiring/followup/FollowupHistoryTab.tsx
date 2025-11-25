import { useState, useEffect } from 'react'
import { Filter, MessageSquare, Phone, Mail, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/shared/DataTable'
import { Input } from '@/components/ui/input'
import { FollowupService } from '@/services/followupService'
import { FollowupActionDTO, FollowupFilters, Channel } from '@/types/followup'
import { useToast } from '@/hooks/use-toast'

export function FollowupHistoryTab() {
  const [actions, setActions] = useState<FollowupActionDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FollowupFilters>({})
  const { toast } = useToast()

  useEffect(() => {
    loadFollowupHistory()
  }, [filters])

  const loadFollowupHistory = async () => {
    try {
      setLoading(true)
      const data = await FollowupService.getActions()
      setActions(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load follow-up history",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getChannelIcon = (channel: Channel) => {
    switch (channel) {
      case 'EMAIL':
        return <Mail className="h-4 w-4" />
      case 'WHATSAPP':
        return <Phone className="h-4 w-4" />
      case 'CALL':
        return <Phone className="h-4 w-4" />
      case 'IN_APP':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getChannelBadge = (channel: Channel) => {
    const variants = {
      'EMAIL': { variant: 'default' as const, color: 'bg-blue-100 text-blue-700' },
      'WHATSAPP': { variant: 'default' as const, color: 'bg-green-100 text-green-700' },
      'CALL': { variant: 'default' as const, color: 'bg-purple-100 text-purple-700' },
      'IN_APP': { variant: 'default' as const, color: 'bg-gray-100 text-gray-700' }
    }
    return variants[channel] || { variant: 'default' as const, color: '' }
  }

  const getResultBadge = (result?: string) => {
    if (!result) return null
    
    const variants = {
      'SENT': { variant: 'outline' as const, color: 'bg-blue-100 text-blue-700' },
      'DELIVERED': { variant: 'default' as const, color: 'bg-green-100 text-green-700' },
      'READ': { variant: 'default' as const, color: 'bg-green-200 text-green-800' },
      'FAILED': { variant: 'destructive' as const, color: 'bg-red-100 text-red-700' }
    }
    
    const variant = variants[result as keyof typeof variants] || { variant: 'outline' as const, color: '' }
    return (
      <Badge className={`text-xs ${variant.color}`}>
        {result}
      </Badge>
    )
  }

  const columns = [
    {
      id: 'actionAt',
      header: 'Date & Time',
      accessor: 'actionAt' as keyof FollowupActionDTO,
      cell: (item: FollowupActionDTO) => {
        if (!item || !item.actionAt) return <div>-</div>
        const date = new Date(item.actionAt)
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-muted-foreground">{date.toLocaleTimeString()}</div>
          </div>
        )
      }
    },
    {
      id: 'submission',
      header: 'Submission',
      accessor: 'submissionId' as keyof FollowupActionDTO,
      cell: (item: FollowupActionDTO) => {
        if (!item) return <div>-</div>
        // In real app, would lookup submission details by ID
        return (
          <div className="text-sm">
            <div className="font-medium">Alice Johnson</div>
            <div className="text-muted-foreground">JD-2024-001 • TechCorp</div>
          </div>
        )
      }
    },
    {
      id: 'channel',
      header: 'Channel',
      accessor: 'channel' as keyof FollowupActionDTO,
      cell: (item: FollowupActionDTO) => {
        if (!item) return <div>-</div>
        const badge = getChannelBadge(item.channel)
        return (
          <div className="flex items-center gap-2">
            {getChannelIcon(item.channel)}
            <Badge className={`text-xs ${badge.color}`}>
              {item.channel}
            </Badge>
          </div>
        )
      }
    },
    {
      id: 'actor',
      header: 'Performed By',
      accessor: 'actorId' as keyof FollowupActionDTO,
      cell: (item: FollowupActionDTO) => {
        if (!item) return <div>-</div>
        // In real app, would lookup user details by ID
        const actorNames: Record<string, string> = {
          'rec-001': 'John Recruiter',
          'rec-002': 'Sarah Staffing',
          'rec-003': 'Mike Talent'
        }
        return actorNames[item.actorId] || item.actorId
      }
    },
    {
      id: 'result',
      header: 'Result',
      accessor: 'result' as keyof FollowupActionDTO,
      cell: (item: FollowupActionDTO) => {
        if (!item) return <div>-</div>
        return getResultBadge(item.result) || <span className="text-sm text-muted-foreground">Pending</span>
      }
    },
    {
      id: 'note',
      header: 'Note',
      accessor: 'note' as keyof FollowupActionDTO,
      cell: (item: FollowupActionDTO) => {
        if (!item || !item.note) return <div>-</div>
        return (
          <div className="max-w-xs text-sm">
            <span className="line-clamp-2">{item.note}</span>
          </div>
        )
      }
    }
  ]

  // Calculate stats
  const totalActions = actions.length
  const emailActions = actions.filter(a => a.channel === 'EMAIL').length
  const whatsappActions = actions.filter(a => a.channel === 'WHATSAPP').length
  const callActions = actions.filter(a => a.channel === 'CALL').length
  const successfulActions = actions.filter(a => a.result === 'DELIVERED' || a.result === 'READ').length
  const successRate = totalActions > 0 ? (successfulActions / totalActions) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Follow-up History</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalActions}</div>
            <p className="text-sm text-muted-foreground">Total Actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{emailActions}</div>
            <p className="text-sm text-muted-foreground">Email Actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{whatsappActions}</div>
            <p className="text-sm text-muted-foreground">WhatsApp Actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{callActions}</div>
            <p className="text-sm text-muted-foreground">Call Actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{successfulActions}</div>
            <p className="text-sm text-muted-foreground">Successful</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Channel</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="CALL">Call</SelectItem>
                  <SelectItem value="IN_APP">In-App</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Recruiter</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, recruiterId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All recruiters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rec-001">John Recruiter</SelectItem>
                  <SelectItem value="rec-002">Sarah Staffing</SelectItem>
                  <SelectItem value="rec-003">Mike Talent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Result</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All results" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="READ">Read</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input placeholder="Search notes..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        data={actions}
        columns={columns}
        loading={loading}
      />
    </div>
  )
}