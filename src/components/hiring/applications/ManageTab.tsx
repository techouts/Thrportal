import { useState, useEffect } from 'react'
import { Upload, FolderUp, Search, MoreHorizontal, FileText, ListTree, Split, MessageSquare, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/shared/DataTable'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ApplicationsService } from '@/services/applicationsService'
import { Submission, ApplicationsFilters } from '@/types/applications'
import { useToast } from '@/hooks/use-toast'

export function ManageTab() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ApplicationsFilters>({})
  const { toast } = useToast()

  useEffect(() => {
    loadSubmissions()
  }, [filters])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const data = await ApplicationsService.getSubmissions(filters)
      setSubmissions(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: string, status: Submission['status'], reason?: string) => {
    try {
      await ApplicationsService.updateSubmissionStatus(id, status, reason)
      toast({
        title: "Success",
        description: "Status updated successfully"
      })
      loadSubmissions()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      })
    }
  }

  const getMatchScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'default' as const, color: 'text-green-600' }
    if (score >= 50) return { variant: 'secondary' as const, color: 'text-yellow-600' }
    return { variant: 'destructive' as const, color: 'text-red-600' }
  }

  const getStatusBadge = (status: Submission['status']) => {
    const variants = {
      'New': 'secondary' as const,
      'Shortlisted': 'default' as const,
      'Rejected': 'destructive' as const,
      'Interview Scheduled': 'outline' as const
    }
    return variants[status] || 'secondary'
  }

  const columns = [
    {
      id: 'jdTitle',
      header: 'JD Title',
      accessor: 'jdId' as keyof Submission,
      cell: (item: Submission) => (
        <div className="space-y-1">
          <div className="font-medium">Senior React Developer</div>
          <Badge variant="outline" className="text-xs">Urgent</Badge>
        </div>
      )
    },
    {
      id: 'client',
      header: 'Client',
      accessor: 'jdId' as keyof Submission,
      cell: () => 'TechCorp'
    },
    {
      id: 'recruiter',
      header: 'Submitted By',
      accessor: 'submittedBy' as keyof Submission
    },
    {
      id: 'submittedAt',
      header: 'Submitted On',
      accessor: 'submittedAt' as keyof Submission,
      cell: (item: Submission) => new Date(item.submittedAt).toLocaleDateString()
    },
    {
      id: 'source',
      header: 'Source',
      accessor: 'resumeId' as keyof Submission,
      cell: () => (
        <Badge variant="outline" className="text-xs">Internal</Badge>
      )
    },
    {
      id: 'matchScore',
      header: 'Match %',
      accessor: 'match' as keyof Submission,
      cell: (item: Submission) => {
        const { variant, color } = getMatchScoreBadge(item.match.score)
        return (
          <Badge variant={variant} className={`text-xs ${color}`}>
            {item.match.score}%
          </Badge>
        )
      }
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status' as keyof Submission,
      cell: (item: Submission) => (
        <Badge variant={getStatusBadge(item.status)} className="text-xs">
          {item.status}
        </Badge>
      )
    },
    {
      id: 'tatJdToSub',
      header: 'TAT: JD→1st Sub (hrs)',
      accessor: 'tat' as keyof Submission,
      cell: (item: Submission) => item.tat.jdToFirstSubmissionHrs || '-'
    },
    {
      id: 'tatSubToFb',
      header: 'TAT: Sub→Feedback (hrs)',
      accessor: 'tat' as keyof Submission,
      cell: (item: Submission) => item.tat.submissionToFeedbackHrs || '-'
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof Submission,
      cell: (item: Submission) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <ListTree className="mr-2 h-4 w-4" />
                View JD
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                View Resume
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Split className="mr-2 h-4 w-4" />
                Compare
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className="mr-2 h-4 w-4" />
                Provide Feedback
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserCog className="mr-2 h-4 w-4" />
                Reassign JD
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Applications</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Upload Resume
          </Button>
          <Button variant="outline" size="sm">
            <FolderUp className="mr-2 h-4 w-4" />
            Bulk Upload (.zip)
          </Button>
          <Button variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            Search Resume DB
          </Button>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">156</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Submissions</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-orange-600">23</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shortlisted</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-green-600">45</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Match %</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">73.5%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">JD Coverage</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">68.2%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg TAT (hrs)</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">24.5</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, client: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="techcorp">TechCorp</SelectItem>
                  <SelectItem value="cloudsoft">CloudSoft</SelectItem>
                  <SelectItem value="datatech">DataTech</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">JD Title</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, jdTitle: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select JD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="react-dev">Senior React Developer</SelectItem>
                  <SelectItem value="devops">DevOps Engineer</SelectItem>
                  <SelectItem value="data-scientist">Data Scientist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Internal">Internal</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        data={submissions}
        columns={columns}
        loading={loading}
      />
    </div>
  )
}