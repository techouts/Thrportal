import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Filter, Search } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { ApplicationsService } from '@/services/applicationsService'
import { Submission } from '@/types/applications'
import { useToast } from '@/hooks/use-toast'

export function PipelinesTab() {
  const [applications, setApplications] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState({
    client: undefined as string | undefined,
    jdTitle: undefined as string | undefined,
    recruiter: undefined as string | undefined,
    stage: undefined as string | undefined,
    sla: undefined as string | undefined
  })
  const { toast } = useToast()

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      setLoading(true)
      const allSubmissions = await ApplicationsService.getSubmissions()
      const approvedApplications = allSubmissions.filter(app => app.approvalStatus === 'Approved')
      setApplications(approvedApplications)
    } catch (error) {
      console.error('Failed to load applications:', error)
      toast({
        title: "Error",
        description: "Failed to load pipeline data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1) // Reset to first page when filters change
  }

  // Filter applications based on search and filters
  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchTerm || 
      app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jdTitle.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesClient = !filters.client || filters.client === 'all' || 
      app.jdClient === filters.client
    
    const matchesJD = !filters.jdTitle || 
      app.jdTitle.toLowerCase().includes(filters.jdTitle.toLowerCase())
    
    const matchesRecruiter = !filters.recruiter || filters.recruiter === 'all' || 
      app.primaryRecruiter === filters.recruiter
    
    const matchesStage = !filters.stage || filters.stage === 'all' || 
      app.stage === filters.stage
    
    const matchesSLA = !filters.sla || filters.sla === 'all' || 
      app.slaStatus.toLowerCase() === filters.sla.toLowerCase()
    
    return matchesSearch && matchesClient && matchesJD && 
           matchesRecruiter && matchesStage && matchesSLA
  })

  // Paginate filtered data
  const paginatedApplications = filteredApplications.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  // Define columns for table
  const columns = [
    {
      id: 'candidate',
      header: 'Candidate',
      accessor: 'candidateName' as keyof Submission,
      cell: (value: any, row: Submission) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{row.jdClient}</div>
        </div>
      )
    },
    {
      id: 'jd',
      header: 'JD',
      accessor: 'jdTitle' as keyof Submission,
      cell: (value: any, row: Submission) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{row.jdClient}</div>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'stage' as keyof Submission,
      cell: (value: any) => (
        <Badge variant={value === 'Joined' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    {
      id: 'round',
      header: 'Round',
      accessor: 'round' as keyof Submission
    },
    {
      id: 'ageing',
      header: 'Ageing',
      accessor: 'submittedAt' as keyof Submission,
      cell: (value: any) => {
        const days = Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24))
        return `${days} days`
      }
    },
    {
      id: 'sla',
      header: 'SLA',
      accessor: 'slaStatus' as keyof Submission,
      cell: (value: any) => {
        const variant = value === 'Green' ? 'default' : value === 'Amber' ? 'secondary' : 'destructive'
        return <Badge variant={variant}>{value}</Badge>
      }
    },
    {
      id: 'owner',
      header: 'Owner',
      accessor: 'primaryRecruiter' as keyof Submission
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof Submission,
      cell: (value: any, row: Submission) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Update</Button>
          <Button size="sm" variant="outline">Remind</Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Candidate, JD..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label>Client</Label>
              <Select value={filters.client || 'all'} onValueChange={(value) => handleFilterChange('client', value === 'all' ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {Array.from(new Set(applications.map(app => app.jdClient))).map(client => (
                    <SelectItem key={client} value={client}>{client}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>JD</Label>
              <Input 
                placeholder="JD Title..."
                value={filters.jdTitle || ''}
                onChange={(e) => handleFilterChange('jdTitle', e.target.value || undefined)}
              />
            </div>
            <div>
              <Label>Recruiter</Label>
              <Select value={filters.recruiter || 'all'} onValueChange={(value) => handleFilterChange('recruiter', value === 'all' ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Recruiters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recruiters</SelectItem>
                  {Array.from(new Set(applications.map(app => app.primaryRecruiter))).map(recruiter => (
                    <SelectItem key={recruiter} value={recruiter}>{recruiter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stage</Label>
              <Select value={filters.stage || 'all'} onValueChange={(value) => handleFilterChange('stage', value === 'all' ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="Interview">Interview</SelectItem>
                  <SelectItem value="Offer">Offer</SelectItem>
                  <SelectItem value="Joined">Joined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>SLA</Label>
              <Select value={filters.sla || 'all'} onValueChange={(value) => handleFilterChange('sla', value === 'all' ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All SLA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All SLA</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="amber">Amber</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          Loading pipeline data...
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={paginatedApplications}
              searchable={false}
              pagination={{
                page,
                pageSize,
                total: filteredApplications.length,
                onPageChange: setPage,
                onPageSizeChange: (size) => {
                  setPageSize(size)
                  setPage(1)
                }
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}