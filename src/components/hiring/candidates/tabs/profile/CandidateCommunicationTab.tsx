import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { candidatesService } from '@/services/candidatesService';
import type { CandidateCommunication } from '@/types/candidates';
import { Mail, Phone, MessageSquare, Linkedin, MessageCircle } from 'lucide-react';

interface CandidateCommunicationTabProps {
  candidateId: string;
}

export function CandidateCommunicationTab({ candidateId }: CandidateCommunicationTabProps) {
  const [communications, setCommunications] = useState<CandidateCommunication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunications();
  }, [candidateId]);

  const loadCommunications = async () => {
    try {
      const data = await candidatesService.getCandidateCommunications(candidateId);
      setCommunications(data);
    } catch (error) {
      console.error('Failed to load communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone call': return <Phone className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'linkedin message': return <Linkedin className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communication History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication History</CardTitle>
      </CardHeader>
      <CardContent>
        {communications.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No communication history found</p>
        ) : (
          <div className="space-y-4">
            {communications.map((comm) => (
              <div key={comm.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(comm.type)}
                    <span className="font-medium">{comm.type}</span>
                    <Badge variant={comm.direction === 'Outbound' ? 'default' : 'secondary'}>
                      {comm.direction}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(comm.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {comm.subject && (
                  <div className="font-medium">{comm.subject}</div>
                )}
                <p className="text-sm text-muted-foreground">{comm.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
