import React, { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { KPICard } from '@/components/shared/KPICard'
import { ChartKit } from '@/components/shared/ChartKit'
import { 
  Headphones, 
  Search, 
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  User,
  Tag,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Phone,
  Mail,
  Video,
  UserCheck,
  FileText,
  BarChart3,
  AlertTriangle,
  Award,
  Timer
} from 'lucide-react'
import { helpdeskService } from '@/services/helpdeskService'
import { 
  Ticket,
  TicketFilters,
  HelpdeskDashboardMetrics,
  TicketStatus,
  TicketPriority
} from '@/types/helpdesk'

const HRHelpdeskPage = () => {
  const [activeTab, setActiveTab] = useState('queue')
  const [ticketQueue, setTicketQueue] = useState<Ticket[]>([])
  const [workInProgress, setWorkInProgress] = useState<Ticket[]>([])
  const [dashboardMetrics, setDashboardMetrics] = useState<HelpdeskDashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Filter states
  const [queueFilters, setQueueFilters] = useState<TicketFilters>({})
  const [wipFilters, setWipFilters] = useState<TicketFilters>({})

  useEffect(() => {
    loadTicketQueue()
    loadWorkInProgress()
    loadDashboardMetrics()
  }, [])

  const loadTicketQueue = async () => {
    setIsLoading(true)
    try {
      const response = await helpdeskService.getTicketQueue('HR', queueFilters)
      if (response.success) {
        setTicketQueue(response.data)
      }
    } catch (error) {
      console.error('Failed to load ticket queue:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadWorkInProgress = async () => {
    try {
      const response = await helpdeskService.getWorkInProgress('HR')
      if (response.success) {
        setWorkInProgress(response.data)
      }
    } catch (error) {
      console.error('Failed to load work in progress:', error)
    }
  }

  const loadDashboardMetrics = async () => {
    try {
      const response = await helpdeskService.getDashboardMetrics('HR')
      if (response.success) {
        setDashboardMetrics(response.data)
      }
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error)
    }
  }

  const handleAssignTicket = async (ticketId: string, agentId: string) => {
    try {
      await helpdeskService.assignTicket(ticketId, agentId, 'hr-manager')
      loadTicketQueue()
    } catch (error) {
      console.error('Failed to assign ticket:', error)
    }
  }

  const handleUpdateStatus = async (ticketId: string, status: TicketStatus) => {
    try {
      await helpdeskService.updateTicketStatus(ticketId, status)
      loadTicketQueue()
      loadWorkInProgress()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'New':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'Assigned':
        return <User className="h-4 w-4 text-yellow-500" />
      case 'In Progress':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'Pending Info':
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      case 'Resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'Closed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'Critical':
        return 'destructive'
      case 'High':
        return 'destructive'
      case 'Medium':
        return 'default'
      case 'Low':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getSLAStatus = (ticket: Ticket) => {
    const now = new Date()
    const dueDate = new Date(ticket.sla_resolution_due)
    const hoursRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (ticket.is_sla_breached) {
      return { status: 'breached', color: 'text-red-600', text: 'SLA Breached' }
    } else if (hoursRemaining <= 2) {
      return { status: 'critical', color: 'text-orange-600', text: `${Math.floor(hoursRemaining)}h remaining` }
    } else if (hoursRemaining <= 8) {
      return { status: 'warning', color: 'text-yellow-600', text: `${Math.floor(hoursRemaining)}h remaining` }
    } else {
      return { status: 'ok', color: 'text-green-600', text: `${Math.floor(hoursRemaining)}h remaining` }
    }
  }

  const hrMetrics = dashboardMetrics ? [
    {
      title: 'Open Tickets',
      value: dashboardMetrics.open_tickets.toString(),
      description: 'Pending resolution',
      trend: { direction: 'up' as const, value: '12%', label: 'vs last week' }
    },
    {
      title: 'SLA Compliance',
      value: `${dashboardMetrics.sla_compliance_percentage}%`,
      description: 'Within SLA targets',
      trend: { direction: 'up' as const, value: '5%', label: 'vs last month' }
    },
    {
      title: 'Avg Resolution Time',
      value: `${dashboardMetrics.avg_resolution_time_hours}h`,
      description: 'Average time to resolve',
      trend: { direction: 'down' as const, value: '2h', label: 'vs last month' }
    },
    {
      title: 'Critical Tickets',
      value: dashboardMetrics.critical_tickets.toString(),
      description: 'Requiring immediate attention',
      trend: { direction: 'down' as const, value: '1', label: 'vs yesterday' }
    }
  ] : []

  return (
    <div className="space-y-6">
      <PageHeader
        title="HR Help Desk"
        description="Manage HR support tickets and track team performance"
        icon={Headphones}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queue">Ticket Queue</TabsTrigger>
          <TabsTrigger value="wip">Work In Progress</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">HR Ticket Queue</h3>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
              <Button>
                <UserCheck className="h-4 w-4 mr-2" />
                Bulk Assign
              </Button>
            </div>
          </div>

          {/* Queue Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Input placeholder="Search tickets..." />
                </div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sub-Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="leave">Leave/Timesheet</SelectItem>
                    <SelectItem value="payroll">Payroll</SelectItem>
                    <SelectItem value="benefits">Benefits</SelectItem>
                    <SelectItem value="policy">Policy Clarification</SelectItem>
                    <SelectItem value="employee-relations">Employee Relations</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="SLA Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All SLA Status</SelectItem>
                    <SelectItem value="breached">SLA Breached</SelectItem>
                    <SelectItem value="critical">Critical (under 2h)</SelectItem>
                    <SelectItem value="warning">Warning (under 8h)</SelectItem>
                    <SelectItem value="ok">On Track</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Assigned To" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="hr-agent-1">HR Agent 1</SelectItem>
                    <SelectItem value="hr-agent-2">HR Agent 2</SelectItem>
                    <SelectItem value="hr-manager">HR Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <div className="space-y-4">
            {ticketQueue.map((ticket) => {
              const slaStatus = getSLAStatus(ticket)
              return (
                <Card key={ticket.id} className={ticket.is_sla_breached ? 'border-red-200 bg-red-50' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h4 className="font-semibold">{ticket.title}</h4>
                          <Badge variant="outline">{ticket.ticket_number}</Badge>
                          <Badge variant={getPriorityColor(ticket.priority) as any}>
                            {ticket.priority}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(ticket.status)}
                            <span className="text-sm">{ticket.status}</span>
                          </div>
                          <div className={`text-sm font-medium ${slaStatus.color}`}>
                            {slaStatus.text}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{ticket.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{ticket.created_by_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Tag className="h-4 w-4" />
                            <span>{ticket.sub_category}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Timer className="h-4 w-4" />
                            <span>Due: {new Date(ticket.sla_resolution_due).toLocaleString()}</span>
                          </div>
                        </div>

                        {ticket.escalation_level > 0 && (
                          <div className="mt-3 flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-600 font-medium">
                              Escalation Level {ticket.escalation_level}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Select onValueChange={(agentId) => handleAssignTicket(ticket.id, agentId)}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Assign to..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hr-agent-1">HR Agent 1</SelectItem>
                            <SelectItem value="hr-agent-2">HR Agent 2</SelectItem>
                            <SelectItem value="hr-manager">HR Manager</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select onValueChange={(status) => handleUpdateStatus(ticket.id, status as TicketStatus)}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Assigned">Assign</SelectItem>
                            <SelectItem value="In Progress">Start Work</SelectItem>
                            <SelectItem value="Pending Info">Need Info</SelectItem>
                            <SelectItem value="Resolved">Resolve</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add Note
                        </Button>
                        
                        <Button size="sm" variant="outline">
                          <ArrowUp className="h-4 w-4 mr-2" />
                          Escalate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="wip" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Work In Progress</h3>
            <div className="flex space-x-2">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button>
                <CheckCircle className="h-4 w-4 mr-2" />
                Bulk Complete
              </Button>
            </div>
          </div>

          {/* WIP Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">{workInProgress.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">SLA Breached</p>
                    <p className="text-2xl font-bold">
                      {workInProgress.filter(t => t.is_sla_breached).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Due Today</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <ArrowUp className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Escalated</p>
                    <p className="text-2xl font-bold">
                      {workInProgress.filter(t => t.escalation_level > 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* WIP Tickets */}
          <div className="space-y-4">
            {workInProgress.map((ticket) => {
              const slaStatus = getSLAStatus(ticket)
              return (
                <Card key={ticket.id} className={ticket.is_sla_breached ? 'border-red-200 bg-red-50' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h4 className="font-semibold">{ticket.title}</h4>
                          <Badge variant="outline">{ticket.ticket_number}</Badge>
                          <Badge variant={getPriorityColor(ticket.priority) as any}>
                            {ticket.priority}
                          </Badge>
                          <div className={`text-sm font-medium ${slaStatus.color}`}>
                            {slaStatus.text}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>Assigned to: {ticket.assigned_to_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Started: {new Date(ticket.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Progress Indicator */}
                        <div className="mb-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-muted-foreground">
                              {ticket.status === 'In Progress' ? '60%' : '30%'}
                            </span>
                          </div>
                          <Progress value={ticket.status === 'In Progress' ? 60 : 30} className="h-2" />
                        </div>

                        {ticket.comments.length > 0 && (
                          <div className="bg-gray-50 p-3 rounded mt-3">
                            <p className="text-sm font-medium mb-1">Latest Update:</p>
                            <p className="text-sm">{ticket.comments[ticket.comments.length - 1].comment}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Update
                        </Button>
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                        <Button size="sm" variant="outline">
                          <ArrowUp className="h-4 w-4 mr-2" />
                          Escalate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">HR Help Desk Dashboard</h3>
            <div className="flex space-x-2">
              <Select defaultValue="7days">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          {dashboardMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {hrMetrics.map((metric, index) => (
                <KPICard key={index} {...metric} />
              ))}
            </div>
          )}

          {/* Charts */}
          {dashboardMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartKit
                type="line"
                title="SLA Compliance Trend"
                data={dashboardMetrics.sla_trends}
                dataKey="compliance_percentage"
                xAxisKey="date"
                height={300}
                showGrid
                colors={['#10b981']}
              />
              <ChartKit
                type="bar"
                title="Resolution Time Trend"
                data={dashboardMetrics.resolution_trends}
                dataKey="avg_hours"
                xAxisKey="date"
                height={300}
                colors={['#3b82f6']}
              />
            </div>
          )}

          {dashboardMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartKit
                type="pie"
                title="Tickets by Category"
                data={dashboardMetrics.category_distribution}
                dataKey="count"
                height={300}
                colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']}
              />
              <ChartKit
                type="pie"
                title="Priority Distribution"
                data={dashboardMetrics.priority_distribution}
                dataKey="count"
                height={300}
                colors={['#ef4444', '#f59e0b', '#3b82f6', '#6b7280']}
              />
              <ChartKit
                type="pie"
                title="Status Distribution"
                data={dashboardMetrics.status_distribution}
                dataKey="count"
                height={300}
                colors={['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981']}
              />
            </div>
          )}

          {/* HR SLA Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>HR SLA Performance by Category</CardTitle>
              <CardDescription>
                Performance metrics for different HR ticket categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { category: 'Leave/Timesheet', sla: '4h/1d', current: '3.2h/18h', compliance: 95, target: 90 },
                  { category: 'Payroll', sla: '6h/2d', current: '4.8h/32h', compliance: 88, target: 85 },
                  { category: 'Benefits', sla: '8h/3d', current: '6.2h/58h', compliance: 92, target: 80 },
                  { category: 'Policy Clarification', sla: '8h/3d', current: '7.1h/48h', compliance: 87, target: 80 },
                  { category: 'Employee Relations', sla: '2h/5d', current: '1.8h/96h', compliance: 96, target: 95 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.category}</h4>
                      <p className="text-sm text-muted-foreground">
                        SLA: {item.sla} | Current: {item.current}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{item.compliance}%</p>
                        <p className="text-xs text-muted-foreground">Target: {item.target}%</p>
                      </div>
                      <div className="w-20">
                        <Progress value={item.compliance} className="h-2" />
                      </div>
                      {item.compliance >= item.target ? (
                        <Award className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default HRHelpdeskPage