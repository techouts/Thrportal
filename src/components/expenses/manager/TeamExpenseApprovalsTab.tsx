import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { DataTable } from '@/components/shared/DataTable'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle, XCircle, ArrowLeft, Eye, Clock, AlertTriangle, Receipt } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { expensesService } from '@/services/expensesService'
import { ExpenseClaim, ExpenseLine } from '@/types/expenses'

export function TeamExpenseApprovalsTab() {
  const [claims, setClaims] = useState<ExpenseClaim[]>([])
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [comment, setComment] = useState('')
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedClaims, setSelectedClaims] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadPendingClaims()
  }, [])

  const loadPendingClaims = async () => {
    try {
      setLoading(true)
      const data = await expensesService.getTeamExpenses('manager-001') // From auth context
      setClaims(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pending expense claims",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (claimId: string, comment?: string) => {
    try {
      setActionLoading(true)
      await expensesService.approveExpense(claimId, comment)
      
      toast({
        title: "Claim Approved",
        description: "The expense claim has been approved successfully"
      })
      
      // Remove from pending list
      setClaims(prev => prev.filter(claim => claim.id !== claimId))
      setSelectedClaim(null)
      setComment('')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve expense claim",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReturn = async (claimId: string, comment: string) => {
    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please provide a comment when returning a claim",
        variant: "destructive"
      })
      return
    }

    try {
      setActionLoading(true)
      await expensesService.returnExpense(claimId, comment)
      
      toast({
        title: "Claim Returned",
        description: "The expense claim has been returned to the employee"
      })
      
      // Remove from pending list
      setClaims(prev => prev.filter(claim => claim.id !== claimId))
      setSelectedClaim(null)
      setComment('')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to return expense claim",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (claimId: string, comment: string) => {
    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please provide a comment when rejecting a claim",
        variant: "destructive"
      })
      return
    }

    try {
      setActionLoading(true)
      await expensesService.rejectExpense(claimId, comment)
      
      toast({
        title: "Claim Rejected",
        description: "The expense claim has been rejected"
      })
      
      // Remove from pending list
      setClaims(prev => prev.filter(claim => claim.id !== claimId))
      setSelectedClaim(null)
      setComment('')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject expense claim",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: ExpenseClaim['status']) => {
    const variants = {
      'SUBMITTED': { variant: 'default' as const, label: 'Pending Review', icon: Clock },
      'RETURNED': { variant: 'destructive' as const, label: 'Returned', icon: ArrowLeft }
    }

    const config = variants[status as keyof typeof variants]
    if (!config) return null

    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getUrgencyBadge = (claim: ExpenseClaim) => {
    const daysSinceSubmission = claim.submittedAt 
      ? Math.floor((new Date().getTime() - new Date(claim.submittedAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    if (daysSinceSubmission > 7) {
      return <Badge variant="destructive">Overdue</Badge>
    } else if (daysSinceSubmission > 3) {
      return <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>
    } else if (claim.hasExceptions) {
      return <Badge className="bg-orange-100 text-orange-800">Exceptions</Badge>
    }
    return null
  }

  const claimColumns = [
    {
      id: 'select',
      header: '',
      accessor: 'id' as keyof ExpenseClaim,
      cell: (item: ExpenseClaim) => (
        <input
          type="checkbox"
          checked={selectedClaims.includes(item.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedClaims(prev => [...prev, item.id])
            } else {
              setSelectedClaims(prev => prev.filter(id => id !== item.id))
            }
          }}
        />
      )
    },
    {
      id: 'employee',
      header: 'Employee',
      accessor: 'employeeName' as keyof ExpenseClaim
    },
    {
      id: 'claimId',
      header: 'Claim ID',
      accessor: 'id' as keyof ExpenseClaim,
      cell: (item: ExpenseClaim) => (
        <div className="font-mono text-sm">{item.id.slice(-8)}</div>
      )
    },
    {
      id: 'submittedAt',
      header: 'Submitted',
      accessor: 'submittedAt' as keyof ExpenseClaim,
      cell: (item: ExpenseClaim) => (
        <div>
          {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : '-'}
        </div>
      )
    },
    {
      id: 'totalInINR',
      header: 'Amount',
      accessor: 'totalInINR' as keyof ExpenseClaim,
      cell: (item: ExpenseClaim) => (
        <div className="text-right font-medium">
          ₹{item.totalInINR.toLocaleString()}
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status' as keyof ExpenseClaim,
      cell: (item: ExpenseClaim) => getStatusBadge(item.status)
    },
    {
      id: 'urgency',
      header: 'Priority',
      accessor: 'hasExceptions' as keyof ExpenseClaim,
      cell: (item: ExpenseClaim) => getUrgencyBadge(item)
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof ExpenseClaim,
      cell: (item: ExpenseClaim) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedClaim(item)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleApprove(item.id)}
            disabled={actionLoading}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const lineColumns = [
    {
      id: 'date',
      header: 'Date',
      accessor: 'date' as keyof ExpenseLine,
      cell: (item: ExpenseLine) => new Date(item.date).toLocaleDateString()
    },
    {
      id: 'category',
      header: 'Category',
      accessor: 'categoryName' as keyof ExpenseLine
    },
    {
      id: 'vendor',
      header: 'Vendor',
      accessor: 'vendorName' as keyof ExpenseLine
    },
    {
      id: 'description',
      header: 'Description',
      accessor: 'description' as keyof ExpenseLine
    },
    {
      id: 'amount',
      header: 'Amount',
      accessor: 'amountInINR' as keyof ExpenseLine,
      cell: (item: ExpenseLine) => (
        <div className="text-right">
          ₹{item.amountInINR.toLocaleString()}
          {item.currency !== 'INR' && (
            <div className="text-xs text-muted-foreground">
              {item.currency} {item.amount}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'receipts',
      header: 'Receipts',
      accessor: 'receiptIds' as keyof ExpenseLine,
      cell: (item: ExpenseLine) => (
        <div className="flex items-center gap-1">
          <Receipt className="h-4 w-4" />
          <span>{item.receiptIds?.length || 0}</span>
        </div>
      )
    },
    {
      id: 'flags',
      header: 'Flags',
      accessor: 'flags' as keyof ExpenseLine,
      cell: (item: ExpenseLine) => (
        <div className="flex flex-wrap gap-1">
          {item.flags?.map(flag => (
            <Badge key={flag} variant="outline" className="text-xs">
              {flag}
            </Badge>
          ))}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      {selectedClaims.length > 0 && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                {selectedClaims.length} claim(s) selected
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    selectedClaims.forEach(claimId => handleApprove(claimId))
                    setSelectedClaims([])
                  }}
                  disabled={actionLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Bulk Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedClaims([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals ({claims.length})</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review and approve expense claims from your team members
          </p>
        </CardHeader>
        <CardContent>
          <DataTable
            data={claims}
            columns={claimColumns}
            loading={loading}
            emptyMessage="No pending expense claims found."
          />
        </CardContent>
      </Card>

      {/* Claim Detail Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Review Expense Claim - {selectedClaim?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-6">
              {/* Claim Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm font-medium">Employee</div>
                  <div className="mt-1">{selectedClaim.employeeName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Total Amount</div>
                  <div className="mt-1 font-medium">₹{selectedClaim.totalInINR.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Submitted</div>
                  <div className="mt-1">
                    {selectedClaim.submittedAt ? new Date(selectedClaim.submittedAt).toLocaleDateString() : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <div className="mt-1">{getStatusBadge(selectedClaim.status)}</div>
                </div>
              </div>

              {/* Policy Violations */}
              {selectedClaim.hasExceptions && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-800">
                      <AlertTriangle className="h-5 w-5" />
                      Policy Exceptions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-orange-700">
                      <div>• Receipt missing for expenses over ₹200</div>
                      <div>• Late submission (&gt;30 days from transaction date)</div>
                      <div>• Amount exceeds per-diem limit</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Expense Lines */}
              <div>
                <h4 className="font-medium mb-4">Expense Lines</h4>
                <DataTable
                  data={selectedClaim.lines || []}
                  columns={lineColumns}
                  loading={false}
                  emptyMessage="No expense lines in this claim."
                />
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Comments (required for return/reject)</label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add your comments here..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleApprove(selectedClaim.id, comment)}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleReturn(selectedClaim.id, comment)}
                    disabled={actionLoading || !comment.trim()}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Return for Changes
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedClaim.id, comment)}
                    disabled={actionLoading || !comment.trim()}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}