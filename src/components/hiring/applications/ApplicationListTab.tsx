import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/shared/DataTable'
import { Search, Filter, Download, RefreshCw, Plus, Check, X, RefreshCw as RefreshCwIcon } from 'lucide-react'
import { Application, Submission } from '@/types/applications'
import { ApplicationsService } from '@/services/applicationsService'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Checkbox } from '@/components/ui/checkbox'
import * as XLSX from 'xlsx'
import { useAuth } from '@/auth/AuthContext'
import { CreateApplicationDialog } from './CreateApplicationDialog'

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
  approvalStatus?: string
  search?: string
  dateRange?: {
    start: string
    end: string
  }
}

export const ApplicationListTab: React.FC<ApplicationListTabProps> = ({ onApplicationSelect }) => {
  const { can } = useAuth()
  const [applications, setApplications] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<ApplicationFilters>({})
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  // Create Application Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  
  // Permission checks
  const canApprove = can('applications.update') || can('applications.*')
  const canRequestReApproval = can('applications.submissions.create')

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

      if (filters.approvalStatus && filters.approvalStatus !== 'all') {
        apps = apps.filter(app => app.approvalStatus === filters.approvalStatus)
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
    setCurrentPage(1)
    setSelectedRows(new Set())
  }, [filters])

  // Calculate paginated data
  const paginatedApplications = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return applications.slice(startIndex, endIndex)
  }, [applications, currentPage, pageSize])

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(applications.map(app => app.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedRows(newSelected)
  }

  const clearSelection = () => setSelectedRows(new Set())

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setSelectedRows(new Set())
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
    setSelectedRows(new Set())
  }

  // Export handler
  const handleExport = () => {
    if (selectedRows.size === 0) {
      toast.error('Please select at least one row to export')
      return
    }

    const selectedApps = applications.filter(app => selectedRows.has(app.id))
    
    const exportData = selectedApps.map(app => ({
      'Candidate Name': app.candidateName || 'N/A',
      'Email': app.candidateEmail || 'N/A',
      'JD Title': app.jdTitle || 'N/A',
      'Client': app.jdClient || 'N/A',
      'Stage': app.stage || 'N/A',
      'Round': app.round || 'N/A',
      'Submitter': app.submittedBy || 'N/A',
      'Primary Recruiter': app.primaryRecruiter || 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Applications')

    const fileName = `applications_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.xlsx`
    
    XLSX.writeFile(wb, fileName)

    const mailtoLink = `mailto:?subject=Application Export - ${format(new Date(), 'MMM dd, yyyy')}&body=Please find the attached Excel file with ${selectedRows.size} application(s).%0A%0ANote: The Excel file has been downloaded to your Downloads folder. Please attach it manually to this email.`
    window.open(mailtoLink, '_blank')

    toast.success(`Exported ${selectedRows.size} application(s) to Excel`)
    clearSelection()
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

  const getStatusBadge = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800'
      case 'Shortlisted': return 'bg-purple-100 text-purple-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      case 'Interview Scheduled': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getApprovalStatusBadge = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleApprove = async (applicationId: string) => {
    try {
      await ApplicationsService.approveApplication(applicationId)
      toast.success('Application approved')
      loadApplications()
    } catch (error) {
      toast.error('Failed to approve application')
    }
  }

  const handleReject = async (applicationId: string) => {
    try {
      await ApplicationsService.rejectApplication(applicationId)
      toast.success('Application rejected')
      loadApplications()
    } catch (error) {
      toast.error('Failed to reject application')
    }
  }

  const handleRequestReApproval = async (applicationId: string) => {
    try {
      await ApplicationsService.requestReApproval(applicationId)
      toast.success('Re-approval requested')
      loadApplications()
    } catch (error) {
      toast.error('Failed to request re-approval')
    }
  }

  const columns = [
    {
      id: 'select',
      header: 'Select',
      accessor: 'id' as const,
      cell: (value: string) => (
        <Checkbox
          checked={selectedRows.has(value)}
          onCheckedChange={(checked) => handleSelectRow(value, checked as boolean)}
          aria-label={`Select row ${value}`}
        />
      ),
      sortable: false,
      width: 'w-12'
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
      id: 'status',
      header: 'Status',
      accessor: 'status' as const,
      cell: (value?: string) => (
        <Badge className={getStatusBadge(value)}>
          {value || 'N/A'}
        </Badge>
      ),
      sortable: true
    },
    {
      id: 'approvalStatus',
      header: 'Approval Status',
      accessor: 'approvalStatus' as const,
      cell: (value?: string) => (
        <Badge className={getApprovalStatusBadge(value)}>
          {value || 'Pending'}
        </Badge>
      ),
      sortable: true
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
      cell: (value: string, row: Application) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onApplicationSelect(value)}
          >
            View
          </Button>
          
          {canApprove && row.approvalStatus === 'Pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 hover:bg-green-50"
                onClick={() => handleApprove(value)}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => handleReject(value)}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          
          {canRequestReApproval && !canApprove && row.approvalStatus === 'Rejected' && (
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 hover:bg-blue-50"
              onClick={() => handleRequestReApproval(value)}
            >
              <RefreshCwIcon className="h-4 w-4 mr-1" />
              Re-submit
            </Button>
          )}
        </div>
      ),
      sortable: false
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

            <Select value={filters.approvalStatus} onValueChange={(value) => setFilters({ ...filters, approvalStatus: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Approval Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Approvals</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-2">
              <Checkbox
                checked={selectedRows.size === applications.length && applications.length > 0}
                onCheckedChange={handleSelectAll}
                aria-label="Select all visible"
                id="select-all"
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select All ({applications.length})
              </label>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadApplications}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
              disabled={selectedRows.size === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export ({selectedRows.size})
            </Button>
            {selectedRows.size > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearSelection}
              >
                Clear Selection
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Applications ({applications.length})</CardTitle>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Application
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedApplications}
            columns={columns}
            loading={loading}
            searchable={false}
            pagination={{
              page: currentPage,
              pageSize: pageSize,
              total: applications.length,
              onPageChange: handlePageChange,
              onPageSizeChange: handlePageSizeChange
            }}
            emptyMessage="No applications found"
          />
        </CardContent>
      </Card>

      {/* Create Application Dialog */}
      <CreateApplicationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadApplications}
      />
    </div>
  )
}