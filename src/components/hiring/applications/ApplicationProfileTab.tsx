import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, User, Briefcase, Clock, MessageSquare, FileText, AlertTriangle } from 'lucide-react';

interface ApplicationProfileTabProps {
  applicationId: string | null;
  onBack: () => void;
}

interface ApplicationDetail {
  id: string;
  candidateName: string;
  candidateId: string;
  candidateSkills: string[];
  candidateCurrentCTC: number;
  candidateAvailability: string;
  jdTitle: string;
  jdId: string;
  client: string;
  spoc: string;
  slaInfo: string;
  submitterRecruiter: string;
  submissionDate: string;
  submissionNotes: string;
  currentStage: string;
  statusTimeline: Array<{
    stage: string;
    date: string;
    actor: string;
    notes?: string;
  }>;
  clientFeedback?: {
    status: 'Accept' | 'Reject' | 'Hold';
    comments: string;
    date: string;
  };
  rejectionReason?: {
    type: 'Candidate-driven' | 'Client-driven';
    reason: string;
    date: string;
  };
  auditTrail: Array<{
    action: string;
    actor: string;
    date: string;
    details: string;
  }>;
}

export function ApplicationProfileTab({ applicationId, onBack }: ApplicationProfileTabProps) {
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackNotes, setFeedbackNotes] = useState('');

  useEffect(() => {
    if (applicationId) {
      loadApplication(applicationId);
    }
  }, [applicationId]);

  const loadApplication = async (id: string) => {
    setLoading(true);
    // Mock data
    const mockApplication: ApplicationDetail = {
      id: 'app-001',
      candidateName: 'John Smith',
      candidateId: 'candidate-1',
      candidateSkills: ['React', 'TypeScript', 'Node.js', 'AWS', 'GraphQL'],
      candidateCurrentCTC: 120000,
      candidateAvailability: '30 days notice',
      jdTitle: 'Senior React Developer',
      jdId: 'jd-001',
      client: 'TechCorp Inc',
      spoc: 'Alice Johnson',
      slaInfo: 'First submission: 2 days, Feedback: 3 days, Offer: 5 days',
      submitterRecruiter: 'Sarah Johnson',
      submissionDate: '2024-01-10T09:00:00Z',
      submissionNotes: 'Strong candidate with excellent React experience. Previously worked on similar enterprise projects.',
      currentStage: 'Interview Scheduled',
      statusTimeline: [
        {
          stage: 'Submitted',
          date: '2024-01-10T09:00:00Z',
          actor: 'Sarah Johnson',
          notes: 'Initial submission with strong profile match'
        },
        {
          stage: 'Shortlisted',
          date: '2024-01-12T14:30:00Z',
          actor: 'Client SPOC',
          notes: 'Profile approved for technical round'
        },
        {
          stage: 'Interview Scheduled',
          date: '2024-01-15T10:30:00Z',
          actor: 'Mike Rodriguez',
          notes: 'Technical interview scheduled for Jan 16, 2024 at 2 PM'
        }
      ],
      clientFeedback: {
        status: 'Accept',
        comments: 'Strong technical background. Good fit for our team culture.',
        date: '2024-01-12T14:30:00Z'
      },
      auditTrail: [
        {
          action: 'Application Created',
          actor: 'Sarah Johnson',
          date: '2024-01-10T09:00:00Z',
          details: 'Candidate linked to JD with initial assessment'
        },
        {
          action: 'Status Updated',
          actor: 'System',
          date: '2024-01-12T14:30:00Z',
          details: 'Status changed from Submitted to Shortlisted'
        },
        {
          action: 'Interview Scheduled',
          actor: 'Mike Rodriguez',
          date: '2024-01-15T10:30:00Z',
          details: 'Technical interview scheduled with hiring manager'
        }
      ]
    };
    
    setApplication(mockApplication);
    setLoading(false);
  };

  if (!applicationId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Application Selected</h3>
            <p className="text-muted-foreground">Select an application from the list to view details.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading application details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!application) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Application not found</p>
        </CardContent>
      </Card>
    );
  }

  const getTimelineBadgeVariant = (stage: string) => {
    switch (stage) {
      case 'Submitted': return 'secondary';
      case 'Shortlisted': return 'default';
      case 'Interview Scheduled': return 'default';
      case 'Interview Completed': return 'default';
      case 'Offer Extended': return 'default';
      case 'Joined': return 'default';
      case 'Rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Application Profile</h2>
          <p className="text-muted-foreground">Application ID: {application.id}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Candidate Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-medium text-lg">{application.candidateName}</div>
              <div className="text-sm text-muted-foreground">{application.candidateId}</div>
            </div>
            <div>
              <label className="text-sm font-medium">Skills</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {application.candidateSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Current CTC</label>
                <div>${(application.candidateCurrentCTC / 1000).toFixed(0)}K</div>
              </div>
              <div>
                <label className="text-sm font-medium">Availability</label>
                <div>{application.candidateAvailability}</div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              View Full Candidate Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              JD Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-medium text-lg">{application.jdTitle}</div>
              <div className="text-sm text-muted-foreground">{application.jdId}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Client</label>
                <div>{application.client}</div>
              </div>
              <div>
                <label className="text-sm font-medium">SPOC</label>
                <div>{application.spoc}</div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">SLA Info</label>
              <div className="text-sm">{application.slaInfo}</div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              View Full JD Details
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="timeline">Status Timeline</TabsTrigger>
          <TabsTrigger value="submission">Submission Details</TabsTrigger>
          <TabsTrigger value="feedback">Client Feedback</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Application Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {application.statusTimeline.map((entry, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                    <div className="mt-1">
                      <Badge variant={getTimelineBadgeVariant(entry.stage)}>
                        {entry.stage}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{entry.stage}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString()} - {entry.actor}
                        </div>
                      </div>
                      {entry.notes && (
                        <div className="text-sm text-muted-foreground mt-1">{entry.notes}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submission" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Submitter Recruiter</label>
                  <div>{application.submitterRecruiter}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Submission Date</label>
                  <div>{new Date(application.submissionDate).toLocaleDateString()}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Submission Notes</label>
                <div className="mt-1 p-3 border rounded-md bg-muted/20">
                  {application.submissionNotes}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Current Stage</label>
                <div className="mt-1 p-3 border rounded-md bg-blue-50">
                  {application.currentStage}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Client Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.clientFeedback ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant={
                      application.clientFeedback.status === 'Accept' ? 'default' :
                      application.clientFeedback.status === 'Reject' ? 'destructive' : 'secondary'
                    }>
                      {application.clientFeedback.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {new Date(application.clientFeedback.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Comments</label>
                    <div className="mt-1 p-3 border rounded-md bg-muted/20">
                      {application.clientFeedback.comments}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Feedback Yet</h3>
                  <p className="text-muted-foreground">Waiting for client feedback on this application.</p>
                </div>
              )}
              
              {application.rejectionReason && (
                <div className="mt-6 p-4 border rounded-lg bg-red-50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-red-800">Rejection Reason</span>
                  </div>
                  <div className="text-sm">
                    <div><strong>Type:</strong> {application.rejectionReason.type}</div>
                    <div><strong>Reason:</strong> {application.rejectionReason.reason}</div>
                    <div><strong>Date:</strong> {new Date(application.rejectionReason.date).toLocaleDateString()}</div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Add Feedback Notes</label>
                <Textarea
                  placeholder="Enter feedback or notes..."
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                />
                <Button className="w-full">Save Feedback</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {application.auditTrail.map((entry, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                    <div className="text-sm text-muted-foreground min-w-0 flex-shrink-0">
                      {new Date(entry.date).toLocaleDateString()} 
                      <br />
                      {new Date(entry.date).toLocaleTimeString()}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{entry.action}</div>
                      <div className="text-sm text-muted-foreground">by {entry.actor}</div>
                      <div className="text-sm mt-1">{entry.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}