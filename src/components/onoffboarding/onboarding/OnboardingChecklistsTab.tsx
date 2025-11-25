import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { OnOffboardingService } from '@/services/onoffboardingService';
import { 
  Plus, 
  Search, 
  GripVertical, 
  User, 
  Calendar, 
  Clock, 
  Users,
  Building,
  MapPin
} from 'lucide-react';

interface OnboardingChecklist {
  id: string;
  name: string;
  department: string;
  location: string;
  role: string;
  totalTasks: number;
  estimatedDays: number;
  assignedTo: string[];
  lastUpdated: string;
  isActive: boolean;
}

export const OnboardingChecklistsTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [checklists, setChecklists] = useState<OnboardingChecklist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, this would come from the service
      const mockChecklists: OnboardingChecklist[] = [
        {
          id: '1',
          name: 'Software Engineer Onboarding',
          department: 'Engineering',
          location: 'Bangalore',
          role: 'Software Engineer',
          totalTasks: 12,
          estimatedDays: 7,
          assignedTo: ['HR', 'IT', 'Manager'],
          lastUpdated: '2024-01-15',
          isActive: true
        },
        {
          id: '2',
          name: 'Sales Executive Onboarding',
          department: 'Sales',
          location: 'Mumbai',
          role: 'Sales Executive', 
          totalTasks: 8,
          estimatedDays: 5,
          assignedTo: ['HR', 'Sales Manager'],
          lastUpdated: '2024-01-10',
          isActive: true
        },
        {
          id: '3',
          name: 'Marketing Manager Onboarding',
          department: 'Marketing',
          location: 'Delhi',
          role: 'Manager',
          totalTasks: 15,
          estimatedDays: 10,
          assignedTo: ['HR', 'IT', 'Finance', 'Manager'],
          lastUpdated: '2024-01-08',
          isActive: false
        }
      ];
      setChecklists(mockChecklists);
    } catch (error) {
      console.error('Failed to load checklists:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChecklists = checklists.filter(checklist =>
    checklist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checklist.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checklist.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDepartmentColor = (department: string) => {
    const colors = {
      'Engineering': 'bg-blue-100 text-blue-800 border-blue-200',
      'Sales': 'bg-green-100 text-green-800 border-green-200',
      'Marketing': 'bg-purple-100 text-purple-800 border-purple-200',
      'HR': 'bg-orange-100 text-orange-800 border-orange-200',
      'Finance': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[department as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
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
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Onboarding Checklists</h2>
          <p className="text-muted-foreground">
            Create and manage role-based onboarding checklists
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Checklist
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search checklists by name, department, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Checklists Grid */}
      <div className="grid gap-4">
        {filteredChecklists.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <div className="text-lg font-medium">No checklists found</div>
              <div className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first onboarding checklist'}
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Checklist
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredChecklists.map((checklist) => (
            <Card key={checklist.id} className="border border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{checklist.name}</CardTitle>
                      {!checklist.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <Badge variant="outline" className={getDepartmentColor(checklist.department)}>
                          {checklist.department}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {checklist.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {checklist.role}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <GripVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Total Tasks</div>
                    <div className="font-medium">{checklist.totalTasks} tasks</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Est. Duration</div>
                    <div className="font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {checklist.estimatedDays} days
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Last Updated</div>
                    <div className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {checklist.lastUpdated}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Assigned Teams</div>
                  <div className="flex gap-2">
                    {checklist.assignedTo.map((team) => (
                      <Badge key={team} variant="outline" className="text-xs">
                        {team}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    Edit Checklist
                  </Button>
                  <Button variant="outline" size="sm">
                    View Tasks
                  </Button>
                  <Button variant="outline" size="sm">
                    Duplicate
                  </Button>
                  {checklist.isActive ? (
                    <Button variant="outline" size="sm">
                      Deactivate
                    </Button>
                  ) : (
                    <Button size="sm">
                      Activate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};