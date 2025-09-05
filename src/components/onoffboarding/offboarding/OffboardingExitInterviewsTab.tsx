import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Calendar, Star, Plus, Eye } from 'lucide-react';
import { OnOffboardingService } from '@/services/onoffboardingService';
import type { ExitInterview } from '@/types/onoffboarding';

export const OffboardingExitInterviewsTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<ExitInterview[]>([]);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'pending'>('all');

  useEffect(() => {
    loadExitInterviews();
  }, []);

  const loadExitInterviews = async () => {
    setLoading(true);
    try {
      const response = await OnOffboardingService.getExitInterviews();
      if (response.success) {
        setInterviews(response.data);
      }
    } catch (error) {
      console.error('Failed to load exit interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-700';
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-700';
      case 'pending':
        return 'bg-amber-500/20 text-amber-700';
      case 'cancelled':
        return 'bg-red-500/20 text-red-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  const filteredInterviews = interviews.filter(interview => {
    if (filter === 'all') return true;
    return interview.status === filter;
  });

  const interviewCounts = {
    all: interviews.length,
    scheduled: interviews.filter(i => i.status === 'scheduled').length,
    completed: interviews.filter(i => i.status === 'completed').length,
    pending: interviews.filter(i => i.status === 'pending').length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex space-x-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Exit Interviews</h3>
          <p className="text-muted-foreground">
            Schedule and manage employee exit interviews
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Interview
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All ({interviewCounts.all})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          size="sm"
        >
          Pending ({interviewCounts.pending})
        </Button>
        <Button
          variant={filter === 'scheduled' ? 'default' : 'outline'}
          onClick={() => setFilter('scheduled')}
          size="sm"
        >
          Scheduled ({interviewCounts.scheduled})
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
          size="sm"
        >
          Completed ({interviewCounts.completed})
        </Button>
      </div>

      {/* Exit Interviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInterviews.map((interview) => (
          <Card key={interview.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{interview.employeeName}</CardTitle>
                  <CardDescription>{interview.department}</CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className={getStatusColor(interview.status)}
                >
                  {interview.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interview.scheduledDate && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Interview Date:
                    </span>
                    <span className="font-medium">
                      {new Date(interview.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Last Working Day:</span>
                  <span className="font-medium">
                    {new Date(interview.lastWorkingDay).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Interviewer:</span>
                  <span className="font-medium">{interview.interviewer}</span>
                </div>

                {interview.status === 'completed' && interview.overallRating && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Overall Rating:</span>
                      <div className="flex space-x-1">
                        {getRatingStars(interview.overallRating)}
                      </div>
                    </div>
                    {interview.feedback && (
                      <div className="text-sm">
                        <p className="text-muted-foreground mb-1">Key Feedback:</p>
                        <p className="text-foreground italic">"{interview.feedback}"</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  {interview.status === 'completed' ? (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View Report
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {interview.status === 'pending' ? 'Schedule' : 'Reschedule'}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInterviews.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <div className="text-lg font-medium mb-2">
              No {filter !== 'all' ? filter + ' ' : ''}exit interviews found
            </div>
            <div className="text-muted-foreground mb-4">
              {filter === 'all' 
                ? 'Schedule your first exit interview to get started'
                : `No ${filter} exit interviews at the moment`
              }
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};