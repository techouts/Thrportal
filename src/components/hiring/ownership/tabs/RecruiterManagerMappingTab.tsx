import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
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
  const [selectedRecruiters, setSelectedRecruiters] = useState<string[]>([]);
  const [managers, setManagers] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [newManagerId, setNewManagerId] = useState<string>('');
  const [reassignReason, setReassignReason] = useState<string>('');
  const [isBulkMode, setIsBulkMode] = useState(false);

  useEffect(() => {
    loadMappings();
    loadManagers();
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

  const loadManagers = async () => {
    try {
      const managersData = await ownershipService.getManagers();
      setManagers(managersData);
    } catch (error) {
      console.error('Failed to load managers:', error);
    }
  };

  const handleReassign = async () => {
    try {
      if (isBulkMode && selectedRecruiters.length > 0) {
        await ownershipService.bulkUpdateRecruiterManagerMapping(selectedRecruiters, newManagerId);
      } else if (selectedMapping) {
        await ownershipService.updateRecruiterManagerMapping(selectedMapping.recruiterId, newManagerId);
      }
      
      setShowReassignDialog(false);
      setSelectedRecruiters([]);
      setNewManagerId('');
      setReassignReason('');
      setIsBulkMode(false);
      setSelectedMapping(null);
      loadMappings();
    } catch (error) {
      console.error('Failed to reassign:', error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecruiters(mappings.map(m => m.recruiterId));
    } else {
      setSelectedRecruiters([]);
    }
  };

  const handleSelectRecruiter = (recruiterId: string, checked: boolean) => {
    if (checked) {
      setSelectedRecruiters(prev => [...prev, recruiterId]);
    } else {
      setSelectedRecruiters(prev => prev.filter(id => id !== recruiterId));
    }
  };

  const handleBulkReassignClick = () => {
    setIsBulkMode(true);
    setShowReassignDialog(true);
  };

  const getWorkloadColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getWorkloadVariant = (_score: number) => {
    return 'secondary';
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBulkReassignClick}
                disabled={selectedRecruiters.length === 0}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Bulk Reassign ({selectedRecruiters.length})
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
                    <th className="text-left p-3 w-12">
                      <Checkbox
                        checked={selectedRecruiters.length === mappings.length && mappings.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
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
                        <Checkbox
                          checked={selectedRecruiters.includes(mapping.recruiterId)}
                          onCheckedChange={(checked) => handleSelectRecruiter(mapping.recruiterId, checked as boolean)}
                        />
                      </td>
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
                          <div className="font-medium">
                            {mapping.staffingManagerName === 'Unassigned' ? (
                              <Badge variant="outline" className="text-muted-foreground">Unassigned</Badge>
                            ) : (
                              mapping.staffingManagerName
                            )}
                          </div>
                          {mapping.staffingManagerName !== 'Unassigned' && (
                            <div className="text-xs text-muted-foreground">
                              Since: {new Date(mapping.assignedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary">{mapping.activeJDs}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary">{mapping.activeCandidates}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary">
                          {mapping.workloadScore}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        {mapping.staffingManagerName === 'Unassigned' 
                          ? <span className="text-muted-foreground">-</span>
                          : new Date(mapping.assignedAt).toLocaleDateString()
                        }
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
                                setIsBulkMode(false);
                                setNewManagerId('');
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
                    <Badge variant={getWorkloadVariant(avgWorkload) as any}>
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
                            variant={'secondary' as const}
                            className="text-xs"
                          >
                            {mapping.workloadScore}
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
            <DialogTitle>
              {isBulkMode ? 'Bulk Reassign Manager' : 'Reassign Manager'}
            </DialogTitle>
            <DialogDescription>
              {isBulkMode 
                ? `Reassign ${selectedRecruiters.length} recruiters to a new staffing manager`
                : `Reassign "${selectedMapping?.recruiterName}" to a new staffing manager`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!isBulkMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Manager</label>
                <Badge variant="outline">{selectedMapping?.staffingManagerName}</Badge>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">New Manager *</label>
              <Select value={newManagerId} onValueChange={setNewManagerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new manager" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} ({manager.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason (Optional)</label>
              <Textarea
                placeholder="Enter reason for reassignment..."
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReassignDialog(false);
                setSelectedRecruiters([]);
                setNewManagerId('');
                setReassignReason('');
                setIsBulkMode(false);
                setSelectedMapping(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReassign}
              disabled={!newManagerId}
            >
              {isBulkMode ? 'Reassign All' : 'Reassign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}