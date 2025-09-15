import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, TrendingUp, AlertTriangle, UserPlus, MoreHorizontal } from 'lucide-react';
import { ownershipService } from '@/services/ownershipService';
import { RecruiterManagerMapping } from '@/types/ownership';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function RecruiterManagerMappingTab() {
  const [mappings, setMappings] = useState<RecruiterManagerMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<RecruiterManagerMapping | null>(null);

  useEffect(() => {
    loadMappings();
  }, []);

  const loadMappings = async () => {
    setLoading(true);
    try {
      const data = await ownershipService.getRecruiterManagerMappings();
      setMappings(data);
    } catch (error) {
      console.error('Failed to load recruiter manager mappings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async (recruiterId: string, newManagerId: string) => {
    try {
      await ownershipService.updateRecruiterManagerMapping(recruiterId, newManagerId);
      loadMappings();
      setShowReassignDialog(false);
    } catch (error) {
      console.error('Failed to reassign recruiter:', error);
    }
  };

  const getWorkloadColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getWorkloadVariant = (score: number) => {
    if (score >= 80) return 'destructive';
    if (score >= 60) return 'secondary';
    return 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recruiter-Manager Mapping</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Manage reporting relationships and escalation routing for recruiters
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Bulk Reassign
              </Button>
              <Button variant="outline" size="sm">
                Balance Workload
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recruiters</p>
                <p className="text-2xl font-bold">{mappings.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Workload</p>
                <p className="text-2xl font-bold">
                  {Math.round(mappings.reduce((sum, m) => sum + m.workloadScore, 0) / mappings.length)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overloaded</p>
                <p className="text-2xl font-bold text-red-600">
                  {mappings.filter(m => m.workloadScore >= 80).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Balance Index</p>
                <p className="text-2xl font-bold">0.85</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mappings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recruiter Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Recruiter</th>
                    <th className="text-left p-3">Assigned Manager</th>
                    <th className="text-left p-3">Active JDs</th>
                    <th className="text-left p-3">Active Candidates</th>
                    <th className="text-left p-3">Workload Score</th>
                    <th className="text-left p-3">Assignment Date</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((mapping) => (
                    <tr key={mapping.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{mapping.recruiterName}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {mapping.recruiterId}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{mapping.staffingManagerName}</div>
                          <div className="text-xs text-muted-foreground">
                            Since: {new Date(mapping.assignedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary">{mapping.activeJDs}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary">{mapping.activeCandidates}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={getWorkloadVariant(mapping.workloadScore)}>
                              {mapping.workloadScore}%
                            </Badge>
                          </div>
                          <Progress value={mapping.workloadScore} className="h-1 w-20" />
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {new Date(mapping.assignedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedMapping(mapping);
                                setShowReassignDialog(true);
                              }}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Reassign Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <TrendingUp className="mr-2 h-4 w-4" />
                              View Performance
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workload Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Workload Distribution by Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from(new Set(mappings.map(m => m.staffingManagerName))).map((managerName) => {
              const managerMappings = mappings.filter(m => m.staffingManagerName === managerName);
              const avgWorkload = Math.round(
                managerMappings.reduce((sum, m) => sum + m.workloadScore, 0) / managerMappings.length
              );
              const totalJDs = managerMappings.reduce((sum, m) => sum + m.activeJDs, 0);
              const totalCandidates = managerMappings.reduce((sum, m) => sum + m.activeCandidates, 0);

              return (
                <div key={managerName} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{managerName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {managerMappings.length} recruiters
                      </p>
                    </div>
                    <Badge variant={getWorkloadVariant(avgWorkload)}>
                      Avg Load: {avgWorkload}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Team Size</p>
                      <p className="font-medium">{managerMappings.length} recruiters</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total JDs</p>
                      <p className="font-medium">{totalJDs}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Candidates</p>
                      <p className="font-medium">{totalCandidates}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Workload</p>
                      <p className={`font-medium ${getWorkloadColor(avgWorkload)}`}>
                        {avgWorkload}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {managerMappings.map((mapping) => (
                        <div
                          key={mapping.id}
                          className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded"
                        >
                          <span>{mapping.recruiterName}</span>
                          <Badge
                            variant={getWorkloadVariant(mapping.workloadScore)}
                            className="text-xs"
                          >
                            {mapping.workloadScore}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reassign Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reassign Manager</DialogTitle>
            <DialogDescription>
              Reassign "{selectedMapping?.recruiterName}" to a new staffing manager
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Manager</label>
              <Badge variant="outline">{selectedMapping?.staffingManagerName}</Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Manager</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select new manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager-1">Mike Rodriguez</SelectItem>
                  <SelectItem value="manager-2">Lisa Thompson</SelectItem>
                  <SelectItem value="manager-3">John Anderson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workload-balancing">Workload Balancing</SelectItem>
                  <SelectItem value="skill-alignment">Skill Alignment</SelectItem>
                  <SelectItem value="performance-improvement">Performance Improvement</SelectItem>
                  <SelectItem value="organizational-change">Organizational Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReassignDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedMapping) {
                  handleReassign(selectedMapping.recruiterId, 'manager-2');
                }
              }}
            >
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}