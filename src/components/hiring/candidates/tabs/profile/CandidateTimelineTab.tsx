import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { candidatesService } from '@/services/candidatesService';
import type { CandidateStatusTimeline } from '@/types/candidates';
import { Clock } from 'lucide-react';

interface CandidateTimelineTabProps {
  candidateId: string;
}

export function CandidateTimelineTab({ candidateId }: CandidateTimelineTabProps) {
  const [timeline, setTimeline] = useState<CandidateStatusTimeline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, [candidateId]);

  const loadTimeline = async () => {
    try {
      const data = await candidatesService.getCandidateTimeline(candidateId);
      setTimeline(data);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {timeline.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No timeline events found</p>
        ) : (
          <div className="space-y-4">
            {timeline.map((event) => (
              <div key={event.id} className="relative pl-8 pb-4 border-l-2 border-muted last:border-l-0">
                <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-primary border-2 border-background" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.fromStatus && (
                      <>
                        <Badge variant="outline">{event.fromStatus}</Badge>
                        <span className="text-muted-foreground">→</span>
                      </>
                    )}
                    <Badge>{event.toStatus}</Badge>
                  </div>
                  {event.reason && (
                    <p className="text-sm text-muted-foreground">{event.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
