import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Send, MessageSquare, CheckCircle, AlertCircle, User, Calendar } from 'lucide-react';
import { ownershipService } from '@/services/ownershipService';
import { PrimaryFollowUp, FollowUpType } from '@/types/ownership';
import { useToast } from '@/hooks/use-toast';

export function PrimaryFollowUpQueue() {
  const [followUps, setFollowUps] = useState<PrimaryFollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadFollowUps();
  }, []);

  const loadFollowUps = async () => {
    setLoading(true);
    try {
      const data = await ownershipService.getPrimaryFollowUps('current-user');
      setFollowUps(data);
    } catch (error) {
      console.error('Failed to load follow-ups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: string, followUpId: string) => {
    try {
      switch (action) {
        case 'nudge_client':
          toast({ title: "Client Nudged", description: "Follow-up reminder sent to client." });
          break;
        case 'nudge_candidate':
          toast({ title: "Candidate Nudged", description: "Follow-up reminder sent to candidate." });
          break;
        case 'mark_complete':
          setFollowUps(prev => prev.filter(f => f.id !== followUpId));
          toast({ title: "Follow-up Completed", description: "Item marked as complete." });
          break;
        default:
          break;
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to perform action.", variant: "destructive" });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'destructive';
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: FollowUpType) => {
    switch (type) {
      case 'Client Feedback': return <MessageSquare className="h-4 w-4" />;
      case 'Scheduling': return <Calendar className="h-4 w-4" />;
      case 'Offer Follow-up': return <User className="h-4 w-4" />;
      case 'Document Collection': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredFollowUps = followUps.filter(followUp => {
    const typeMatch = filterType === 'all' || followUp.followUpType === filterType;
    const priorityMatch = filterPriority === 'all' || followUp.priority === filterPriority;
    return typeMatch && priorityMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Primary Follow-ups Queue
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Client Feedback">Client Feedback</SelectItem>
                  <SelectItem value="Scheduling">Scheduling</SelectItem>
                  <SelectItem value="Offer Follow-up">Offer Follow-up</SelectItem>
                  <SelectItem value="Document Collection">Documents</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {filteredFollowUps.length} pending follow-ups requiring your attention
          </div>
        </CardContent>
      </Card>

      {/* Follow-up Cards */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ) : filteredFollowUps.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No pending follow-ups found</p>
            </CardContent>
          </Card>
        ) : (
          filteredFollowUps.map((followUp) => (
            <Card key={followUp.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(followUp.followUpType)}
                      <span className="font-medium">{followUp.followUpType}</span>
                      <Badge variant={getPriorityColor(followUp.priority)} className="text-xs">
                        {followUp.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {followUp.age}h ago
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">JD</div>
                        <div className="font-medium">{followUp.jdTitle}</div>
                        <div className="text-xs text-muted-foreground">ID: {followUp.jdId}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Candidate</div>
                        <div className="font-medium">{followUp.candidateName}</div>
                        <div className="text-xs text-muted-foreground">
                          Next SLA: {new Date(followUp.nextSlaDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {followUp.notes && (
                      <div>
                        <div className="text-sm text-muted-foreground">Notes</div>
                        <div className="text-sm">{followUp.notes}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('nudge_client', followUp.id)}
                      className="w-[120px]"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Nudge Client
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('nudge_candidate', followUp.id)}
                      className="w-[120px]"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Nudge Candidate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction('add_note', followUp.id)}
                      className="w-[120px]"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Add Note
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleQuickAction('mark_complete', followUp.id)}
                      className="w-[120px]"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}