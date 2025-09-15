import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Users, Video, MessageSquare, Plus, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Interview {
  id: string;
  applicationId: string;
  candidateName: string;
  jdTitle: string;
  interviewDate: string;
  interviewTime: string;
  panel: string[];
  mode: 'In-person' | 'Video Call' | 'Phone';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  feedback?: {
    result: 'Pass' | 'Fail' | 'Hold';
    notes: string;
    interviewer: string;
  };
  meetingLink?: string;
  location?: string;
}

export function InterviewsTab() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('table');

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    setLoading(true);
    // Mock data
    const mockInterviews: Interview[] = [
      {
        id: 'int-001',
        applicationId: 'app-001',
        candidateName: 'John Smith',
        jdTitle: 'Senior React Developer',
        interviewDate: '2024-01-16',
        interviewTime: '14:00',
        panel: ['Mike Rodriguez', 'Sarah Johnson', 'Alex Chen'],
        mode: 'Video Call',
        status: 'Scheduled',
        meetingLink: 'https://meet.google.com/abc-defg-hij'
      },
      {
        id: 'int-002',
        applicationId: 'app-002',
        candidateName: 'Emily Chen',
        jdTitle: 'Python Backend Engineer',
        interviewDate: '2024-01-15',
        interviewTime: '10:30',
        panel: ['Lisa Thompson', 'David Wilson'],
        mode: 'In-person',
        status: 'Completed',
        location: 'Conference Room A',
        feedback: {
          result: 'Pass',
          notes: 'Strong technical skills, good problem-solving approach. Recommended for next round.',
          interviewer: 'Lisa Thompson'
        }
      },
      {
        id: 'int-003',
        applicationId: 'app-003',
        candidateName: 'David Wilson',
        jdTitle: 'Full Stack Developer',
        interviewDate: '2024-01-14',
        interviewTime: '16:00',
        panel: ['John Anderson'],
        mode: 'Video Call',
        status: 'Completed',
        meetingLink: 'https://meet.google.com/xyz-uvwx-yz',
        feedback: {
          result: 'Hold',
          notes: 'Good technical knowledge but concerns about communication skills. Need second opinion.',
          interviewer: 'John Anderson'
        }
      }
    ];
    
    setInterviews(mockInterviews);
    setLoading(false);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'default';
      case 'Completed': return 'secondary';
      case 'Cancelled': return 'destructive';
      case 'Rescheduled': return 'secondary';
      default: return 'secondary';
    }
  };

  const getFeedbackBadgeVariant = (result: string) => {
    switch (result) {
      case 'Pass': return 'default';
      case 'Fail': return 'destructive';
      case 'Hold': return 'secondary';
      default: return 'secondary';
    }
  };

  const getModeBadgeVariant = (mode: string) => {
    switch (mode) {
      case 'Video Call': return 'default';
      case 'In-person': return 'secondary';
      case 'Phone': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interviews</h2>
          <p className="text-muted-foreground">Schedule and manage candidate interviews</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(value: 'calendar' | 'table') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="table">Table View</SelectItem>
              <SelectItem value="calendar">Calendar View</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Interview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Interview</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Application</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select application" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="app-001">John Smith - Senior React Developer</SelectItem>
                      <SelectItem value="app-002">Emily Chen - Python Backend Engineer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <Input type="date" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time</label>
                    <Input type="time" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Interview Panel</label>
                  <Input placeholder="Enter interviewer names..." />
                </div>
                <div>
                  <label className="text-sm font-medium">Mode</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Call</SelectItem>
                      <SelectItem value="in-person">In-person</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowScheduleDialog(false)}>
                    Schedule
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Calendar Integration</h3>
              <p className="text-muted-foreground">Two-way sync with Google Calendar and Outlook coming soon.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Interview Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Application ID</th>
                    <th className="text-left p-3 font-medium">Candidate</th>
                    <th className="text-left p-3 font-medium">JD</th>
                    <th className="text-left p-3 font-medium">Date & Time</th>
                    <th className="text-left p-3 font-medium">Panel</th>
                    <th className="text-left p-3 font-medium">Mode</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Feedback</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((interview) => (
                    <tr key={interview.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="font-mono text-sm">{interview.applicationId}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{interview.candidateName}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">{interview.jdTitle}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div>{new Date(interview.interviewDate).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">{interview.interviewTime}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {interview.panel.map((person, index) => (
                            <div key={index}>{person}</div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={getModeBadgeVariant(interview.mode)}>
                          {interview.mode}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={getStatusBadgeVariant(interview.status)}>
                          {interview.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {interview.feedback ? (
                          <Badge variant={getFeedbackBadgeVariant(interview.feedback.result)}>
                            {interview.feedback.result}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Pending</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          {interview.meetingLink && (
                            <Button variant="outline" size="sm">
                              <Video className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Capture Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Interview Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {interviews.filter(i => i.feedback).map((interview) => (
              <div key={interview.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{interview.candidateName} - {interview.jdTitle}</div>
                  <Badge variant={getFeedbackBadgeVariant(interview.feedback!.result)}>
                    {interview.feedback!.result}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  Interviewed by: {interview.feedback!.interviewer}
                </div>
                <div className="text-sm">{interview.feedback!.notes}</div>
              </div>
            ))}
            
            {interviews.filter(i => !i.feedback && i.status === 'Completed').length > 0 && (
              <div className="p-4 border rounded-lg bg-amber-50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="font-medium text-amber-800">Pending Feedback</span>
                </div>
                <div className="text-sm text-amber-700">
                  {interviews.filter(i => !i.feedback && i.status === 'Completed').length} interviews 
                  need feedback capture
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}