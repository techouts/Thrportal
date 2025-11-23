import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/shared/DataTable'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Filter, Download, RefreshCw, Plus } from 'lucide-react'
import { Application, Submission } from '@/types/applications'
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
  const [applications, setApplications] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<ApplicationFilters>({})
  
  // Create Application Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [candidates, setCandidates] = useState<Array<{ id: string; name: string; email: string; status: string }>>([])
  const [activeJDs, setActiveJDs] = useState<Array<{ id: string; title: string; client: string }>>([])
  const [selectedCandidate, setSelectedCandidate] = useState('')
  const [selectedJD, setSelectedJD] = useState('')
  const [creating, setCreating] = useState(false)

  const loadApplications = async () => {
    try {
      setLoading(true)
      const submissions = await ApplicationsService.getSubmissions()
      
      let apps: Submission[] = submissions.map(sub => ({
        ...sub,
        round: sub.round || 'Round 1'
      }))

      // Apply filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        apps = apps.filter(app =>
          app.candidateName?.toLowerCase().includes(searchLower) ||
          app.candidateEmail?.toLowerCase().includes(searchLower) ||
          app.jdTitle?.toLowerCase().includes(searchLower) ||
          app.jdClient?.toLowerCase().includes(searchLower)
        )
      }

      if (filters.client && filters.client !== 'all') {
        apps = apps.filter(app => app.jdClient === filters.client)
      }

      if (filters.stage && filters.stage !== 'all') {
        apps = apps.filter(app => app.stage.toLowerCase() === filters.stage?.toLowerCase())
      }

      if (filters.round && filters.round !== 'all') {
        apps = apps.filter(app => app.round?.toLowerCase() === filters.round?.toLowerCase())
      }

      if (filters.recruiter && filters.recruiter !== 'all') {
        apps = apps.filter(app => app.primaryRecruiter === filters.recruiter)
      }

      if (filters.sla && filters.sla !== 'all') {
        const slaMap: Record<string, string> = {
          'green': 'Green',
          'amber': 'Amber',
          'red': 'Red'
        }
        apps = apps.filter(app => app.slaStatus === slaMap[filters.sla || ''])
      }

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

  const handleOpenCreateDialog = async () => {
    try {
      const [candidatesData, jdsData] = await Promise.all([
        ApplicationsService.getAllCandidates(),
        ApplicationsService.getActiveJDs()
      ])
      setCandidates(candidatesData)
      setActiveJDs(jdsData)
      setCreateDialogOpen(true)
    } catch (error) {
      console.error('Error loading create dialog data:', error)
      toast.error('Failed to load candidates and JDs')
    }
  }

  const handleCreateApplication = async () => {
    if (!selectedCandidate || !selectedJD) {
      toast.error('Please select both candidate and JD')
      return
    }

    try {
      setCreating(true)
      
      // Check for duplicates
      const isDuplicate = await ApplicationsService.checkDuplicateApplication(selectedCandidate, selectedJD)
      if (isDuplicate) {
        toast.error('Application already exists for this candidate and JD')
        return
      }

      // Create application
      await ApplicationsService.createApplication(selectedCandidate, selectedJD)
      
      toast.success('Application created successfully')
      setCreateDialogOpen(false)
      setSelectedCandidate('')
      setSelectedJD('')
      loadApplications()
    } catch (error: any) {
      console.error('Error creating application:', error)
      const message = error?.message || error?.details || 'Failed to create application'
      toast.error(message)
    } finally {
      setCreating(false)
    }
  }

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
        <span className="font-mono text-sm">
          ...{value?.slice(-8) || 'N/A'}
        </span>
      )
    },
    {
      id: 'candidate',
      header: 'Candidate',
      accessor: 'candidateId' as const,
      cell: (value: string, row: any) => (
        <div>
          <div className="font-medium">{row.candidateName || 'Unknown'}</div>
          <div className="text-sm text-muted-foreground">{row.candidateEmail || 'N/A'}</div>
        </div>
      )
    },
    {
      id: 'jd',
      header: 'JD',
      accessor: 'jdId' as const,
      cell: (value: string, row: any) => (
        <div>
          <div className="font-medium">{row.jdTitle || 'Unknown JD'}</div>
          <div className="text-sm text-muted-foreground">{row.jdClient || 'N/A'}</div>
        </div>
      )
    },
    {
      id: 'client',
      header: 'Client',
      accessor: 'jdId' as const,
      cell: (value: string, row: any) => row.jdClient || 'N/A'
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
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as const,
      cell: (value: string) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onApplicationSelect(value)}
        >
          View
        </Button>
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Applications ({applications.length})</CardTitle>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Application
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            data={applications}
            columns={columns}
            loading={loading}
            searchable={false}
            emptyMessage="No applications found"
          />
        </CardContent>
      </Card>

      {/* Create Application Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Application</DialogTitle>
            <DialogDescription>
              Select a candidate and job description to create an application
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Candidate *</Label>
              <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select candidate" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map(candidate => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{candidate.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {candidate.email} • {candidate.status}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Job Description *</Label>
              <Select value={selectedJD} onValueChange={setSelectedJD}>
                <SelectTrigger>
                  <SelectValue placeholder="Select JD" />
                </SelectTrigger>
                <SelectContent>
                  {activeJDs.map(jd => (
                    <SelectItem key={jd.id} value={jd.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{jd.title}</span>
                        <span className="text-xs text-muted-foreground">{jd.client}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm text-muted-foreground">
                ℹ️ Primary recruiter will be auto-assigned from the JD's ownership
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCreateDialogOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateApplication}
              disabled={!selectedCandidate || !selectedJD || creating}
            >
              {creating ? 'Creating...' : 'Create Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}