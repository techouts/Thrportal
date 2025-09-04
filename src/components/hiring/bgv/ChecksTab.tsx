import { useState, useEffect } from 'react'
import { Plus, Upload, Filter, Download, FileText, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/shared/DataTable'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { NewBgvModal } from './NewBgvModal'
import { BatchImportModal } from './BatchImportModal'
import { CaseDetailDrawer } from './CaseDetailDrawer'
import { BgvService } from '@/services/bgvService'
import { BgvCase, BgvFilters } from '@/types/bgv'
import { useToast } from '@/hooks/use-toast'

export function ChecksTab() {
  const [cases, setCases] = useState<BgvCase[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<BgvFilters>({})
  const [selectedCase, setSelectedCase] = useState<BgvCase | null>(null)
  const [showNewBgv, setShowNewBgv] = useState(false)
  const [showBatchImport, setShowBatchImport] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadCases()
  }, [filters])

  const loadCases = async () => {
    try {
      setLoading(true)
      const data = await BgvService.getBgvCases(filters)
      setCases(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load BGV cases",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: BgvCase['status']) => {
    const variants = {
      'PENDING': { color: 'bg-gray-100 text-gray-700', icon: Clock },
      'IN_PROGRESS': { color: 'bg-blue-100 text-blue-700', icon: Clock },
      'AWAITING_DOCS': { color: 'bg-yellow-100 text-yellow-700', icon: FileText },
      'ON_HOLD': { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
      'REVIEW': { color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
      'COMPLETED': { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      'CANCELLED': { color: 'bg-red-100 text-red-700', icon: AlertTriangle }
    }
    return variants[status] || { color: 'bg-gray-100 text-gray-700', icon: Clock }
  }

  const getOutcomeBadge = (outcome?: BgvCase['overallOutcome']) => {
    if (!outcome) return null
    const variants = {
      'GREEN': { color: 'bg-green-100 text-green-700', label: 'Clear' },
      'AMBER': { color: 'bg-amber-100 text-amber-700', label: 'Discrepancy' },
      'RED': { color: 'bg-red-100 text-red-700', label: 'Adverse' },
      'INCONCLUSIVE': { color: 'bg-gray-100 text-gray-700', label: 'Inconclusive' }
    }
    return variants[outcome]
  }

  const getSlaStatus = (slaDueAt?: string) => {
    if (!slaDueAt) return { days: 0, status: 'none', color: 'text-gray-500' }
    
    const due = new Date(slaDueAt)
    const now = new Date()
    const diffMs = due.getTime() - now.getTime()
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (days < 0) return { days: Math.abs(days), status: 'overdue', color: 'text-red-600' }
    if (days <= 1) return { days, status: 'critical', color: 'text-orange-600' }
    if (days <= 3) return { days, status: 'warning', color: 'text-yellow-600' }
    return { days, status: 'ok', color: 'text-green-600' }
  }

  const handleExport = async () => {
    toast({
      title: "Export Started",
      description: "BGV cases are being exported to CSV"
    })
  }

  const handleNewBgv = (bgvData: Partial<BgvCase>) => {
    loadCases()
    setShowNewBgv(false)
    toast({
      title: "BGV Case Created",
      description: `New BGV case created for ${bgvData.candidateName}`
    })
  }

  const columns = [
    {
      id: 'candidate',
      header: 'Candidate',
      accessor: 'candidateName' as keyof BgvCase,
      cell: (item: BgvCase) => (
        <div className="text-sm">
          <div className="font-medium">{item.candidateName}</div>
          <div className="text-muted-foreground">{item.candidateId}</div>
        </div>
      )
    },
    {
      id: 'jd',
      header: 'JD',
      accessor: 'jdId' as keyof BgvCase,
      cell: (item: BgvCase) => (
        <div className="text-sm">
          <div className="font-medium">{item.jdId}</div>
          <div className="text-muted-foreground">{item.client}</div>
        </div>
      )
    },
    {
      id: 'project',
      header: 'Project',
      accessor: 'project' as keyof BgvCase,
      cell: (item: BgvCase) => (
        <div className="text-sm font-medium">{item.project}</div>
      )
    },
    {
      id: 'package',
      header: 'Package',
      accessor: 'packageCode' as keyof BgvCase,
      cell: (item: BgvCase) => (
        <Badge variant="outline" className="text-xs">
          {item.packageCode}
        </Badge>
      )
    },
    {
      id: 'vendors',
      header: 'Vendor(s)',
      accessor: 'vendorIds' as keyof BgvCase,
      cell: (item: BgvCase) => (
        <div className="text-sm">
          {item.vendorIds.map(vendorId => (
            <Badge key={vendorId} variant="secondary" className="text-xs mr-1">
              {vendorId}
            </Badge>
          ))}
        </div>
      )
    },
    {
      id: 'created',
      header: 'Created On',
      accessor: 'createdAt' as keyof BgvCase,
      cell: (item: BgvCase) => (
        <div className="text-sm">
          {new Date(item.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      id: 'sla',
      header: 'SLA Due',
      accessor: 'slaDueAt' as keyof BgvCase,
      cell: (item: BgvCase) => {
        const sla = getSlaStatus(item.slaDueAt)
        return (
          <div className={`text-sm font-medium ${sla.color}`}>
            {sla.status === 'overdue' ? `${sla.days}d overdue` :
             sla.status === 'none' ? 'No SLA' :
             `${sla.days}d left`}
          </div>
        )
      }
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status' as keyof BgvCase,
      cell: (item: BgvCase) => {
        const statusBadge = getStatusBadge(item.status)
        const outcomeBadge = getOutcomeBadge(item.overallOutcome)
        return (
          <div className="space-y-1">
            <Badge className={`text-xs ${statusBadge.color}`}>
              {item.status.replace('_', ' ')}
            </Badge>
            {outcomeBadge && (
              <Badge className={`text-xs ${outcomeBadge.color}`}>
                {outcomeBadge.label}
              </Badge>
            )}
          </div>
        )
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof BgvCase,
      cell: (item: BgvCase) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedCase(item)}
          >
            View
          </Button>
          <Button variant="ghost" size="sm">
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const stats = {
    total: cases.length,
    pending: cases.filter(c => c.status === 'PENDING').length,
    inProgress: cases.filter(c => c.status === 'IN_PROGRESS').length,
    completed: cases.filter(c => c.status === 'COMPLETED').length,
    slaBreaches: cases.filter(c => getSlaStatus(c.slaDueAt).status === 'overdue').length
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">BGV Checks</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => setShowBatchImport(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Batch Import
          </Button>
          <Button onClick={() => setShowNewBgv(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New BGV
          </Button>
        </div>
      </div>

      {/* Status Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-gray-100 text-gray-700">Pending</Badge>
              <Badge className="bg-blue-100 text-blue-700">In-Progress</Badge>
              <Badge className="bg-yellow-100 text-yellow-700">Awaiting Docs</Badge>
              <Badge className="bg-orange-100 text-orange-700">On-Hold</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700">Clear (Green)</Badge>
              <Badge className="bg-amber-100 text-amber-700">Discrepancy (Amber)</Badge>
              <Badge className="bg-red-100 text-red-700">Adverse (Red)</Badge>
              <Badge className="bg-gray-100 text-gray-700">Inconclusive</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Cases</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.slaBreaches}</div>
            <p className="text-sm text-muted-foreground">SLA Breaches</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, client: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TechCorp">TechCorp</SelectItem>
                  <SelectItem value="FinanceMax">FinanceMax</SelectItem>
                  <SelectItem value="RetailPlus">RetailPlus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="AWAITING_DOCS">Awaiting Docs</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Candidate</label>
              <Input 
                placeholder="Search candidate..."
                onChange={(e) => setFilters(prev => ({ ...prev, candidate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">JD</label>
              <Input 
                placeholder="Search JD..."
                onChange={(e) => setFilters(prev => ({ ...prev, jdId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, vendor: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendor-001">Vendor 001</SelectItem>
                  <SelectItem value="vendor-002">Vendor 002</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        data={cases}
        columns={columns}
        loading={loading}
        searchable={false}
      />

      {/* Modals */}
      <NewBgvModal 
        open={showNewBgv}
        onOpenChange={setShowNewBgv}
        onSubmit={handleNewBgv}
      />

      <BatchImportModal
        open={showBatchImport}
        onOpenChange={setShowBatchImport}
        onImport={loadCases}
      />

      {/* Case Detail Drawer */}
      {selectedCase && (
        <CaseDetailDrawer
          case={selectedCase}
          open={!!selectedCase}
          onOpenChange={() => setSelectedCase(null)}
          onUpdate={loadCases}
        />
      )}
    </div>
  )
}