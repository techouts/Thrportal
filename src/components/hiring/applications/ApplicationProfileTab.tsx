import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ChevronLeft, ChevronRight, Filter, User, FileText, Clock, ExternalLink } from 'lucide-react'
import { Application } from '@/types/applications'
import { ApplicationsService } from '@/services/applicationsService'
import { ApplicationTimelineTab } from './profile/ApplicationTimelineTab'
import { ApplicationNotesTab } from './profile/ApplicationNotesTab'
import { toast } from 'sonner'

interface ApplicationProfileTabProps {
  applicationId: string
  onApplicationChange: (applicationId: string | null) => void
}

export const ApplicationProfileTab: React.FC<ApplicationProfileTabProps> = ({ 
  applicationId, 
  onApplicationChange 
}) => {
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeProfileTab, setActiveProfileTab] = useState('timeline')
  const [filterDockOpen, setFilterDockOpen] = useState(false)

  const loadApplication = async () => {
    try {
      setLoading(true)
      const data = await ApplicationsService.getApplicationById(applicationId)
      
      if (!data) {
        toast.error('Application not found')
        return
      }
      
      setApplication(data)
    } catch (error: any) {
      console.error('Error loading application:', error)
      toast.error(error?.message || 'Failed to load application')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (applicationId) {
      loadApplication()
    }
  }, [applicationId])

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'Submitted': return 'bg-blue-100 text-blue-800'
      case 'Shortlisted': return 'bg-purple-100 text-purple-800'
      case 'Interview': return 'bg-orange-100 text-orange-800'
      case 'Offer': return 'bg-green-100 text-green-800'
      case 'Joined': return 'bg-emerald-100 text-emerald-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSLABadgeColor = (status: string) => {
    switch (status) {
      case 'Green': return 'bg-green-100 text-green-800'
      case 'Amber': return 'bg-yellow-100 text-yellow-800'
      case 'Red': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading || !application) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApplicationChange(null)}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            Navigate Applications
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Open in Mapping Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams({
                app_id: applicationId,
                candidate_id: application.candidateId,
                jd_id: application.jdId
              })
              window.location.href = `/Hiring/Applications?tab=mapping&${params.toString()}`
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Mapping
          </Button>

          {/* Filter Dock Toggle */}
          <Sheet open={filterDockOpen} onOpenChange={setFilterDockOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter Dock
              </Button>
            </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Switch Applications</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {/* Mock applications list for filtering */}
                  {['app-001', 'app-002', 'app-003'].map((appId) => (
                    <Button
                      key={appId}
                      variant={appId === applicationId ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        onApplicationChange(appId)
                        setFilterDockOpen(false)
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Application {appId.slice(-3)}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </div>

      {/* Application Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Candidate</div>
              <div className="font-medium">{(application as any).candidateName || 'Unknown'}</div>
              <div className="text-sm text-muted-foreground">{(application as any).candidateEmail || 'No email'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Job Description</div>
              <div className="font-medium">{(application as any).jdTitle || 'Unknown Position'}</div>
              <div className="text-sm text-muted-foreground">{(application as any).jdClient || 'Unknown Client'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Current Stage</div>
              <div className="flex items-center gap-2">
                <Badge className={getStageBadgeColor(application.stage)}>
                  {application.stage}
                </Badge>
                {application.round && (
                  <span className="text-sm text-muted-foreground">{application.round}</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">SLA Status</div>
              <Badge className={getSLABadgeColor(application.slaStatus)}>
                {application.slaStatus}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Submitter</div>
              <div className="font-medium">{application.submittedBy}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Primary Recruiter</div>
              <div className="font-medium">{application.primaryRecruiter}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Created Via</div>
              <div className="font-medium">
                {application.createdViaMapping ? 'Mapping' : 'Direct Submission'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Profile Tabs */}
      <Tabs value={activeProfileTab} onValueChange={setActiveProfileTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-6">
          <ApplicationTimelineTab applicationId={applicationId} />
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <ApplicationNotesTab applicationId={applicationId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}