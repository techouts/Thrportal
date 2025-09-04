import { useState } from 'react'
import { Plus, Edit, Save, ArrowRight, Clock, DollarSign, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { DataTable } from '@/components/shared/DataTable'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface ApprovalWorkflow {
  id: string
  name: string
  client?: string
  roleLevel: 'JUNIOR' | 'MID' | 'SENIOR' | 'LEADERSHIP'
  steps: ApprovalStep[]
  isActive: boolean
  createdAt: string
}

interface ApprovalStep {
  order: number
  role: string
  approverName: string
  autoEscalateDays: number
  isParallel: boolean
}

interface SalaryBand {
  id: string
  roleLevel: string
  minSalary: number
  maxSalary: number
  currency: string
  location: string
  isActive: boolean
}

export function OfferMatrixTab() {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([
    {
      id: 'wf-001',
      name: 'Standard IT Approval',
      roleLevel: 'MID',
      steps: [
        { order: 1, role: 'Recruiter', approverName: 'Alice Recruiter', autoEscalateDays: 1, isParallel: false },
        { order: 2, role: 'HR Manager', approverName: 'Bob HR', autoEscalateDays: 2, isParallel: false },
        { order: 3, role: 'Hiring Manager', approverName: 'Carol Manager', autoEscalateDays: 3, isParallel: false }
      ],
      isActive: true,
      createdAt: '2024-01-15'
    },
    {
      id: 'wf-002',
      name: 'Executive Approval',
      roleLevel: 'LEADERSHIP',
      steps: [
        { order: 1, role: 'HR Manager', approverName: 'Bob HR', autoEscalateDays: 1, isParallel: false },
        { order: 2, role: 'CEO', approverName: 'David CEO', autoEscalateDays: 1, isParallel: false },
        { order: 3, role: 'Client Approval', approverName: 'External', autoEscalateDays: 5, isParallel: false }
      ],
      isActive: true,
      createdAt: '2024-01-10'
    }
  ])

  const [salaryBands, setSalaryBands] = useState<SalaryBand[]>([
    { id: 'sb-001', roleLevel: 'Junior Developer', minSalary: 300000, maxSalary: 600000, currency: 'INR', location: 'Bangalore', isActive: true },
    { id: 'sb-002', roleLevel: 'Senior Developer', minSalary: 800000, maxSalary: 1500000, currency: 'INR', location: 'Bangalore', isActive: true },
    { id: 'sb-003', roleLevel: 'Lead Developer', minSalary: 1500000, maxSalary: 2500000, currency: 'INR', location: 'Bangalore', isActive: true }
  ])

  const [showNewWorkflow, setShowNewWorkflow] = useState(false)
  const [showNewSalaryBand, setShowNewSalaryBand] = useState(false)
  const [escalationSettings, setEscalationSettings] = useState({
    enableAutoEscalation: true,
    defaultEscalationDays: 3,
    escalationNotifications: true,
    weekendExclusion: true
  })

  const { toast } = useToast()

  const handleSaveEscalationSettings = () => {
    toast({
      title: "Escalation Settings Saved",
      description: "Auto-escalation rules have been updated successfully"
    })
  }

  const workflowColumns = [
    {
      id: 'name',
      header: 'Workflow Name',
      accessor: 'name' as keyof ApprovalWorkflow
    },
    {
      id: 'client',
      header: 'Client',
      accessor: 'client' as keyof ApprovalWorkflow,
      cell: (item: ApprovalWorkflow) => (
        <div className="text-sm">{item.client || 'All Clients'}</div>
      )
    },
    {
      id: 'roleLevel',
      header: 'Role Level',
      accessor: 'roleLevel' as keyof ApprovalWorkflow,
      cell: (item: ApprovalWorkflow) => (
        <Badge variant="outline">{item.roleLevel}</Badge>
      )
    },
    {
      id: 'steps',
      header: 'Approval Flow',
      accessor: 'steps' as keyof ApprovalWorkflow,
      cell: (item: ApprovalWorkflow) => (
        <div className="flex items-center gap-1 text-xs">
          {item.steps.map((step, index) => (
            <div key={step.order} className="flex items-center">
              <Badge variant="secondary" className="text-xs">
                {step.role}
              </Badge>
              {index < item.steps.length - 1 && <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />}
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'isActive',
      header: 'Status',
      accessor: 'isActive' as keyof ApprovalWorkflow,
      cell: (item: ApprovalWorkflow) => (
        <Badge className={item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof ApprovalWorkflow,
      cell: (item: ApprovalWorkflow) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <UserCheck className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const salaryColumns = [
    {
      id: 'roleLevel',
      header: 'Role Level',
      accessor: 'roleLevel' as keyof SalaryBand
    },
    {
      id: 'salaryRange',
      header: 'Salary Range',
      accessor: 'minSalary' as keyof SalaryBand,
      cell: (item: SalaryBand) => (
        <div className="text-sm">
          {item.currency} {(item.minSalary / 100000).toFixed(1)}L - {(item.maxSalary / 100000).toFixed(1)}L
        </div>
      )
    },
    {
      id: 'location',
      header: 'Location',
      accessor: 'location' as keyof SalaryBand
    },
    {
      id: 'isActive',
      header: 'Status',
      accessor: 'isActive' as keyof SalaryBand,
      cell: (item: SalaryBand) => (
        <Badge className={item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof SalaryBand,
      cell: (item: SalaryBand) => (
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Approval Workflows */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Approval Workflows</CardTitle>
            <Button onClick={() => setShowNewWorkflow(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Workflow
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={workflows}
            columns={workflowColumns}
            loading={false}
            searchable={false}
          />
        </CardContent>
      </Card>

      {/* Salary Bands */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Salary Bands & Compliance</CardTitle>
            <Button onClick={() => setShowNewSalaryBand(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Band
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={salaryBands}
            columns={salaryColumns}
            loading={false}
            searchable={false}
          />
        </CardContent>
      </Card>

      {/* Escalation Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Escalation Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Enable Auto-Escalation</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically escalate approvals when pending beyond threshold
                </p>
              </div>
              <Switch 
                checked={escalationSettings.enableAutoEscalation}
                onCheckedChange={(checked) => setEscalationSettings(prev => ({ ...prev, enableAutoEscalation: checked }))}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Default Escalation (Days)</Label>
                <Input
                  type="number"
                  value={escalationSettings.defaultEscalationDays}
                  onChange={(e) => setEscalationSettings(prev => ({ ...prev, defaultEscalationDays: parseInt(e.target.value) }))}
                  min="1"
                  max="30"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Escalation Notifications</h3>
                  <p className="text-xs text-muted-foreground">Email + WhatsApp alerts</p>
                </div>
                <Switch 
                  checked={escalationSettings.escalationNotifications}
                  onCheckedChange={(checked) => setEscalationSettings(prev => ({ ...prev, escalationNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Exclude Weekends</h3>
                  <p className="text-xs text-muted-foreground">Skip Sat/Sun in SLA</p>
                </div>
                <Switch 
                  checked={escalationSettings.weekendExclusion}
                  onCheckedChange={(checked) => setEscalationSettings(prev => ({ ...prev, weekendExclusion: checked }))}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveEscalationSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save Escalation Rules
          </Button>
        </CardContent>
      </Card>

      {/* New Workflow Modal */}
      <Dialog open={showNewWorkflow} onOpenChange={setShowNewWorkflow}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Approval Workflow</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Workflow Name</Label>
                <Input placeholder="e.g., Senior IT Approval" />
              </div>
              <div className="space-y-2">
                <Label>Role Level</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JUNIOR">Junior</SelectItem>
                    <SelectItem value="MID">Mid-level</SelectItem>
                    <SelectItem value="SENIOR">Senior</SelectItem>
                    <SelectItem value="LEADERSHIP">Leadership</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Client (Optional)</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All clients or select specific" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="techcorp">TechCorp</SelectItem>
                  <SelectItem value="financemax">FinanceMax</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Approval Steps</Label>
              <div className="space-y-2 p-4 border rounded-lg">
                <div className="text-sm font-medium">Define approval sequence:</div>
                <div className="text-xs text-muted-foreground">Steps will be executed in order. Set auto-escalation days for each step.</div>
                {/* This would be a more complex step builder in real implementation */}
                <div className="text-sm italic">Step builder UI would go here...</div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewWorkflow(false)}>
                Cancel
              </Button>
              <Button>
                Create Workflow
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Salary Band Modal */}
      <Dialog open={showNewSalaryBand} onOpenChange={setShowNewSalaryBand}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Salary Band</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role Level</Label>
              <Input placeholder="e.g., Senior Frontend Developer" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Salary</Label>
                <Input type="number" placeholder="500000" />
              </div>
              <div className="space-y-2">
                <Label>Max Salary</Label>
                <Input type="number" placeholder="1200000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="pune">Pune</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewSalaryBand(false)}>
                Cancel
              </Button>
              <Button>
                Create Band
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}