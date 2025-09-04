import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Clock, CheckCircle, XCircle, Eye, Calendar, DollarSign, User } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface RewardRequest {
  id: string
  employee: string
  employeeAvatar?: string
  employeeRole: string
  rewardName: string
  rewardType: 'gift-card' | 'experience' | 'merchandise' | 'charity'
  points: number
  value: number
  requestDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  managerNotes?: string
}

export const RewardApprovalsTab = () => {
  const [selectedRequest, setSelectedRequest] = useState<RewardRequest | null>(null)
  const [managerNotes, setManagerNotes] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const pendingRequests: RewardRequest[] = [
    {
      id: '1',
      employee: 'Sarah Johnson',
      employeeAvatar: '/api/placeholder/32/32',
      employeeRole: 'Senior Developer',
      rewardName: 'Team Lunch Experience',
      rewardType: 'experience',
      points: 400,
      value: 200,
      requestDate: '2024-01-15',
      reason: 'Leading the successful migration project and mentoring junior developers',
      status: 'pending',
      priority: 'high'
    },
    {
      id: '2',
      employee: 'Mike Chen',
      employeeAvatar: '/api/placeholder/32/32',
      employeeRole: 'UX Designer',
      rewardName: 'Amazon Gift Card - $50',
      rewardType: 'gift-card',
      points: 500,
      value: 50,
      requestDate: '2024-01-14',
      reason: 'Outstanding customer satisfaction scores and innovative design solutions',
      status: 'pending',
      priority: 'medium'
    },
    {
      id: '3',
      employee: 'Jordan Smith',
      employeeAvatar: '/api/placeholder/32/32',
      employeeRole: 'Junior Developer',
      rewardName: 'Professional Development Course',
      rewardType: 'experience',
      points: 600,
      value: 300,
      requestDate: '2024-01-13',
      reason: 'Exceptional growth and taking initiative on challenging projects',
      status: 'pending',
      priority: 'medium'
    }
  ]

  const recentlyProcessed: RewardRequest[] = [
    {
      id: '4',
      employee: 'Emily Davis',
      employeeAvatar: '/api/placeholder/32/32',
      employeeRole: 'Product Manager',
      rewardName: 'Wellness Spa Day',
      rewardType: 'experience',
      points: 350,
      value: 175,
      requestDate: '2024-01-10',
      reason: 'Successful product launch and excellent stakeholder management',
      status: 'approved',
      priority: 'medium',
      managerNotes: 'Well deserved after the successful Q4 launch. Approved for immediate processing.'
    },
    {
      id: '5',
      employee: 'Alex Rodriguez',
      employeeAvatar: '/api/placeholder/32/32',
      employeeRole: 'Marketing Lead',
      rewardName: 'Premium Coffee Subscription',
      rewardType: 'merchandise',
      points: 250,
      value: 125,
      requestDate: '2024-01-08',
      reason: 'Excellent campaign performance and team collaboration',
      status: 'approved',
      priority: 'low',
      managerNotes: 'Great performance this quarter. Approved.'
    }
  ]

  const handleApprove = (request: RewardRequest) => {
    if (!managerNotes.trim()) {
      toast.error('Please add manager notes before approving')
      return
    }
    
    toast.success(`Reward approved for ${request.employee}. Request forwarded to HR.`)
    setIsDialogOpen(false)
    setManagerNotes('')
    setSelectedRequest(null)
  }

  const handleReject = (request: RewardRequest) => {
    if (!managerNotes.trim()) {
      toast.error('Please add manager notes before rejecting')
      return
    }
    
    toast.success(`Reward request rejected. ${request.employee} will be notified.`)
    setIsDialogOpen(false)
    setManagerNotes('')
    setSelectedRequest(null)
  }

  const getStatusIcon = (status: RewardRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: RewardRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
    }
  }

  const getPriorityColor = (priority: RewardRequest['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
    }
  }

  const getRewardTypeIcon = (type: RewardRequest['rewardType']) => {
    switch (type) {
      case 'gift-card':
        return '🎁'
      case 'experience':
        return '🎯'
      case 'merchandise':
        return '📦'
      case 'charity':
        return '❤️'
    }
  }

  const RewardRequestCard = ({ request, showActions = false }: { request: RewardRequest; showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={request.employeeAvatar} alt={request.employee} />
              <AvatarFallback>{request.employee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{request.employee}</div>
              <div className="text-sm text-muted-foreground">{request.employeeRole}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(request.priority)}>
              {request.priority} priority
            </Badge>
            <Badge className={getStatusColor(request.status)}>
              {getStatusIcon(request.status)}
              <span className="ml-1 capitalize">{request.status}</span>
            </Badge>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getRewardTypeIcon(request.rewardType)}</span>
            <div>
              <div className="font-medium">{request.rewardName}</div>
              <div className="text-sm text-muted-foreground">
                {request.points} points • ${request.value} value
              </div>
            </div>
          </div>
          
          <div className="bg-muted/20 p-3 rounded-lg">
            <p className="text-sm"><strong>Reason:</strong> {request.reason}</p>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(request.requestDate), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${request.value}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {request.points} pts
            </span>
          </div>

          {request.managerNotes && (
            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-l-blue-500">
              <p className="text-sm"><strong>Manager Notes:</strong> {request.managerNotes}</p>
            </div>
          )}
        </div>

        {showActions && request.status === 'pending' && (
          <div className="flex items-center gap-3">
            <Dialog open={isDialogOpen && selectedRequest?.id === request.id} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedRequest(request)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Review
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Review Reward Request</DialogTitle>
                  <DialogDescription>
                    Review and approve or reject this reward request
                  </DialogDescription>
                </DialogHeader>
                
                {selectedRequest && (
                  <div className="space-y-6">
                    <RewardRequestCard request={selectedRequest} />
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Manager Notes *</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add your notes about this approval/rejection..."
                        value={managerNotes}
                        onChange={(e) => setManagerNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Button 
                        onClick={() => handleApprove(selectedRequest)}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve & Forward to HR
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleReject(selectedRequest)}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Request
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Approved requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,475</div>
            <p className="text-xs text-muted-foreground">Pending approvals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Processing</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3</div>
            <p className="text-xs text-muted-foreground">Days</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Reward Approvals</CardTitle>
          <CardDescription>
            Review and approve reward requests from your team members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingRequests.map((request) => (
            <RewardRequestCard key={request.id} request={request} showActions={true} />
          ))}
          
          {pendingRequests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No pending reward requests
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Processed */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Processed</CardTitle>
          <CardDescription>
            Recently approved or rejected reward requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentlyProcessed.map((request) => (
            <RewardRequestCard key={request.id} request={request} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}