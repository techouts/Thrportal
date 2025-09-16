import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { LayoutGrid, List, Filter, Search, Users, Briefcase, Building } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { PipelineKanban } from './PipelineKanban'
import { pipelineService } from '@/services/pipelineService'
import { PipelineApplication, PipelineFilters } from '@/types/pipeline'

export function PipelinesTab() {
  const [viewScope, setViewScope] = useState<'my' | 'jd' | 'team'>('my')
  const [layoutMode, setLayoutMode] = useState<'list' | 'board'>('list')
  const [applications, setApplications] = useState<PipelineApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<PipelineFilters>({})
  const [searchTerm, setSearchTerm] = useState('')

  // Get initial view from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const view = params.get('view')
    if (view === 'jd' || view === 'my' || view === 'team') {
      setViewScope(view)
    }
  }, [])

  useEffect(() => {
    loadApplications()
  }, [viewScope, filters])

  const loadApplications = async () => {
    try {
      setLoading(true)
      let data: PipelineApplication[] = []
      
      switch (viewScope) {
        case 'my':
          data = await pipelineService.getMyApplications('current-user-id')
          break
        case 'jd':
          data = await pipelineService.getApplications(filters)
          break
        case 'team':
          // Get team applications - would normally filter by team
          data = await pipelineService.getApplications(filters)
          break
      }
      
      setApplications(data)
    } catch (error) {
      console.error('Failed to load applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof PipelineFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    console.log(`Bulk action: ${action} on`, selectedIds)
  }

  // Filter applications based on search term
  const filteredApplications = applications.filter(app => 
    app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jdTitle.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Role-based scope options
  const getScopeOptions = () => {
    // This would be based on user role
    const userRole = 'recruiter' // This would come from auth context
    
    const options = []
    if (userRole === 'recruiter') {
      options.push({ value: 'my', label: 'My Pipeline', icon: Users })
      options.push({ value: 'jd', label: 'JD View', icon: Briefcase })
    } else if (userRole === 'manager') {
      options.push({ value: 'team', label: 'Team Pipeline', icon: Building })
      options.push({ value: 'jd', label: 'JD View', icon: Briefcase })
      options.push({ value: 'my', label: 'My Pipeline', icon: Users })
    } else if (userRole === 'leadership') {
      options.push({ value: 'jd', label: 'JD View', icon: Briefcase })
      options.push({ value: 'team', label: 'Team View', icon: Building })
    }
    
    return options
  }

  const scopeOptions = getScopeOptions()

  // Define columns for list view
  const columns = [
    {
      id: 'candidate',
      header: 'Candidate',
      accessor: 'candidateName' as keyof PipelineApplication,
      cell: (value: any, row: PipelineApplication) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{row.client}</div>
        </div>
      )
    },
    {
      id: 'jd',
      header: 'JD',
      accessor: 'jdTitle' as keyof PipelineApplication,
      cell: (value: any, row: PipelineApplication) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{row.client}</div>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'currentStatus' as keyof PipelineApplication,
      cell: (value: any) => (
        <Badge variant={value === 'Joined' ? 'default' : 'secondary'}>
          {value.replace('-', ' ')}
        </Badge>
      )
    },
    {
      id: 'round',
      header: 'Round',
      accessor: 'currentRound' as keyof PipelineApplication
    },
    {
      id: 'ageing',
      header: 'Ageing',
      accessor: 'ageing' as keyof PipelineApplication,
      cell: (value: any) => `${value} days`
    },
    {
      id: 'sla',
      header: 'SLA',
      accessor: 'slaStatus' as keyof PipelineApplication,
      cell: (value: any) => (
        <Badge variant={value === 'green' ? 'default' : value === 'amber' ? 'secondary' : 'destructive'}>
          {value}
        </Badge>
      )
    },
    {
      id: 'owner',
      header: 'Owner',
      accessor: 'primaryRecruiter' as keyof PipelineApplication
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof PipelineApplication,
      cell: (value: any, row: PipelineApplication) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Update</Button>
          <Button size="sm" variant="outline">Remind</Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* View Scope Switcher */}
            <div className="flex gap-4">
              <Tabs value={viewScope} onValueChange={(value: string) => setViewScope(value as 'my' | 'jd' | 'team')}>
                <TabsList>
                  {scopeOptions.map(option => (
                    <TabsTrigger key={option.value} value={option.value} className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <Switch 
                  checked={layoutMode === 'board'} 
                  onCheckedChange={(checked) => setLayoutMode(checked ? 'board' : 'list')}
                />
                <LayoutGrid className="h-4 w-4" />
              </div>
              <Badge variant="outline">
                {layoutMode === 'board' ? 'Board View' : 'List View'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  placeholder="Candidate, email, JD..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  <SelectItem value="TechCorp Inc">TechCorp Inc</SelectItem>
                  <SelectItem value="InnovateCo">InnovateCo</SelectItem>
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
                  <SelectItem value="Alice Smith">Alice Smith</SelectItem>
                  <SelectItem value="Bob Johnson">Bob Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stage</Label>
              <Select value={(filters.statuses?.[0]) || 'all'} onValueChange={(value) => handleFilterChange('statuses', value === 'all' ? undefined : [value])}>
                <SelectTrigger>
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="Interview-R1">Interview R1</SelectItem>
                  <SelectItem value="Offer-Released">Offered</SelectItem>
                  <SelectItem value="Joined">Joined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>SLA</Label>
              <Select>
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

      {/* Content based on layout mode */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          Loading pipeline data...
        </div>
      ) : layoutMode === 'list' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {viewScope === 'my' && 'My Pipeline'}
                {viewScope === 'jd' && 'JD Pipeline View'}
                {viewScope === 'team' && 'Team Pipeline'}
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleBulkAction('remind', [])}
                >
                  Bulk Remind
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleBulkAction('reassign', [])}
                >
                  Bulk Reassign
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={filteredApplications}
              searchable={false} // We handle search above
            />
          </CardContent>
        </Card>
      ) : (
        <PipelineKanban 
          applications={filteredApplications}
          viewScope={viewScope}
          onStatusChange={(id, status) => {
            // Handle status change
            console.log('Status change:', id, status)
          }}
        />
      )}
    </div>
  )
}