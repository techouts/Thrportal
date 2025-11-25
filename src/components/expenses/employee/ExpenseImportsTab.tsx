import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/DataTable'
import { Upload, Download, FileText, CreditCard, Car } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { expensesService } from '@/services/expensesService'
import { CardTransaction, ImportMapping } from '@/types/expenses'

export function ExpenseImportsTab() {
  const [transactions, setTransactions] = useState<CardTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importType, setImportType] = useState<'CREDIT_CARD' | 'UBER' | 'SWIGGY' | 'ZOMATO'>('CREDIT_CARD')
  const { toast } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      
      const mockMapping: ImportMapping = {
        id: 'mapping-001',
        userId: 'user-001',
        provider: importType,
        fieldMappings: {
          'date': 'Transaction Date',
          'amount': 'Amount',
          'merchant': 'Merchant',
          'description': 'Description'
        },
        isDefault: true
      }

      const importedTransactions = await expensesService.importCreditCardStatement(file, mockMapping)
      setTransactions(importedTransactions)
      
      toast({
        title: "Import Successful",
        description: `Imported ${importedTransactions.length} transactions`
      })
      setShowImportDialog(false)
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import transactions. Please check the file format.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = (type: string) => {
    const templates = {
      'CREDIT_CARD': 'Date,Amount,Merchant,Description,Category\n2024-01-15,250.00,UBER EATS,Food delivery,Meals\n2024-01-16,180.00,SWIGGY,Food order,Meals',
      'UBER': 'Trip Date,Amount,From,To,Trip Type\n2024-01-15,250.00,Home,Office,Business\n2024-01-16,180.00,Office,Airport,Business',
      'SWIGGY': 'Order Date,Amount,Restaurant,Items,Order Type\n2024-01-15,250.00,Pizza Hut,Pizza + Drinks,Delivery\n2024-01-16,180.00,McDonalds,Burger + Fries,Pickup',
      'ZOMATO': 'Date,Amount,Restaurant,Order Total,Delivery Charge\n2024-01-15,250.00,KFC,230.00,20.00\n2024-01-16,180.00,Dominos,160.00,20.00'
    }

    const content = templates[type as keyof typeof templates]
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type.toLowerCase()}_template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const transactionColumns = [
    {
      id: 'date',
      header: 'Date',
      accessor: 'txnDate' as keyof CardTransaction,
      cell: (item: CardTransaction) => new Date(item.txnDate).toLocaleDateString()
    },
    {
      id: 'merchant',
      header: 'Merchant',
      accessor: 'merchant' as keyof CardTransaction
    },
    {
      id: 'amount',
      header: 'Amount',
      accessor: 'amount' as keyof CardTransaction,
      cell: (item: CardTransaction) => (
        <div className="text-right">
          {item.currency} {item.amount.toFixed(2)}
        </div>
      )
    },
    {
      id: 'description',
      header: 'Description',
      accessor: 'rawDesc' as keyof CardTransaction
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'matchedLineId' as keyof CardTransaction,
      cell: (item: CardTransaction) => (
        <Badge variant={item.matchedLineId ? "default" : "secondary"}>
          {item.matchedLineId ? 'Matched' : 'Unmatched'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof CardTransaction,
      cell: (item: CardTransaction) => (
        <Button 
          variant="outline" 
          size="sm"
          disabled={!!item.matchedLineId}
        >
          Create Expense
        </Button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Import Options */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:bg-accent" onClick={() => { setImportType('CREDIT_CARD'); setShowImportDialog(true) }}>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <CreditCard className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-medium">Credit Card</h3>
            <p className="text-sm text-muted-foreground text-center">Import bank statements</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent" onClick={() => { setImportType('UBER'); setShowImportDialog(true) }}>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Car className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-medium">Uber</h3>
            <p className="text-sm text-muted-foreground text-center">Import trip data</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent" onClick={() => { setImportType('SWIGGY'); setShowImportDialog(true) }}>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <FileText className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-medium">Swiggy</h3>
            <p className="text-sm text-muted-foreground text-center">Import food orders</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent" onClick={() => { setImportType('ZOMATO'); setShowImportDialog(true) }}>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <FileText className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-medium">Zomato</h3>
            <p className="text-sm text-muted-foreground text-center">Import food orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Imported Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Imported Transactions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review and create expense lines from imported data
          </p>
        </CardHeader>
        <CardContent>
          <DataTable
            data={transactions}
            columns={transactionColumns}
            loading={loading}
            emptyMessage="No transactions imported. Use the import options above to get started."
          />
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import {importType.replace('_', ' ')} Data</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="template">Download Template</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>File Upload</Label>
                  <Input
                    type="file"
                    accept=".csv,.pdf,.eml"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-muted-foreground">
                    Supported formats: CSV, PDF, EML
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Field Mapping</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Date Column</Label>
                      <Select defaultValue="Transaction Date">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Transaction Date">Transaction Date</SelectItem>
                          <SelectItem value="Date">Date</SelectItem>
                          <SelectItem value="Trip Date">Trip Date</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Amount Column</Label>
                      <Select defaultValue="Amount">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Amount">Amount</SelectItem>
                          <SelectItem value="Total">Total</SelectItem>
                          <SelectItem value="Debit">Debit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Merchant Column</Label>
                      <Select defaultValue="Merchant">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Merchant">Merchant</SelectItem>
                          <SelectItem value="Description">Description</SelectItem>
                          <SelectItem value="Vendor">Vendor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Description Column</Label>
                      <Select defaultValue="Description">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Description">Description</SelectItem>
                          <SelectItem value="Narration">Narration</SelectItem>
                          <SelectItem value="Details">Details</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="template" className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Download the template file for {importType.replace('_', ' ')} imports
                </p>
                <Button onClick={() => downloadTemplate(importType)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}