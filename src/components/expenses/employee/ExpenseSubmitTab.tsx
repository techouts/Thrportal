import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/components/shared/DataTable'
import { Plus, Upload, Save, Send, AlertTriangle, CheckCircle, Receipt, Trash2, Edit } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { expensesService } from '@/services/expensesService'
import { ExpenseClaim, ExpenseLine, PolicyCategory, ValidationError } from '@/types/expenses'

export function ExpenseSubmitTab() {
  const [currentClaim, setCurrentClaim] = useState<ExpenseClaim | null>(null)
  const [categories, setCategories] = useState<PolicyCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [showLineForm, setShowLineForm] = useState(false)
  const [editingLine, setEditingLine] = useState<ExpenseLine | null>(null)
  const { toast } = useToast()

  const [lineForm, setLineForm] = useState({
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    vendorName: '',
    description: '',
    city: '',
    country: 'India',
    amount: 0,
    currency: 'INR',
    paymentMode: 'CASH' as const,
    corpCard: false,
    perDiem: false,
    mileageKm: 0,
    gstinVendor: '',
    invoiceNo: '',
    invoiceDate: '',
    taxableValue: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    receiptIds: [] as string[]
  })

  useEffect(() => {
    loadCategories()
    createNewClaim()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await expensesService.getPolicyCategories()
      setCategories(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load expense categories",
        variant: "destructive"
      })
    }
  }

  const createNewClaim = async () => {
    try {
      setLoading(true)
      const claim = await expensesService.createExpenseClaim({
        employeeId: 'emp-001', // This would come from auth context
      })
      setCurrentClaim(claim)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create expense claim",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddLine = async () => {
    if (!currentClaim) return
    
    try {
      setLoading(true)
      const line = await expensesService.addExpenseLine(currentClaim.id, {
        ...lineForm,
        amountInINR: lineForm.currency === 'INR' ? lineForm.amount : lineForm.amount * 1 // Mock FX conversion
      })
      
      setCurrentClaim(prev => prev ? {
        ...prev,
        lines: [...prev.lines, line],
        totalInINR: prev.totalInINR + line.amountInINR
      } : null)
      
      // Reset form
      setLineForm({
        categoryId: '',
        date: new Date().toISOString().split('T')[0],
        vendorName: '',
        description: '',
        city: '',
        country: 'India',
        amount: 0,
        currency: 'INR',
        paymentMode: 'CASH',
        corpCard: false,
        perDiem: false,
        mileageKm: 0,
        gstinVendor: '',
        invoiceNo: '',
        invoiceDate: '',
        taxableValue: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        receiptIds: []
      })
      setShowLineForm(false)
      
      toast({
        title: "Line Added",
        description: "Expense line has been added successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense line",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      const receipt = await expensesService.uploadReceipt(file)
      
      // Auto-fill form fields from OCR if available
      if (receipt.parsedFields) {
        const fields = receipt.parsedFields
        setLineForm(prev => ({
          ...prev,
          vendorName: fields.vendor || prev.vendorName,
          amount: parseFloat(fields.amount) || prev.amount,
          date: fields.date || prev.date,
          gstinVendor: fields.gstNo || prev.gstinVendor,
          invoiceNo: fields.invoiceNo || prev.invoiceNo,
          receiptIds: [...prev.receiptIds, receipt.id]
        }))
      }
      
      toast({
        title: "Receipt Uploaded",
        description: `OCR extracted data with ${Math.round((receipt.ocrConfidence || 0) * 100)}% confidence`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload receipt",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitClaim = async () => {
    if (!currentClaim || currentClaim.lines.length === 0) {
      toast({
        title: "Cannot Submit",
        description: "Please add at least one expense line",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      const result = await expensesService.submitExpenseClaim(currentClaim.id)
      
      if (result.success) {
        toast({
          title: "Claim Submitted",
          description: "Your expense claim has been submitted for approval"
        })
        // Create new claim for next submission
        createNewClaim()
      } else {
        toast({
          title: "Validation Errors",
          description: "Please fix the highlighted issues before submitting",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit expense claim",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (errors?: ValidationError[]) => {
    if (!errors || errors.length === 0) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Valid</Badge>
    }
    
    const hasHardErrors = errors.some(e => e.type === 'HARD')
    if (hasHardErrors) {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Blocked</Badge>
    }
    
    return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>
  }

  const lineColumns = [
    {
      id: 'category',
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
      id: 'status',
      header: 'Status',
      accessor: 'validationErrors' as keyof ExpenseLine,
      cell: (item: ExpenseLine) => getStatusBadge(item.validationErrors)
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
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof ExpenseLine,
      cell: (item: ExpenseLine) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditingLine(item)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  if (loading && !currentClaim) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Claim Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>New Expense Claim</CardTitle>
              <p className="text-sm text-muted-foreground">
                Claim ID: {currentClaim?.id} • Total: ₹{currentClaim?.totalInINR.toLocaleString() || 0}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowLineForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Line
              </Button>
              <Button 
                onClick={handleSubmitClaim}
                disabled={loading || !currentClaim?.lines.length}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Claim
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Expense Lines Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Lines</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={currentClaim?.lines || []}
            columns={lineColumns}
            loading={loading}
            emptyMessage="No expense lines added. Click 'Add Line' to get started."
          />
        </CardContent>
      </Card>

      {/* Add/Edit Line Dialog */}
      <Dialog open={showLineForm || !!editingLine} onOpenChange={(open) => {
        if (!open) {
          setShowLineForm(false)
          setEditingLine(null)
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLine ? 'Edit' : 'Add'} Expense Line</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Basic Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={lineForm.categoryId} onValueChange={(value) => setLineForm(prev => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={lineForm.date}
                  onChange={(e) => setLineForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Vendor Name *</Label>
                <Input
                  value={lineForm.vendorName}
                  onChange={(e) => setLineForm(prev => ({ ...prev, vendorName: e.target.value }))}
                  placeholder="Enter vendor name"
                />
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={lineForm.description}
                  onChange={(e) => setLineForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter expense description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={lineForm.city}
                    onChange={(e) => setLineForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={lineForm.country}
                    onChange={(e) => setLineForm(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>

            {/* Amount & Payment */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    value={lineForm.amount}
                    onChange={(e) => setLineForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={lineForm.currency} onValueChange={(value) => setLineForm(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select value={lineForm.paymentMode} onValueChange={(value: any) => setLineForm(prev => ({ ...prev, paymentMode: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Personal Card</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="NET_BANKING">Net Banking</SelectItem>
                    <SelectItem value="CORP_CARD">Corporate Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={lineForm.corpCard}
                  onCheckedChange={(checked) => setLineForm(prev => ({ ...prev, corpCard: checked }))}
                />
                <Label>Corporate Card Payment</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={lineForm.perDiem}
                  onCheckedChange={(checked) => setLineForm(prev => ({ ...prev, perDiem: checked }))}
                />
                <Label>Per-diem Expense</Label>
              </div>

              <div className="space-y-2">
                <Label>Mileage (km)</Label>
                <Input
                  type="number"
                  value={lineForm.mileageKm}
                  onChange={(e) => setLineForm(prev => ({ ...prev, mileageKm: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Receipt Upload</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleReceiptUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Upload receipt (PDF, JPG, PNG). OCR will auto-extract details.
                </p>
              </div>
            </div>
          </div>

          {/* GST Details */}
          <div className="space-y-4">
            <Separator />
            <h4 className="font-medium">GST Details (India)</h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Vendor GSTIN</Label>
                <Input
                  value={lineForm.gstinVendor}
                  onChange={(e) => setLineForm(prev => ({ ...prev, gstinVendor: e.target.value }))}
                  placeholder="29ABCDE1234F1Z5"
                />
              </div>
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input
                  value={lineForm.invoiceNo}
                  onChange={(e) => setLineForm(prev => ({ ...prev, invoiceNo: e.target.value }))}
                  placeholder="INV-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Invoice Date</Label>
                <Input
                  type="date"
                  value={lineForm.invoiceDate}
                  onChange={(e) => setLineForm(prev => ({ ...prev, invoiceDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Taxable Value</Label>
                <Input
                  type="number"
                  value={lineForm.taxableValue}
                  onChange={(e) => setLineForm(prev => ({ ...prev, taxableValue: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>CGST</Label>
                <Input
                  type="number"
                  value={lineForm.cgst}
                  onChange={(e) => setLineForm(prev => ({ ...prev, cgst: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>SGST</Label>
                <Input
                  type="number"
                  value={lineForm.sgst}
                  onChange={(e) => setLineForm(prev => ({ ...prev, sgst: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>IGST</Label>
                <Input
                  type="number"
                  value={lineForm.igst}
                  onChange={(e) => setLineForm(prev => ({ ...prev, igst: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowLineForm(false)
              setEditingLine(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddLine} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {editingLine ? 'Update' : 'Add'} Line
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}