import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/DataTable'
import { Eye, Download, Filter, Calendar, Receipt } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { expensesService } from '@/services/expensesService'
import { ExpenseClaim, ExpenseLine } from '@/types/expenses'

export function ExpenseHistoryTab() {
  const [claims, setClaims] = useState<ExpenseClaim[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null)
  const [filters, setFilters] = useState({
    status: 'ALL',
    dateFrom: '',
    dateTo: '',
    category: '',
    reimbursable: 'ALL'
  })
  const { toast } = useToast()

  useEffect(() => {
    loadClaims()
  }, [])

  const loadClaims = async () => {
    try {
      setLoading(true)
      const data = await expensesService.getEmployeeClaims('emp-001') // From auth context
      setClaims(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load expense history",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: ExpenseClaim['status']) => {
    const variants = {
      'DRAFT': { variant: 'secondary' as const, label: 'Draft' },
      'SUBMITTED': { variant: 'default' as const, label: 'Submitted' },
      'RETURNED': { variant: 'destructive' as const, label: 'Returned' },
      'APPROVED': { variant: 'default' as const, label: 'Approved' },
      'PAID': { variant: 'default' as const, label: 'Paid' },
      'REJECTED': { variant: 'destructive' as const, label: 'Rejected' }
    }

    console.log('Status received:', status); // Debug log
    const config = variants[status] || { variant: 'secondary' as const, label: 'Unknown' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const exportClaim = async (claimId: string) => {
    try {
      // Mock export functionality
      toast({
        title: "Export Started",
        description: "Your expense claim is being exported..."
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export expense claim",
        variant: "destructive"
      })
    }
  }

  const claimColumns = [
    {
      id: 'id',
      header: 'Claim ID',
      accessor: 'id' as keyof ExpenseClaim,
      cell: (item: ExpenseClaim) => {
        console.log('ExpenseClaim item:', item); // Debug log
        return (
          <div className="font-mono text-sm">{item.id?.slice(-8) || 'N/A'}</div>
        )
      }
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessor: 'createdAt' as keyof ExpenseClaim,
      cell: (item: ExpenseClaim) => new Date(item.createdAt).toLocaleDateString()
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status' as keyof ExpenseClaim,
      cell: (item: ExpenseClaim) => getStatusBadge(item.status)
    },
    {
      id: 'totalInINR',
      header: 'Total Amount',
      accessor: 'totalInINR' as keyof ExpenseClaim,
      cell: (item: ExpenseClaim) => (
        <div className="text-right font-medium">
          ₹{item.totalInINR.toLocaleString()}
        </div>
      )
    },
    {
      id: 'lines',
      header: 'Lines',
      accessor: 'lines' as keyof ExpenseClaim,
      cell: (item: ExpenseClaim) => (
        <div className="text-center">{item.lines?.length || 0}</div>
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
      id: 'approvedAt',
      header: 'Approved',
      accessor: 'approvedAt' as keyof ExpenseClaim,
      cell: (item: ExpenseClaim) => (
        <div>
          {item.approvedAt ? new Date(item.approvedAt).toLocaleDateString() : '-'}
        </div>
      )
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
            variant="ghost"
            size="sm"
            onClick={() => exportClaim(item.id)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const lineColumns = [
    {
      id: 'categoryName',
      header: 'Category',
      accessor: 'categoryName' as keyof ExpenseLine
    },
    {
      id: 'date',
      header: 'Date',
      accessor: 'date' as keyof ExpenseLine,
      cell: (item: ExpenseLine) => new Date(item.date).toLocaleDateString()
    },
    {
      id: 'vendorName',
      header: 'Vendor',
      accessor: 'vendorName' as keyof ExpenseLine
    },
    {
      id: 'description',
      header: 'Description',
      accessor: 'description' as keyof ExpenseLine
    },
    {
      id: 'amountInINR',
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
      id: 'receiptIds',
      header: 'Receipts',
      accessor: 'receiptIds' as keyof ExpenseLine,
      cell: (item: ExpenseLine) => (
        <div className="flex items-center gap-1">
          <Receipt className="h-4 w-4" />
          <span>{item.receiptIds?.length || 0}</span>
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="RETURNED">Returned</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Type</Label>
              <Select value={filters.reimbursable} onValueChange={(value) => setFilters(prev => ({ ...prev, reimbursable: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All types</SelectItem>
                  <SelectItem value="reimbursable">Reimbursable</SelectItem>
                  <SelectItem value="corporate">Corporate Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Expense Claims History</CardTitle>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={claims}
            columns={claimColumns}
            loading={loading}
            emptyMessage="No expense claims found."
          />
        </CardContent>
      </Card>

      {/* Claim Detail Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Expense Claim Details - {selectedClaim?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-6">
              {/* Claim Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedClaim.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Amount</Label>
                  <div className="mt-1 font-medium">₹{selectedClaim.totalInINR.toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <div className="mt-1">{new Date(selectedClaim.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Lines</Label>
                  <div className="mt-1">{selectedClaim.lines?.length || 0}</div>
                </div>
              </div>

              {/* Approver Comments */}
              {selectedClaim.approverComments && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Approver Comments</Label>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {selectedClaim.approverComments}
                  </div>
                </div>
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

              {/* Timeline */}
              <div>
                <h4 className="font-medium mb-4">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="text-sm">
                      <span className="font-medium">Created</span>
                      <span className="text-muted-foreground ml-2">
                        {new Date(selectedClaim.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {selectedClaim.submittedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="text-sm">
                        <span className="font-medium">Submitted</span>
                        <span className="text-muted-foreground ml-2">
                          {new Date(selectedClaim.submittedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {selectedClaim.approvedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="text-sm">
                        <span className="font-medium">Approved</span>
                        <span className="text-muted-foreground ml-2">
                          {new Date(selectedClaim.approvedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {selectedClaim.paidAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div className="text-sm">
                        <span className="font-medium">Paid</span>
                        <span className="text-muted-foreground ml-2">
                          {new Date(selectedClaim.paidAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}