import { useState, useEffect } from 'react'
import { AlertTriangle, UserPlus, Upload, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/shared/DataTable'
import { PipelineService } from '@/services/pipelineService'
import { ActiveJD } from '@/types/pipeline'
import { useToast } from '@/hooks/use-toast'

export function ActiveJDsTab() {
  const [activeJDs, setActiveJDs] = useState<ActiveJD[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadActiveJDs()
  }, [])

  const loadActiveJDs = async () => {
    try {
      setLoading(true)
      const data = await PipelineService.getActiveJDs()
      setActiveJDs(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load active JDs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRecruiter = async (jdId: string, recruiterId: string) => {
    try {
      await PipelineService.assignRecruiter(jdId, recruiterId)
      toast({
        title: "Success",
        description: "Recruiter assigned successfully"
      })
      loadActiveJDs()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign recruiter",
        variant: "destructive"
      })
    }
  }

  const getDaysOldBadge = (days: number) => {
    if (days > 7) {
      return <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="mr-1 h-3 w-3" />
        {days} days old
      </Badge>
    }
    if (days > 3) {
      return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
        <Clock className="mr-1 h-3 w-3" />
        {days} days old
      </Badge>
    }
    return <Badge variant="outline" className="text-xs">
      {days} days old
    </Badge>
  }

  const filteredJDs = activeJDs.filter(jd => 
    jd && 
    (jd.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     jd.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     jd.id?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const columns = [
    {
      id: 'jdId',
      header: 'JD ID',
      accessor: 'id' as keyof ActiveJD,
      cell: (item: ActiveJD) => {
        if (!item) return <div>-</div>
        return <div className="font-mono text-sm">{item.id}</div>
      }
    },
    {
      id: 'title',
      header: 'JD Title',
      accessor: 'title' as keyof ActiveJD,
      cell: (item: ActiveJD) => {
        if (!item) return <div>-</div>
        return <div className="font-medium">{item.title}</div>
      }
    },
    {
      id: 'client',
      header: 'Client Name',
      accessor: 'client' as keyof ActiveJD,
      cell: (item: ActiveJD) => {
        if (!item || !item.client) return <div>-</div>
        return <div>{item.client}</div>
      }
    },
    {
      id: 'postedDate',
      header: 'Posted Date',
      accessor: 'postedDate' as keyof ActiveJD,
      cell: (item: ActiveJD) => {
        if (!item || !item.postedDate) return <div>-</div>
        return new Date(item.postedDate).toLocaleDateString()
      }
    },
    {
      id: 'assignedRecruiter',
      header: 'Assigned Recruiter',
      accessor: 'assignedRecruiter' as keyof ActiveJD,
      cell: (item: ActiveJD) => {
        if (!item) return <div>-</div>
        return (
          <div className="flex items-center gap-2">
            {item.assignedRecruiter ? (
              <Badge variant="outline" className="text-xs">
                {item.assignedRecruiter}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                Unassigned
              </Badge>
            )}
          </div>
        )
      }
    },
    {
      id: 'daysSinceCreated',
      header: 'Days Since Created',
      accessor: 'daysSinceCreated' as keyof ActiveJD,
      cell: (item: ActiveJD) => {
        if (!item || typeof item.daysSinceCreated !== 'number') return <div>-</div>
        return getDaysOldBadge(item.daysSinceCreated)
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof ActiveJD,
      cell: (item: ActiveJD) => {
        if (!item) return <div>-</div>
        return (
          <div className="flex items-center gap-2">
            <Select onValueChange={(recruiterId) => handleAssignRecruiter(item.id, recruiterId)}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="Assign Recruiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rec-001">John Recruiter</SelectItem>
                <SelectItem value="rec-002">Sarah Staffing</SelectItem>
                <SelectItem value="rec-003">Mike Talent</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8">
              <Upload className="mr-1 h-3 w-3" />
              Upload Resume
            </Button>
          </div>
        )
      }
    }
  ]

  const urgentJDs = activeJDs.filter(jd => jd && jd.daysSinceCreated > 7)
  const unassignedJDs = activeJDs.filter(jd => jd && !jd.assignedRecruiter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Active JDs - No Submissions</h2>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search JDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              JDs &gt; 7 Days Old
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-red-600">{urgentJDs.length}</div>
            <p className="text-sm text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-orange-500" />
              Unassigned JDs
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-orange-600">{unassignedJDs.length}</div>
            <p className="text-sm text-muted-foreground">Need recruiter assignment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Active JDs</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">{activeJDs.length}</div>
            <p className="text-sm text-muted-foreground">Without submissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Job Requisitions</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredJDs}
            columns={columns}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Bulk Assign Recruiters
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload Resumes
            </Button>
            <Button variant="outline">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Flag for Priority
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}