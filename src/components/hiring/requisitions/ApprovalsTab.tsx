import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  MessageSquare,
  Calendar,
  User,
  Building
} from 'lucide-react'
import { jobRequisitionsService } from '@/services/jobRequisitionsService'
import { useToast } from '@/hooks/use-toast'
import type { JobRequisition } from '@/types/jobRequisitions'

interface ApprovalsTabProps {
  filters: any
}

export function ApprovalsTab({ filters }: ApprovalsTabProps) {
  const [jobRequisitions, setJobRequisitions] = useState<JobRequisition[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJD, setSelectedJD] = useState<JobRequisition | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [comment, setComment] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadPendingApprovals()
  }, [filters])

  const loadPendingApprovals = async () => {
    try {
      setLoading(true)
      // Filter for JDs requiring approval
      const allJDs = await jobRequisitionsService.getJobRequisitions()
      const pendingApprovals = allJDs.filter(jd => 
        jd.status === 'Pending' || jd.status === 'In Review'
      )
      setJobRequisitions(pendingApprovals)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pending approvals",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (jd: JobRequisition) => {
    try {
      setActionLoading(true)
      await jobRequisitionsService.approveJobRequisition(jd.id, comment)
      
      toast({
        title: "Success",
        description: "Job requisition approved successfully"
      })
      
      setComment('')
      setSelectedJD(null)
      loadPendingApprovals()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve job requisition",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (jd: JobRequisition) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      })
      return
    }

    try {
      setActionLoading(true)
      await jobRequisitionsService.rejectJobRequisition(jd.id, rejectionReason)
      
      toast({
        title: "Success",
        description: "Job requisition rejected"
      })
      
      setRejectionReason('')
      setSelectedJD(null)
      loadPendingApprovals()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject job requisition",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Pending': return 'secondary'
      case 'In Review': return 'default'
      default: return 'outline'
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {jobRequisitions.filter(jd => jd.status === 'Pending').length}
                </div>
                <div className="text-sm text-muted-foreground">Pending Approval</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {jobRequisitions.filter(jd => jd.status === 'In Review').length}
                </div>
                <div className="text-sm text-muted-foreground">In Review</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {jobRequisitions.filter(jd => {
                    const daysSinceCreated = Math.floor(
                      (Date.now() - new Date(jd.createdDate).getTime()) / (24 * 60 * 60 * 1000)
                    )
                    return daysSinceCreated > 2
                  }).length}
                </div>
                <div className="text-sm text-muted-foreground">Overdue ({'>'}2 days)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : jobRequisitions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending approvals found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>JD Details</TableHead>
                  <TableHead>Hiring Manager</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Days Pending</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobRequisitions.map((jd) => {
                  const daysPending = Math.floor(
                    (Date.now() - new Date(jd.createdDate).getTime()) / (24 * 60 * 60 * 1000)
                  )
                  
                  return (
                    <TableRow key={jd.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{jd.jobTitle}</div>
                          <div className="text-sm text-muted-foreground">
                            {jd.jdId} • {jd.department}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {jd.workLocation.city} • {jd.positions} positions
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-xs">
                              {jd.hiringManager.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{jd.hiringManager}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityBadgeVariant(jd.priority)}>
                          {jd.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(jd.status)}>
                          {jd.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(jd.createdDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${daysPending > 2 ? 'text-red-600 font-medium' : ''}`}>
                          {daysPending} days
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedJD(jd)}
                            >
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Review Job Requisition</DialogTitle>
                            </DialogHeader>
                            
                            {selectedJD && (
                              <div className="space-y-6">
                                {/* JD Summary */}
                                <Card>
                                  <CardHeader>
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <CardTitle>{selectedJD.jobTitle}</CardTitle>
                                        <p className="text-muted-foreground">{selectedJD.jdId}</p>
                                      </div>
                                      <div className="flex gap-2">
                                        <Badge variant={getStatusBadgeVariant(selectedJD.status)}>
                                          {selectedJD.status}
                                        </Badge>
                                        <Badge variant={getPriorityBadgeVariant(selectedJD.priority)}>
                                          {selectedJD.priority}
                                        </Badge>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="font-medium">Department:</span> {selectedJD.department}
                                      </div>
                                      <div>
                                        <span className="font-medium">Business Unit:</span> {selectedJD.businessUnit}
                                      </div>
                                      <div>
                                        <span className="font-medium">Location:</span> {selectedJD.workLocation.city} ({selectedJD.workLocation.mode})
                                      </div>
                                      <div>
                                        <span className="font-medium">Positions:</span> {selectedJD.positions}
                                      </div>
                                      <div>
                                        <span className="font-medium">Experience:</span> {selectedJD.experience.min}-{selectedJD.experience.max} years
                                      </div>
                                      <div>
                                        <span className="font-medium">Budget:</span> {selectedJD.budget.min}-{selectedJD.budget.max} {selectedJD.budget.type}
                                      </div>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div>
                                      <div className="font-medium mb-2">Job Summary</div>
                                      <p className="text-sm leading-relaxed">{selectedJD.shortSummary}</p>
                                    </div>
                                    
                                    <div>
                                      <div className="font-medium mb-2">Must-Have Skills</div>
                                      <div className="flex flex-wrap gap-2">
                                        {selectedJD.requiredSkills.mustHave.map((skill, index) => (
                                          <Badge key={index} variant="default">
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Approval Actions */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Approval Decision</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium">Comments (Optional)</label>
                                      <Textarea
                                        placeholder="Add any comments or feedback..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="mt-1"
                                      />
                                    </div>
                                    
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleApprove(selectedJD)}
                                        disabled={actionLoading}
                                        className="flex items-center gap-2"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                        Approve
                                      </Button>
                                      
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button variant="destructive" className="flex items-center gap-2">
                                            <XCircle className="h-4 w-4" />
                                            Reject
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Reject Job Requisition</DialogTitle>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            <div>
                                              <label className="text-sm font-medium">Reason for Rejection *</label>
                                              <Textarea
                                                placeholder="Please provide a detailed reason for rejection..."
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                className="mt-1"
                                                required
                                              />
                                            </div>
                                            <div className="flex justify-end gap-2">
                                              <Button variant="outline" onClick={() => setRejectionReason('')}>
                                                Cancel
                                              </Button>
                                              <Button
                                                variant="destructive"
                                                onClick={() => handleReject(selectedJD)}
                                                disabled={actionLoading || !rejectionReason.trim()}
                                              >
                                                Reject JD
                                              </Button>
                                            </div>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                      
                                      <Button variant="outline" className="flex items-center gap-2">
                                        <ArrowLeft className="h-4 w-4" />
                                        Send Back to Manager
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}