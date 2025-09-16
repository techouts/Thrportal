import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Clock, User, Calendar, MessageSquare } from 'lucide-react'
import { PipelineApplication, ApplicationStatus } from '@/types/pipeline'

interface PipelineKanbanProps {
  applications: PipelineApplication[]
  viewScope: 'my' | 'jd' | 'team'
  onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void
}

export function PipelineKanban({ applications, viewScope, onStatusChange }: PipelineKanbanProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const stages = [
    { id: 'submitted', title: 'Submitted', color: 'bg-blue-50 border-blue-200' },
    { id: 'shortlisted', title: 'Shortlisted', color: 'bg-green-50 border-green-200' },
    { id: 'interview-r1', title: 'Interview R1', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'interview-r2', title: 'Interview R2', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'interview-r3', title: 'Interview R3', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'offered', title: 'Offer', color: 'bg-purple-50 border-purple-200' },
    { id: 'joined', title: 'Joined', color: 'bg-green-50 border-green-200' },
    { id: 'rejected', title: 'Rejected', color: 'bg-red-50 border-red-200' }
  ]

  const getApplicationsByStage = (stageId: string) => {
    return applications.filter(app => {
      if (stageId.startsWith('interview-r')) {
        return app.currentStatus === 'Interview-R1' || app.currentStatus === 'Interview-R2' || app.currentStatus === 'Interview-R3'
      }
      if (stageId === 'shortlisted') return app.currentStatus === 'Shortlisted'
      if (stageId === 'submitted') return app.currentStatus === 'Submitted'
      if (stageId === 'offered') return app.currentStatus === 'Offer-Released'
      if (stageId === 'joined') return app.currentStatus === 'Joined'
      if (stageId === 'rejected') return app.currentStatus === 'Rejected'
      return false
    })
  }

  const handleDragStart = (e: React.DragEvent, applicationId: string) => {
    setDraggedItem(applicationId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault()
    if (draggedItem) {
      // Convert stage to status
      let newStatus: ApplicationStatus
      if (targetStage === 'interview-r1') {
        newStatus = 'Interview-R1'
      } else if (targetStage === 'interview-r2') {
        newStatus = 'Interview-R2'
      } else if (targetStage === 'interview-r3') {
        newStatus = 'Interview-R3'
      } else if (targetStage === 'shortlisted') {
        newStatus = 'Shortlisted'
      } else if (targetStage === 'submitted') {
        newStatus = 'Submitted'
      } else if (targetStage === 'offered') {
        newStatus = 'Offer-Released'
      } else if (targetStage === 'joined') {
        newStatus = 'Joined'
      } else if (targetStage === 'rejected') {
        newStatus = 'Rejected'
      } else {
        return
      }
      
      onStatusChange(draggedItem, newStatus)
      setDraggedItem(null)
    }
  }

  const getSLABadgeVariant = (slaStatus: string) => {
    switch (slaStatus) {
      case 'green': return 'default'
      case 'amber': return 'secondary'
      case 'red': return 'destructive'
      default: return 'outline'
    }
  }

  const ApplicationCard = ({ app }: { app: PipelineApplication }) => (
    <Card 
      className="mb-3 cursor-move hover:shadow-md transition-shadow border"
      draggable
      onDragStart={(e) => handleDragStart(e, app.id)}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{app.candidateName}</h4>
              <p className="text-xs text-muted-foreground truncate">{app.jdTitle}</p>
            </div>
            <Badge variant={getSLABadgeVariant(app.slaStatus)} className="ml-2">
              {app.slaStatus}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {app.ageing}d
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {app.primaryRecruiter}
            </div>
          </div>
          
          {app.currentRound && (
            <Badge variant="outline" className="text-xs">
              {app.currentRound}
            </Badge>
          )}
          
          <div className="flex gap-1 mt-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-xs h-6 px-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Interview</DialogTitle>
                </DialogHeader>
                <div className="p-4">
                  <p>Schedule interview for {app.candidateName}</p>
                  {/* Add scheduling form here */}
                </div>
              </DialogContent>
            </Dialog>
            
            <Button size="sm" variant="outline" className="text-xs h-6 px-2">
              <MessageSquare className="h-3 w-3 mr-1" />
              Note
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-8 gap-4 h-[800px] overflow-x-auto">
      {stages.map(stage => {
        const stageApplications = getApplicationsByStage(stage.id)
        
        return (
          <div key={stage.id} className="flex flex-col min-w-[250px]">
            <Card className={`flex-1 ${stage.color}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  {stage.title}
                  <Badge variant="secondary">{stageApplications.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent 
                className="flex-1 overflow-y-auto"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {stageApplications.map(app => (
                  <ApplicationCard key={app.id} app={app} />
                ))}
                
                {stageApplications.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No applications
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}