import React, { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { KPICard } from '@/components/shared/KPICard'
import { DataTable } from '@/components/shared/DataTable'
import { 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Receipt,
  CreditCard,
  Calculator,
  FileText,
  Filter,
  Search,
  Eye,
  UserCheck,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { helpdeskService } from '@/services/helpdeskService'
import { Ticket, TicketStatus, TicketPriority } from '@/types/helpdesk'
import { useToast } from '@/hooks/use-toast'

const FinanceHelpdeskPage = () => {
  const [activeTab, setActiveTab] = useState('queue')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [wipTickets, setWipTickets] = useState<Ticket[]>([])
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: '',
    search: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    loadTickets()
    loadWipTickets()
  }, [])

  const loadTickets = async () => {
    try {
      const response = await helpdeskService.getDepartmentTickets('Finance')
      if (response.success) {
        setTickets(response.data.filter(t => t.status === 'New' || t.status === 'Assigned'))
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tickets',
        variant: 'destructive'
      })
    }
  }

  const loadWipTickets = async () => {
    try {
      const response = await helpdeskService.getDepartmentTickets('Finance')
      if (response.success) {
        setWipTickets(response.data.filter(t => t.status === 'In Progress' || t.status === 'Pending Info'))
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load work in progress tickets',
        variant: 'destructive'
      })
    }
  }

  const handleStatusUpdate = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      const response = await helpdeskService.updateTicketStatus(ticketId, newStatus)
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Ticket status updated successfully'
        })
        loadTickets()
        loadWipTickets()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update ticket status',
        variant: 'destructive'
      })
    }
  }

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800'
      case 'Assigned': return 'bg-yellow-100 text-yellow-800'
      case 'In Progress': return 'bg-orange-100 text-orange-800'
      case 'Pending Info': return 'bg-purple-100 text-purple-800'
      case 'Resolved': return 'bg-green-100 text-green-800'
      case 'Closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'Critical': return 'destructive'
      case 'High': return 'destructive'
      case 'Medium': return 'default'
      case 'Low': return 'secondary'
      default: return 'secondary'
    }
  }

  const ticketColumns = [
    {
      id: 'ticket_number',
      header: 'Ticket #',
      accessor: (row: Ticket) => row.ticket_number,
    },
    {
      id: 'title',
      header: 'Title',
      accessor: (row: Ticket) => row.title,
    },
    {
      id: 'sub_category',
      header: 'Sub-Category',
      accessor: (row: Ticket) => row.sub_category,
    },
    {
      id: 'priority',
      header: 'Priority',
      accessor: (row: Ticket) => (
        <Badge variant={getPriorityColor(row.priority)}>
          {row.priority}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row: Ticket) => (
        <Badge className={getStatusColor(row.status)}>
          {row.status}
        </Badge>
      ),
    },
    {
      id: 'employee_name',
      header: 'Employee',
      accessor: (row: Ticket) => row.created_by,
    },
    {
      id: 'due_date',
      header: 'SLA Due',
      accessor: (row: Ticket) => new Date(row.due_date).toLocaleString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (row: Ticket) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4" />
          </Button>
          <Select onValueChange={(value: TicketStatus) => handleStatusUpdate(row.id, value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Assigned">Assign</SelectItem>
              <SelectItem value="In Progress">Start Work</SelectItem>
              <SelectItem value="Pending Info">Need Info</SelectItem>
              <SelectItem value="Resolved">Resolve</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
  ]

  const dashboardMetrics = [
    {
      title: 'Open Tickets',
      value: tickets.length.toString(),
      description: 'New and assigned tickets',
      icon: DollarSign,
      trend: { value: 8, isPositive: false }
    },
    {
      title: 'In Progress',
      value: wipTickets.length.toString(),
      description: 'Tickets being worked on',
      icon: UserCheck,
      trend: { value: 6, isPositive: true }
    },
    {
      title: 'SLA Compliance',
      value: '96%',
      description: 'This month',
      icon: CheckCircle,
      trend: { value: 3, isPositive: true }
    },
    {
      title: 'Avg Resolution Time',
      value: '2.1d',
      description: 'Finance average',
      icon: Clock,
      trend: { value: 12, isPositive: true }
    }
  ]

  const filteredTickets = tickets.filter(ticket => {
    return (
      (!filters.category || ticket.sub_category === filters.category) &&
      (!filters.priority || ticket.priority === filters.priority) &&
      (!filters.status || ticket.status === filters.status) &&
      (!filters.search || 
        ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.ticket_number.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.created_by.toLowerCase().includes(filters.search.toLowerCase()))
    )
  })

  const filteredWipTickets = wipTickets.filter(ticket => {
    return (
      (!filters.category || ticket.sub_category === filters.category) &&
      (!filters.priority || ticket.priority === filters.priority) &&
      (!filters.search || 
        ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.ticket_number.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.created_by.toLowerCase().includes(filters.search.toLowerCase()))
    )
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance Help Desk"
        description="Manage finance-related support requests and financial queries"
        icon={DollarSign}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queue">Ticket Queue</TabsTrigger>
          <TabsTrigger value="wip">Work In Progress</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Finance Ticket Queue</h3>
            <Badge variant="outline">
              {filteredTickets.length} tickets pending
            </Badge>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search tickets..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Sub-Category</Label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      <SelectItem value="Reimbursements">Reimbursements</SelectItem>
                      <SelectItem value="Tax Queries">Tax Queries</SelectItem>
                      <SelectItem value="Salary Disbursement">Salary Disbursement</SelectItem>
                      <SelectItem value="Invoices">Invoices</SelectItem>
                      <SelectItem value="Expense Reports">Expense Reports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All priorities</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Assigned">Assigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <DataTable
                data={filteredTickets}
                columns={ticketColumns}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wip" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Work In Progress</h3>
            <Badge variant="outline">
              {filteredWipTickets.length} tickets in progress
            </Badge>
          </div>

          <Card>
            <CardContent className="p-0">
              <DataTable
                data={filteredWipTickets}
                columns={ticketColumns}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardMetrics.map((metric, index) => (
              <KPICard key={index} {...metric} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Finance Tickets by Category</CardTitle>
                <CardDescription>Distribution of finance support requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Receipt className="h-4 w-4 text-blue-500" />
                      <span>Reimbursements</span>
                    </div>
                    <span className="font-semibold">42</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-green-500" />
                      <span>Salary Disbursement</span>
                    </div>
                    <span className="font-semibold">28</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-4 w-4 text-purple-500" />
                      <span>Tax Queries</span>
                    </div>
                    <span className="font-semibold">21</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-orange-500" />
                      <span>Invoices/Expenses</span>
                    </div>
                    <span className="font-semibold">17</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SLA Performance</CardTitle>
                <CardDescription>Response and resolution times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Reimbursements (6hr response)</span>
                      <span className="text-green-600 font-semibold">97%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '97%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Salary Disbursement (4hr response)</span>
                      <span className="text-green-600 font-semibold">99%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '99%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Tax Queries (8hr response)</span>
                      <span className="text-green-600 font-semibold">93%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '93%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Invoices/Expenses (8hr response)</span>
                      <span className="text-yellow-600 font-semibold">89%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '89%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FinanceHelpdeskPage