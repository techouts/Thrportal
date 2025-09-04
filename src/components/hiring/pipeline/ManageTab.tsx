import { useState, useEffect } from 'react'
import { Download, MoreHorizontal, History, MessageSquare, Users, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DataTable } from '@/components/shared/DataTable'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PipelineService } from '@/services/pipelineService'
import { PipelineApplication, ApplicationStatus, PipelineFilters, StatusHistoryEntry } from '@/types/pipeline'
import { useToast } from '@/hooks/use-toast'

export function ManageTab() {
  const [applications, setApplications] = useState<PipelineApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<PipelineFilters>({})
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState<ApplicationStatus>('Submitted')
  const [bulkComment, setBulkComment] = useState('')
  const [viewMode, setViewMode] = useState<'all' | 'by-jd' | 'by-recruiter' | 'by-client'>('all')
  const { toast } = useToast()

  useEffect(() => {
    loadApplications()
  }, [filters])

  const loadApplications = async () => {
    try {
      setLoading(true)
      const data = await PipelineService.getApplications(filters)
      setApplications(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: string, status: ApplicationStatus, comment?: string) => {
    try {
      await PipelineService.updateApplicationStatus(id, status, comment)
      toast({
        title: "Success",
        description: "Status updated successfully"
      })
      loadApplications()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      })
    }
  }

  const handleBulkUpdate = async () => {
    if (selectedApplications.length === 0) {
      toast({
        title: "Warning",
        description: "Please select applications to update",
        variant: "destructive"
      })
      return
    }

    try {
      await PipelineService.bulkUpdateStatus({
        applicationIds: selectedApplications,
        newStatus: bulkStatus,
        comment: bulkComment
      })
      toast({
        title: "Success",
        description: `Updated ${selectedApplications.length} applications`
      })
      setSelectedApplications([])
      setBulkComment('')
      loadApplications()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update applications",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: ApplicationStatus) => {
    const variants = {
      'Submitted': { variant: 'secondary' as const, color: 'bg-blue-100 text-blue-700' },
      'L1 Cleared': { variant: 'outline' as const, color: 'bg-green-100 text-green-700' },
      'L2 Cleared': { variant: 'outline' as const, color: 'bg-green-200 text-green-800' },
      'L3 Cleared': { variant: 'outline' as const, color: 'bg-green-300 text-green-900' },
      'HR Cleared': { variant: 'outline' as const, color: 'bg-purple-100 text-purple-700' },
      'Offer': { variant: 'default' as const, color: 'bg-yellow-100 text-yellow-700' },
      'Rejected': { variant: 'destructive' as const, color: 'bg-red-100 text-red-700' }
    }
    return variants[status] || { variant: 'secondary' as const, color: '' }
  }

  const StatusHistoryDialog = ({ application }: { application: PipelineApplication }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <History className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Status History - {application.candidateName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {application.statusHistory && application.statusHistory.length > 0 ? (
            application.statusHistory.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {entry.previousStatus && (
                        <>
                          <Badge className={getStatusBadge(entry.previousStatus).color}>
                            {entry.previousStatus}
                          </Badge>
                          <span>→</span>
                        </>
                      )}
                      <Badge className={getStatusBadge(entry.newStatus).color}>
                        {entry.newStatus}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(entry.changedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Changed by:</span> {entry.changedBy}
                  </div>
                  {entry.comment && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      <span className="font-medium">Comment:</span> {entry.comment}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground">No status history available</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )

  const columns = [
    {
      id: 'select',
      header: '',
      accessor: 'id' as keyof PipelineApplication,
      cell: (item: PipelineApplication) => (
        <input
          type="checkbox"
          checked={selectedApplications.includes(item.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedApplications(prev => [...prev, item.id])
            } else {
              setSelectedApplications(prev => prev.filter(id => id !== item.id))
            }
          }}
          className="h-4 w-4"
        />
      )
    },
    {
      id: 'candidateName',
      header: 'Candidate Name',
      accessor: 'candidateName' as keyof PipelineApplication,
      cell: (item: PipelineApplication) => (
        <div className="font-medium">{item.candidateName}</div>
      )
    },
    {
      id: 'jdInfo',
      header: 'JD Title / ID',
      accessor: 'jdTitle' as keyof PipelineApplication,
      cell: (item: PipelineApplication) => (
        <div className="space-y-1">
          <div className="font-medium">{item.jdTitle}</div>
          <div className="text-sm text-muted-foreground">{item.jdId}</div>
        </div>
      )
    },
    {
      id: 'client',
      header: 'Client Name',
      accessor: 'client' as keyof PipelineApplication
    },
    {
      id: 'recruiter',
      header: 'Recruiter Name',
      accessor: 'recruiterName' as keyof PipelineApplication
    },
    {
      id: 'status',
      header: 'Current Status',
      accessor: 'currentStatus' as keyof PipelineApplication,
      cell: (item: PipelineApplication) => (
        <Select
          value={item.currentStatus}
          onValueChange={(value: ApplicationStatus) => handleStatusUpdate(item.id, value)}
        >
          <SelectTrigger className="w-36">
            <SelectValue>
              <Badge className={getStatusBadge(item.currentStatus).color}>
                {item.currentStatus}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Submitted">Submitted</SelectItem>
            <SelectItem value="L1 Cleared">L1 Cleared</SelectItem>
            <SelectItem value="L2 Cleared">L2 Cleared</SelectItem>
            <SelectItem value="L3 Cleared">L3 Cleared</SelectItem>
            <SelectItem value="HR Cleared">HR Cleared</SelectItem>
            <SelectItem value="Offer">Offer</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      )
    },
    {
      id: 'lastUpdated',
      header: 'Last Updated',
      accessor: 'lastUpdated' as keyof PipelineApplication,
      cell: (item: PipelineApplication) => new Date(item.lastUpdated).toLocaleDateString()
    },
    {
      id: 'notes',
      header: 'Notes',
      accessor: 'notes' as keyof PipelineApplication,
      cell: (item: PipelineApplication) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-32 truncate cursor-pointer">
                {item.notes || 'No notes'}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{item.notes || 'No notes available'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    {
      id: 'updatedBy',
      header: 'Updated By',
      accessor: 'updatedBy' as keyof PipelineApplication
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof PipelineApplication,
      cell: (item: PipelineApplication) => (
        <div className="flex items-center gap-1">
          <StatusHistoryDialog application={item} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Notes
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Application Pipeline</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Applications</TabsTrigger>
          <TabsTrigger value="by-jd">By JD</TabsTrigger>
          <TabsTrigger value="by-recruiter">By Recruiter</TabsTrigger>
          <TabsTrigger value="by-client">By Client</TabsTrigger>
        </TabsList>

        <TabsContent value={viewMode} className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">JD Title / ID</label>
                  <Input 
                    placeholder="Search JD..."
                    onChange={(e) => setFilters(prev => ({ ...prev, jdTitle: e.target.value || undefined }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client Name</label>
                  <Select onValueChange={(value) => setFilters(prev => ({ ...prev, client: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All clients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TechCorp">TechCorp</SelectItem>
                      <SelectItem value="CloudSoft">CloudSoft</SelectItem>
                      <SelectItem value="DataTech">DataTech</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recruiter</label>
                  <Select onValueChange={(value) => setFilters(prev => ({ ...prev, recruiter: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All recruiters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="John Recruiter">John Recruiter</SelectItem>
                      <SelectItem value="Sarah Staffing">Sarah Staffing</SelectItem>
                      <SelectItem value="Mike Talent">Mike Talent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      <SelectItem value="L1 Cleared">L1 Cleared</SelectItem>
                      <SelectItem value="L2 Cleared">L2 Cleared</SelectItem>
                      <SelectItem value="L3 Cleared">L3 Cleared</SelectItem>
                      <SelectItem value="HR Cleared">HR Cleared</SelectItem>
                      <SelectItem value="Offer">Offer</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedApplications.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {selectedApplications.length} applications selected
                    </span>
                    <Select value={bulkStatus} onValueChange={(value: ApplicationStatus) => setBulkStatus(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Submitted">Submitted</SelectItem>
                        <SelectItem value="L1 Cleared">L1 Cleared</SelectItem>
                        <SelectItem value="L2 Cleared">L2 Cleared</SelectItem>
                        <SelectItem value="L3 Cleared">L3 Cleared</SelectItem>
                        <SelectItem value="HR Cleared">HR Cleared</SelectItem>
                        <SelectItem value="Offer">Offer</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Add bulk comment (optional)"
                      value={bulkComment}
                      onChange={(e) => setBulkComment(e.target.value)}
                      className="w-64 h-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setSelectedApplications([])}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkUpdate}>
                      Update Selected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Table */}
          <DataTable
            data={applications}
            columns={columns}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}