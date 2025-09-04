import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Search, Filter, Eye, Edit, Copy, RotateCcw, Calendar, MapPin, Users } from 'lucide-react'
import { jobRequisitionsService } from '@/services/jobRequisitionsService'
import { CreateJDForm } from './CreateJDForm'
import { JDDetailsDrawer } from './JDDetailsDrawer'
import { useToast } from '@/hooks/use-toast'
import type { JobRequisition, JobRequisitionFilters } from '@/types/jobRequisitions'

interface ManageTabProps {
  filters: JobRequisitionFilters
  onFiltersChange: (filters: JobRequisitionFilters) => void
}

export function ManageTab({ filters, onFiltersChange }: ManageTabProps) {
  const [jobRequisitions, setJobRequisitions] = useState<JobRequisition[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJD, setSelectedJD] = useState<JobRequisition | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadJobRequisitions()
  }, [filters])

  const loadJobRequisitions = async () => {
    try {
      setLoading(true)
      const data = await jobRequisitionsService.getJobRequisitions(filters)
      setJobRequisitions(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load job requisitions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (jd: JobRequisition) => {
    setSelectedJD(jd)
    setShowDetailsDrawer(true)
  }

  const handleClone = async (jd: JobRequisition) => {
    try {
      await jobRequisitionsService.cloneJobRequisition(jd.id)
      toast({
        title: "Success",
        description: "Job requisition cloned successfully"
      })
      loadJobRequisitions()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clone job requisition",
        variant: "destructive"
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'default'
      case 'Rejected': return 'destructive'
      case 'In Review': return 'secondary'
      case 'On Hold': return 'outline'
      default: return 'secondary'
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'destructive'
      case 'High': return 'default'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search job title..."
                value={filters.jobTitle || ''}
                onChange={(e) => onFiltersChange({ ...filters, jobTitle: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status || ''} onValueChange={(value) => onFiltersChange({ ...filters, status: value || undefined })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.department || ''} onValueChange={(value) => onFiltersChange({ ...filters, department: value || undefined })}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority || ''} onValueChange={(value) => onFiltersChange({ ...filters, priority: value || undefined })}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Hiring manager..."
              value={filters.hiringManager || ''}
              onChange={(e) => onFiltersChange({ ...filters, hiringManager: e.target.value })}
            />

            <Button
              variant="outline"
              onClick={() => onFiltersChange({})}
              className="whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Requisitions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Job Requisitions</CardTitle>
            <p className="text-sm text-muted-foreground">
              {jobRequisitions.length} requisitions found
            </p>
          </div>
          
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create JD
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Job Requisition</DialogTitle>
              </DialogHeader>
              <CreateJDForm
                onSuccess={() => {
                  setShowCreateForm(false)
                  loadJobRequisitions()
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>JD ID</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Hiring Manager</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Target DOJ</TableHead>
                  <TableHead>Positions</TableHead>
                  <TableHead>CVs/Offers</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobRequisitions.map((jd) => (
                  <TableRow key={jd.id}>
                    <TableCell className="font-mono text-sm">{jd.jdId}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{jd.jobTitle}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {jd.workLocation.city} ({jd.workLocation.mode})
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{jd.hiringManager}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(jd.status)}>
                        {jd.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(jd.priority)}>
                        {jd.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {jd.isInternal ? (
                        <Badge variant="outline">Internal</Badge>
                      ) : (
                        jd.clientName || 'External'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(jd.createdDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(jd.expectedDOJ).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {jd.positions}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{jd.cvsShared} CVs</div>
                        <div className="text-muted-foreground">{jd.offersMade} Offers</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(jd)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleClone(jd)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {jd.status === 'Rejected' && (
                          <Button variant="ghost" size="sm">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Job Details Drawer */}
      <Sheet open={showDetailsDrawer} onOpenChange={setShowDetailsDrawer}>
        <SheetContent className="w-[800px] max-w-[90vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Job Requisition Details</SheetTitle>
            <SheetDescription>
              Complete information about the job requisition
            </SheetDescription>
          </SheetHeader>
          {selectedJD && (
            <JDDetailsDrawer 
              jobRequisition={selectedJD} 
              onClose={() => setShowDetailsDrawer(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}