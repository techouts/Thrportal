import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Users, CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import { OnOffboardingService } from '@/services/onoffboardingService';
import type { OffboardingChecklist } from '@/types/onoffboarding';

export const OffboardingChecklistsTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [checklists, setChecklists] = useState<OffboardingChecklist[]>([]);

  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    setLoading(true);
    try {
      const response = await OnOffboardingService.getOffboardingChecklists();
      if (response.success) {
        setChecklists(response.data);
      }
    } catch (error) {
      console.error('Failed to load offboarding checklists:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/20 text-amber-700';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-700';
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-700';
      case 'medium':
        return 'bg-orange-500/20 text-orange-700';
      case 'low':
        return 'bg-green-500/20 text-green-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
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
          <h3 className="text-lg font-semibold">Offboarding Checklists</h3>
          <p className="text-muted-foreground">
            Manage and track employee offboarding progress
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Checklist
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {checklists.map((checklist) => (
          <Card key={checklist.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{checklist.employeeName}</CardTitle>
                  <CardDescription>{checklist.department}</CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className={getStatusColor(checklist.status)}
                >
                  {checklist.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {checklist.completedTasks}/{checklist.totalTasks} tasks
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${(checklist.completedTasks / checklist.totalTasks) * 100}%`
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Last Working Day:</span>
                  <span className="font-medium">
                    {new Date(checklist.lastWorkingDay).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Priority:</span>
                  <Badge
                    variant="outline"
                    className={getPriorityColor(checklist.priority)}
                  >
                    {checklist.priority.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Assigned To:</span>
                  <span className="font-medium">{checklist.assignedTo}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium">
                    {new Date(checklist.dueDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <CheckSquare className="h-4 w-4 mr-1" />
                    View Tasks
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Users className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {checklists.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <div className="text-lg font-medium mb-2">No Offboarding Checklists</div>
            <div className="text-muted-foreground mb-4">
              Create your first offboarding checklist to get started
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Checklist
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};