import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  Building, 
  Target,
  MessageSquare,
  History,
  Edit,
  Copy,
  Upload
} from 'lucide-react'
import { useState } from 'react'
import { SmartUploadModal } from '../shared/SmartUploadModal'
import type { JobRequisition } from '@/types/jobRequisitions'

interface JDDetailsDrawerProps {
  jobRequisition: JobRequisition
  onClose: () => void
}

export function JDDetailsDrawer({ jobRequisition: jd, onClose }: JDDetailsDrawerProps) {
  const [showSmartUpload, setShowSmartUpload] = useState(false)

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'default'
      case 'Rejected': return 'destructive'
      case 'In Review': return 'secondary'
      case 'On Hold': return 'outline'
      default: return 'secondary'
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'destructive'
      case 'High': return 'default'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6 mt-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold">{jd.jobTitle}</h3>
            <p className="text-muted-foreground">{jd.jdId}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={getStatusBadgeVariant(jd.status)}>
              {jd.status}
            </Badge>
            <Badge variant={getPriorityBadgeVariant(jd.priority)}>
              {jd.priority}
            </Badge>
          </div>
        </div>

        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            {jd.department} • {jd.businessUnit}
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {jd.workLocation.city} ({jd.workLocation.mode})
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {jd.positions} positions
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="default"
            onClick={() => setShowSmartUpload(true)}
            disabled={jd.status === 'Rejected' || jd.status === 'On Hold'}
            className="bg-primary hover:bg-primary/90"
          >
            <Upload className="h-4 w-4 mr-2" />
            Smart Upload
          </Button>
          <Button size="sm" variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button size="sm" variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Clone
          </Button>
        </div>
      </div>

      <Separator />

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium">Hiring Manager</div>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs">
                    {jd.hiringManager.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span>{jd.hiringManager}</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium">Job Type</div>
              <div className="mt-1">{jd.jobType}</div>
            </div>

            <div>
              <div className="text-sm font-medium">Client</div>
              <div className="mt-1">
                {jd.isInternal ? (
                  <Badge variant="outline">Internal</Badge>
                ) : (
                  jd.clientName || 'External'
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium">Experience</div>
              <div className="mt-1 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {jd.experience.min}-{jd.experience.max} years
              </div>
            </div>

            <div>
              <div className="text-sm font-medium">Budget</div>
              <div className="mt-1 flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {jd.budget.min}-{jd.budget.max} {jd.budget.type}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium">Expected DOJ</div>
              <div className="mt-1 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(jd.expectedDOJ).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{jd.shortSummary}</p>
        </CardContent>
      </Card>

      {/* Responsibilities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Key Responsibilities</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {jd.responsibilities.map((responsibility, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-muted-foreground mt-1">•</span>
                <span>{responsibility}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Required Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Must-Have Skills</div>
            <div className="flex flex-wrap gap-2">
              {jd.requiredSkills.mustHave.map((skill, index) => (
                <Badge key={index} variant="default">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          
          {jd.requiredSkills.goodToHave.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Good-to-Have Skills</div>
              <div className="flex flex-wrap gap-2">
                {jd.requiredSkills.goodToHave.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interview Rounds */}
      {jd.interviewRounds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interview Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {jd.interviewRounds.map((round, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <span>{round}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hiring Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold">{jd.cvsShared}</div>
              <div className="text-sm text-muted-foreground">CVs Shared</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{jd.offersMade}</div>
              <div className="text-sm text-muted-foreground">Offers Made</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval History */}
      {jd.approvals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5" />
              Approval History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jd.approvals.map((approval) => (
                <div key={approval.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs">
                      {approval.approverName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{approval.approverName}</span>
                      <Badge variant="outline" className="text-xs">{approval.approverRole}</Badge>
                      <Badge variant={approval.status === 'Approved' ? 'default' : 'secondary'} className="text-xs">
                        {approval.status}
                      </Badge>
                    </div>
                    {approval.comment && (
                      <p className="text-sm text-muted-foreground">{approval.comment}</p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {new Date(approval.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      {jd.comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments & Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jd.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs">
                      {comment.authorName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.authorName}</span>
                      <div className="text-xs text-muted-foreground">
                        {new Date(comment.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Notes */}
      {jd.additionalNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{jd.additionalNotes}</p>
          </CardContent>
        </Card>
      )}

      <SmartUploadModal
        open={showSmartUpload}
        onClose={() => setShowSmartUpload(false)}
        jobRequisition={jd}
      />
    </div>
  )
}