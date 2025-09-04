import { useState, useEffect } from 'react'
import { Plus, AlertTriangle, CheckCircle, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DataTable } from '@/components/shared/DataTable'
import { BgvService } from '@/services/bgvService'
import { BgvException, BgvFilters } from '@/types/bgv'
import { useToast } from '@/hooks/use-toast'

export function ExceptionsTab() {
  const [exceptions, setExceptions] = useState<BgvException[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedException, setSelectedException] = useState<BgvException | null>(null)
  const [showNewException, setShowNewException] = useState(false)
  const [newException, setNewException] = useState({
    bgvCaseId: '',
    type: 'WAIVER' as any,
    reason: '',
    approverRole: 'HR_MANAGER' as any,
    attachment: null as File | null
  })
  const [decisionNote, setDecisionNote] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadExceptions()
  }, [])

  const loadExceptions = async () => {
    try {
      setLoading(true)
      const data = await BgvService.getExceptions()
      setExceptions(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load exceptions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: BgvException['status']) => {
    const variants = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
      'APPROVED': { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      'REJECTED': { color: 'bg-red-100 text-red-700', icon: X }
    }
    return variants[status] || { color: 'bg-gray-100 text-gray-700', icon: AlertTriangle }
  }

  const handleCreateException = async () => {
    if (!newException.bgvCaseId || !newException.reason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      await BgvService.createException(newException)
      toast({
        title: "Exception Created",
        description: "Exception request submitted for approval"
      })
      
      setNewException({
        bgvCaseId: '',
        type: 'WAIVER',
        reason: '',
        approverRole: 'HR_MANAGER',
        attachment: null
      })
      setShowNewException(false)
      loadExceptions()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create exception",
        variant: "destructive"
      })
    }
  }

  const handleApproveException = async (approve: boolean) => {
    if (!selectedException) return

    try {
      if (approve) {
        await BgvService.approveException(selectedException.id, decisionNote)
        toast({
          title: "Exception Approved",
          description: "Exception has been approved and logged"
        })
      } else {
        // Mock rejection
        toast({
          title: "Exception Rejected",
          description: "Exception has been rejected"
        })
      }
      
      setSelectedException(null)
      setDecisionNote('')
      loadExceptions()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process exception",
        variant: "destructive"
      })
    }
  }

  const columns = [
    {
      id: 'caseId',
      header: 'Case ID',
      accessor: 'bgvCaseId' as keyof BgvException,
      cell: (item: BgvException) => (
        <div className="text-sm font-medium">{item.bgvCaseId}</div>
      )
    },
    {
      id: 'candidate',
      header: 'Candidate',
      accessor: 'bgvCaseId' as keyof BgvException,
      cell: (item: BgvException) => (
        <div className="text-sm">
          <div className="font-medium">John Doe</div>
          <div className="text-muted-foreground">JD-2024-001 • TechCorp</div>
        </div>
      )
    },
    {
      id: 'type',
      header: 'Exception Type',
      accessor: 'type' as keyof BgvException,
      cell: (item: BgvException) => (
        <Badge variant="outline" className="text-xs">
          {item.type.replace('_', ' ')}
        </Badge>
      )
    },
    {
      id: 'reason',
      header: 'Reason',
      accessor: 'reason' as keyof BgvException,
      cell: (item: BgvException) => (
        <div className="max-w-xs text-sm">
          <span className="line-clamp-2">{item.reason}</span>
        </div>
      )
    },
    {
      id: 'requestedBy',
      header: 'Requested By',
      accessor: 'requestedBy' as keyof BgvException,
      cell: (item: BgvException) => (
        <div className="text-sm">{item.requestedBy}</div>
      )
    },
    {
      id: 'approver',
      header: 'Approver',
      accessor: 'approverRole' as keyof BgvException,
      cell: (item: BgvException) => (
        <Badge variant="secondary" className="text-xs">
          {item.approverRole.replace('_', ' ')}
        </Badge>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status' as keyof BgvException,
      cell: (item: BgvException) => {
        const statusBadge = getStatusBadge(item.status)
        return (
          <Badge className={`text-xs ${statusBadge.color}`}>
            {item.status}
          </Badge>
        )
      }
    },
    {
      id: 'updatedAt',
      header: 'Updated',
      accessor: 'updatedAt' as keyof BgvException,
      cell: (item: BgvException) => (
        <div className="text-sm">
          {new Date(item.updatedAt).toLocaleDateString()}
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof BgvException,
      cell: (item: BgvException) => (
        <div className="flex items-center gap-1">
          {item.status === 'PENDING' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedException(item)}
            >
              Review
            </Button>
          )}
          {item.attachmentUrl && (
            <Button variant="ghost" size="sm">
              <FileText className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ]

  const stats = {
    total: exceptions.length,
    pending: exceptions.filter(e => e.status === 'PENDING').length,
    approved: exceptions.filter(e => e.status === 'APPROVED').length,
    rejected: exceptions.filter(e => e.status === 'REJECTED').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">BGV Exceptions</h2>
        <Button onClick={() => setShowNewException(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Exception
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Exceptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending Approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        data={exceptions}
        columns={columns}
        loading={loading}
        searchable={false}
      />

      {/* New Exception Modal */}
      <Dialog open={showNewException} onOpenChange={setShowNewException}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Exception Request</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">BGV Case</label>
              <Select 
                value={newException.bgvCaseId}
                onValueChange={(value) => setNewException(prev => ({ ...prev, bgvCaseId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select BGV case" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bgv-001">BGV-001 - Priya Sharma</SelectItem>
                  <SelectItem value="bgv-002">BGV-002 - Rahul Kumar</SelectItem>
                  <SelectItem value="bgv-003">BGV-003 - Anita Patel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Exception Type</label>
              <Select 
                value={newException.type}
                onValueChange={(value) => setNewException(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WAIVER">Waiver</SelectItem>
                  <SelectItem value="PARTIAL_PASS">Partial Pass</SelectItem>
                  <SelectItem value="EXPEDITE">Expedite</SelectItem>
                  <SelectItem value="REVERIFICATION">Re-verification</SelectItem>
                  <SelectItem value="VENDOR_SWITCH">Vendor Switch</SelectItem>
                  <SelectItem value="MISSING_DOCS">Missing Documents</SelectItem>
                  <SelectItem value="NAME_DOB_MISMATCH">Name/DOB Mismatch</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Approver Role</label>
              <Select 
                value={newException.approverRole}
                onValueChange={(value) => setNewException(prev => ({ ...prev, approverRole: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR_MANAGER">HR Manager</SelectItem>
                  <SelectItem value="STAFFING_MANAGER">Staffing Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Textarea
                placeholder="Explain the reason for this exception..."
                value={newException.reason}
                onChange={(e) => setNewException(prev => ({ ...prev, reason: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Supporting Document (Optional)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setNewException(prev => ({ ...prev, attachment: e.target.files?.[0] || null }))}
                className="w-full p-2 border rounded-md"
              />
              <p className="text-xs text-muted-foreground">
                Upload client email, management approval, or other supporting documents
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewException(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateException}>
                Submit Exception
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exception Review Sheet */}
      {selectedException && (
        <Sheet open={!!selectedException} onOpenChange={() => setSelectedException(null)}>
          <SheetContent className="w-[600px] sm:max-w-[600px]">
            <SheetHeader>
              <SheetTitle>Review Exception Request</SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Exception Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Exception Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Case ID:</strong> {selectedException.bgvCaseId}</div>
                    <div><strong>Type:</strong> {selectedException.type.replace('_', ' ')}</div>
                    <div><strong>Requested By:</strong> {selectedException.requestedBy}</div>
                    <div><strong>Submitted:</strong> {new Date(selectedException.updatedAt).toLocaleDateString()}</div>
                  </div>
                  
                  <div>
                    <strong className="text-sm">Reason:</strong>
                    <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{selectedException.reason}</p>
                  </div>

                  {selectedException.attachmentUrl && (
                    <div>
                      <strong className="text-sm">Supporting Document:</strong>
                      <Button variant="outline" size="sm" className="ml-2">
                        <FileText className="mr-2 h-4 w-4" />
                        View Document
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Decision */}
              {selectedException.status === 'PENDING' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Decision</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Decision Note</label>
                      <Textarea
                        placeholder="Add your decision notes..."
                        value={decisionNote}
                        onChange={(e) => setDecisionNote(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleApproveException(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button 
                        onClick={() => handleApproveException(true)}
                        className="flex-1"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>

                    {selectedException.type === 'WAIVER' || selectedException.type === 'PARTIAL_PASS' ? (
                      <div className="p-3 bg-amber-50 rounded-lg text-amber-700 text-sm">
                        <AlertTriangle className="inline h-4 w-4 mr-2" />
                        Approving this exception will allow manual override to Green outcome
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              )}

              {/* Already Decided */}
              {selectedException.status !== 'PENDING' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Decision History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadge(selectedException.status).color}>
                          {selectedException.status}
                        </Badge>
                        <span className="text-sm">on {new Date(selectedException.updatedAt).toLocaleDateString()}</span>
                      </div>
                      {selectedException.decisionNote && (
                        <p className="text-sm p-3 bg-muted rounded-lg">{selectedException.decisionNote}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}