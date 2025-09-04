import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { useToast } from '@/hooks/use-toast'

interface BatchImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: () => void
}

interface ImportRow {
  candidateId: string
  candidateName: string
  jdId: string
  client: string
  project: string
  recruiterId: string
  packageCode: string
  vendorList: string
  notes: string
  status: 'valid' | 'error'
  errors: string[]
}

export function BatchImportModal({ open, onOpenChange, onImport }: BatchImportModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'processing'>('upload')
  const [importData, setImportData] = useState<ImportRow[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const downloadTemplate = () => {
    const templateData = [
      'candidateId,candidateName,jdId,client,project,recruiterId,packageCode,vendorList,notes',
      'CAND-001,John Doe,JD-2024-001,TechCorp,Digital Banking,rec-001,IND_STANDARD,"vendor-001,vendor-002",New hire BGV',
      'CAND-002,Jane Smith,JD-2024-002,FinanceMax,Investment Platform,rec-002,IND_EXTENDED,vendor-001,Senior role BGV'
    ].join('\n')

    const blob = new Blob([templateData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'bgv-import-template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const csv = e.target?.result as string
      const lines = csv.split('\n')
      const headers = lines[0].split(',')
      
      const data: ImportRow[] = lines.slice(1).filter(line => line.trim()).map((line, index) => {
        const values = line.split(',')
        const row: ImportRow = {
          candidateId: values[0]?.trim() || '',
          candidateName: values[1]?.trim() || '',
          jdId: values[2]?.trim() || '',
          client: values[3]?.trim() || '',
          project: values[4]?.trim() || '',
          recruiterId: values[5]?.trim() || '',
          packageCode: values[6]?.trim() || 'IND_STANDARD',
          vendorList: values[7]?.trim() || '',
          notes: values[8]?.trim() || '',
          status: 'valid',
          errors: []
        }

        // Validation
        if (!row.candidateName) row.errors.push('Candidate name is required')
        if (!row.jdId) row.errors.push('JD ID is required')
        if (!row.client) row.errors.push('Client is required')
        if (!['IND_BASIC', 'IND_STANDARD', 'IND_EXTENDED'].includes(row.packageCode)) {
          row.errors.push('Invalid package code')
        }

        row.status = row.errors.length > 0 ? 'error' : 'valid'
        return row
      })

      setImportData(data)
      setStep('preview')
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    const validRows = importData.filter(row => row.status === 'valid')
    if (validRows.length === 0) {
      toast({
        title: "No Valid Rows",
        description: "Please fix all errors before importing",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setStep('processing')

    // Simulate batch creation
    await new Promise(resolve => setTimeout(resolve, 2000))

    onImport()
    toast({
      title: "Import Successful",
      description: `${validRows.length} BGV cases created successfully`
    })
    
    // Reset and close
    setImportData([])
    setStep('upload')
    onOpenChange(false)
    setLoading(false)
  }

  const columns = [
    {
      id: 'status',
      header: 'Status',
      accessor: 'status' as keyof ImportRow,
      cell: (item: ImportRow) => (
        <div className="flex items-center gap-2">
          {item.status === 'valid' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <span className={item.status === 'valid' ? 'text-green-600' : 'text-red-600'}>
            {item.status === 'valid' ? 'Valid' : 'Error'}
          </span>
        </div>
      )
    },
    {
      id: 'candidateName',
      header: 'Candidate',
      accessor: 'candidateName' as keyof ImportRow,
      cell: (item: ImportRow) => (
        <div className="text-sm">
          <div className="font-medium">{item.candidateName}</div>
          <div className="text-muted-foreground">{item.candidateId}</div>
        </div>
      )
    },
    {
      id: 'jdId',
      header: 'JD',
      accessor: 'jdId' as keyof ImportRow
    },
    {
      id: 'client',
      header: 'Client',
      accessor: 'client' as keyof ImportRow
    },
    {
      id: 'packageCode',
      header: 'Package',
      accessor: 'packageCode' as keyof ImportRow
    },
    {
      id: 'errors',
      header: 'Errors',
      accessor: 'errors' as keyof ImportRow,
      cell: (item: ImportRow) => (
        <div className="text-sm">
          {item.errors.length > 0 ? (
            <ul className="text-red-600">
              {item.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          ) : (
            <span className="text-green-600">No errors</span>
          )}
        </div>
      )
    }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Import BGV Cases</DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Download Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV Template
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Download the template, fill in your data, and upload it back
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 2: Upload Your CSV</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="csvFile" className="cursor-pointer">
                      <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        Upload CSV file
                      </span>
                      <input
                        id="csvFile"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      CSV files only, max 5MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>CSV Format:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>candidateId, candidateName, jdId, client, project, recruiterId, packageCode, vendorList, notes</li>
                <li>packageCode: IND_BASIC, IND_STANDARD, or IND_EXTENDED</li>
                <li>vendorList: comma-separated vendor IDs in quotes</li>
                <li>All rows will use the same SLA profile (default)</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Preview Import Data</h3>
                <p className="text-sm text-muted-foreground">
                  {importData.filter(row => row.status === 'valid').length} valid rows, {' '}
                  {importData.filter(row => row.status === 'error').length} errors
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('upload')}>
                  Back to Upload
                </Button>
                <Button 
                  onClick={handleImport}
                  disabled={importData.filter(row => row.status === 'valid').length === 0}
                >
                  Import Valid Rows
                </Button>
              </div>
            </div>

            <DataTable
              data={importData}
              columns={columns}
              loading={false}
              searchable={false}
            />
          </div>
        )}

        {step === 'processing' && (
          <div className="space-y-6 text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div>
              <h3 className="text-lg font-medium">Processing Import</h3>
              <p className="text-sm text-muted-foreground">
                Creating BGV cases and generating consent forms...
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}