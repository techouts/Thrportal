import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OnOffboardingService } from '@/services/onoffboardingService';
import { 
  Search, 
  Calendar, 
  User, 
  Clock, 
  AlertTriangle,
  CheckSquare,
  Users,
  Bell
} from 'lucide-react';

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  employeeId: string;
  employeeName: string;
  department: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  dueDate: string;
  joiningDate: string;
  taskType: 'hr' | 'it' | 'manager' | 'finance';
}

export const OnboardingTasksTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, this would come from the service
      const mockTasks: OnboardingTask[] = [
        {
          id: '1',
          title: 'IT Asset Assignment',
          description: 'Assign laptop, mobile, and access cards',
          employeeId: 'EMP101',
          employeeName: 'Rajesh Kumar',
          department: 'Engineering',
          status: 'pending',
          priority: 'high',
          assignedTo: 'IT Team',
          dueDate: '2024-02-15',
          joiningDate: '2024-02-12',
          taskType: 'it'
        },
        {
          id: '2',
          title: 'Document Collection',
          description: 'Collect PAN, Aadhaar, and bank details',
          employeeId: 'EMP102',
          employeeName: 'Priya Sharma',
          department: 'Marketing',
          status: 'in_progress',
          priority: 'high',
          assignedTo: 'HR Team',
          dueDate: '2024-02-10',
          joiningDate: '2024-02-08',
          taskType: 'hr'
        },
        {
          id: '3',
          title: 'Manager Introduction',
          description: 'Schedule meet with reporting manager',
          employeeId: 'EMP103',
          employeeName: 'Amit Patel',
          department: 'Sales',
          status: 'completed',
          priority: 'medium',
          assignedTo: 'Sales Manager',
          dueDate: '2024-02-05',
          joiningDate: '2024-02-01',
          taskType: 'manager'
        },
        {
          id: '4',
          title: 'Payroll Setup',
          description: 'Setup salary account and tax declarations',
          employeeId: 'EMP101',
          employeeName: 'Rajesh Kumar',
          department: 'Engineering',
          status: 'overdue',
          priority: 'high',
          assignedTo: 'Finance Team',
          dueDate: '2024-02-08',
          joiningDate: '2024-02-12',
          taskType: 'finance'
        }
      ];
      setTasks(mockTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case 'hr': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'it': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'manager': return 'bg-green-100 text-green-800 border-green-200';
      case 'finance': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Onboarding Tasks</h2>
        <p className="text-muted-foreground">
          Track and manage individual onboarding tasks across departments
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks by title, employee, or assignee..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({taskCounts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({taskCounts.pending})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({taskCounts.in_progress})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({taskCounts.overdue})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({taskCounts.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <div className="text-lg font-medium">No tasks found</div>
                <div className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : `No ${filter} tasks at the moment`}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="border border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{task.title}</h3>
                            <Badge variant="outline" className={getStatusColor(task.status)}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className={getTaskTypeColor(task.taskType)}>
                              {task.taskType.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{task.employeeName} ({task.employeeId})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{task.department}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Due: {task.dueDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Assigned to: {task.assignedTo}</span>
                          </div>
                        </div>

                        {task.status === 'overdue' && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Task is overdue! Due date was {task.dueDate}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {task.status === 'pending' && (
                          <Button size="sm">
                            Start Task
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button size="sm">
                            Mark Complete
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Bell className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};