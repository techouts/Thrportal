import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/shared/DataTable'
import { Search, Filter, Download, RefreshCw } from 'lucide-react'
import { Application } from '@/types/applications'
import { ApplicationsService } from '@/services/applicationsService'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface ApplicationListTabProps {
  onApplicationSelect: (applicationId: string) => void
}

interface ApplicationFilters {
  client?: string
  jd?: string
  stage?: string
  round?: string
  recruiter?: string
  sla?: string
  search?: string
  dateRange?: {
    start: string
    end: string
  }
}

export const ApplicationListTab: React.FC<ApplicationListTabProps> = ({ onApplicationSelect }) => {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<ApplicationFilters>({})

  const loadApplications = async () => {
    try {
      setLoading(true)
      const submissions = await ApplicationsService.getSubmissions()
      // Convert submissions to applications format
      const apps: Application[] = submissions.map(sub => ({
        id: sub.id,
        jdId: sub.jdId,
        candidateId: sub.candidateId,
        submittedBy: sub.submittedBy,
        primaryRecruiter: sub.primaryRecruiter,
        submittedAt: sub.submittedAt,
        stage: sub.stage,
        round: 'Round 1',
        slaStatus: sub.slaStatus,
        lastUpdatedAt: sub.lastUpdatedAt,
        createdViaMapping: sub.createdViaMapping
      }))
      setApplications(apps)
    } catch (error: any) {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [filters])

  const getSLABadgeColor = (status: string) => {
    switch (status) {
      case 'Green': return 'bg-green-100 text-green-800'
      case 'Amber': return 'bg-yellow-100 text-yellow-800'
      case 'Red': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'Submitted': return 'bg-blue-100 text-blue-800'
      case 'Shortlisted': return 'bg-purple-100 text-purple-800'
      case 'Interview': return 'bg-orange-100 text-orange-800'
      case 'Offer': return 'bg-green-100 text-green-800'
      case 'Joined': return 'bg-emerald-100 text-emerald-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const columns = [
    {
      id: 'appId',
      header: 'App ID',
      accessor: 'id' as const,
      cell: (value: string) => (
        <Button 
          variant="link" 
          size="sm"
          onClick={() => onApplicationSelect(value)}
          className="p-0 h-auto font-mono text-sm"
        >
          {value?.slice(-8) || 'N/A'}
        </Button>
      )
    },
    {
      id: 'candidate',
      header: 'Candidate',
      accessor: 'candidateId' as const,
      cell: (value: string) => (
        <div>
          <div className="font-medium">Candidate {value?.slice(-3) || 'N/A'}</div>
          <div className="text-sm text-muted-foreground">candidate@email.com</div>
        </div>
      )
    },
    {
      id: 'jd',
      header: 'JD',
      accessor: 'jdId' as const,
      cell: (value: string) => (
        <div>
          <div className="font-medium">JD {value?.slice(-3) || 'N/A'}</div>
          <div className="text-sm text-muted-foreground">TechCorp</div>
        </div>
      )
    },
    {
      id: 'client',
      header: 'Client',
      accessor: 'jdId' as const,
      cell: () => 'TechCorp'
    },
    {
      id: 'stage',
      header: 'Stage/Round',
      accessor: 'stage' as const,
      cell: (value: string, row: Application) => (
        <div className="space-y-1">
          <Badge className={getStageBadgeColor(value)}>
            {value}
          </Badge>
          <div className="text-xs text-muted-foreground">{row.round}</div>
        </div>
      )
    },
    {
      id: 'submitter',
      header: 'Submitter',
      accessor: 'submittedBy' as const,
      cell: (value: string) => (
        <div className="text-sm">{value}</div>
      )
    },
    {
      id: 'primary',
      header: 'Primary',
      accessor: 'primaryRecruiter' as const,
      cell: (value: string) => (
        <div className="text-sm">{value}</div>
      )
    },
    {
      id: 'sla',
      header: 'SLA',
      accessor: 'slaStatus' as const,
      cell: (value: string) => (
        <Badge className={getSLABadgeColor(value)}>
          {value}
        </Badge>
      )
    },
    {
      id: 'lastUpdated',
      header: 'Last Updated',
      accessor: 'lastUpdatedAt' as const,
      cell: (value: string) => (
        <div className="text-sm">
          {format(new Date(value), 'MMM dd, yyyy')}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Global Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by candidate name, email, phone, JD title, client..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Select value={filters.client} onValueChange={(value) => setFilters({ ...filters, client: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="techcorp">TechCorp</SelectItem>
                <SelectItem value="cloudsoft">CloudSoft</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.jd} onValueChange={(value) => setFilters({ ...filters, jd: value })}>
              <SelectTrigger>
                <SelectValue placeholder="JD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All JDs</SelectItem>
                <SelectItem value="jd-001">Senior React Developer</SelectItem>
                <SelectItem value="jd-002">DevOps Engineer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.stage} onValueChange={(value) => setFilters({ ...filters, stage: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="joined">Joined</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.round} onValueChange={(value) => setFilters({ ...filters, round: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Round" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rounds</SelectItem>
                <SelectItem value="round1">Round 1</SelectItem>
                <SelectItem value="round2">Round 2</SelectItem>
                <SelectItem value="round3">Round 3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.recruiter} onValueChange={(value) => setFilters({ ...filters, recruiter: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Recruiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recruiters</SelectItem>
                <SelectItem value="john">John Recruiter</SelectItem>
                <SelectItem value="sarah">Sarah Staffing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sla} onValueChange={(value) => setFilters({ ...filters, sla: value })}>
              <SelectTrigger>
                <SelectValue placeholder="SLA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All SLA</SelectItem>
                <SelectItem value="green">On-time</SelectItem>
                <SelectItem value="amber">Amber</SelectItem>
                <SelectItem value="red">Red</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadApplications}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={applications}
            columns={columns}
            loading={loading}
            emptyMessage="No applications found"
          />
        </CardContent>
      </Card>
    </div>
  )
}