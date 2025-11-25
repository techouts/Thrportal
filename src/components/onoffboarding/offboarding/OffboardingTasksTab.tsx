import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckSquare, Clock, AlertTriangle, User, Calendar } from 'lucide-react';
import { OnOffboardingService } from '@/services/onoffboardingService';
import type { OffboardingTask } from '@/types/onoffboarding';

export const OffboardingTasksTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<OffboardingTask[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await OnOffboardingService.getOffboardingTasks();
      if (response.success) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error('Failed to load offboarding tasks:', error);
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
      case 'overdue':
        return 'bg-red-500/20 text-red-700';
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

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex space-x-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
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
          <h3 className="text-lg font-semibold">Offboarding Tasks</h3>
          <p className="text-muted-foreground">
            Track and manage individual offboarding tasks
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All ({taskCounts.all})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          size="sm"
        >
          Pending ({taskCounts.pending})
        </Button>
        <Button
          variant={filter === 'in_progress' ? 'default' : 'outline'}
          onClick={() => setFilter('in_progress')}
          size="sm"
        >
          In Progress ({taskCounts.in_progress})
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
          size="sm"
        >
          Completed ({taskCounts.completed})
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{task.title}</h4>
                    <Badge
                      variant="outline"
                      className={getPriorityColor(task.priority)}
                    >
                      {task.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">{task.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{task.employeeName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>Assigned to: {task.assignedTo}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <Badge
                    variant="secondary"
                    className={getStatusColor(task.status)}
                  >
                    {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                  <Button variant="outline" size="sm">
                    {task.status === 'completed' ? 'View' : 'Update'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <div className="text-lg font-medium mb-2">
              No {filter !== 'all' ? filter.replace('_', ' ') + ' ' : ''}tasks found
            </div>
            <div className="text-muted-foreground">
              {filter === 'all' 
                ? 'No offboarding tasks have been created yet'
                : `No ${filter.replace('_', ' ')} tasks at the moment`
              }
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};