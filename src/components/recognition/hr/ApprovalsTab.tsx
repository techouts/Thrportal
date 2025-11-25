import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

interface HRApproval {
  id: string
  employee: string
  manager: string
  rewardName: string
  points: number
  value: number
  status: 'pending' | 'approved' | 'rejected'
  requestDate: string
  managerNotes: string
}

export const ApprovalsTab = () => {
  const [approvals] = useState<HRApproval[]>([
    {
      id: '1',
      employee: 'Sarah Johnson',
      manager: 'John Smith',
      rewardName: 'Team Lunch Experience',
      points: 400,
      value: 200,
      status: 'pending',
      requestDate: '2024-01-15',
      managerNotes: 'Well deserved after successful project completion'
    }
  ])

  const handleApprove = (approval: HRApproval) => {
    toast.success(`Reward approved for ${approval.employee}`)
  }

  const handleReject = (approval: HRApproval) => {
    toast.success(`Reward request rejected for ${approval.employee}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>HR Approvals Queue</CardTitle>
        <CardDescription>Final approval for reward requests</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {approvals.map((approval) => (
          <Card key={approval.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{approval.employee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{approval.employee}</div>
                    <div className="text-sm text-muted-foreground">Manager: {approval.manager}</div>
                    <div className="text-sm">{approval.rewardName} • ${approval.value}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleApprove(approval)} size="sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button variant="destructive" onClick={() => handleReject(approval)} size="sm">
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}