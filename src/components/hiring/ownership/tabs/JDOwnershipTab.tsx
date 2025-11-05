import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, Lock, Unlock, Users, UserPlus, History, MoreHorizontal, AlertTriangle, Send, Bell } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { jdOwnershipService } from '@/services/jdOwnershipService';
import { JDOwnership, JDStatus, SlaStatus } from '@/types/ownership';
import { useToast } from '@/hooks/use-toast';
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
  DialogTrigger,
} from '@/components/ui/dialog';

export function JDOwnershipTab() {
  const [jdOwnerships, setJdOwnerships] = useState<JDOwnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJDs, setSelectedJDs] = useState<string[]>([]);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [selectedJD, setSelectedJD] = useState<JDOwnership | null>(null);
  const [viewFilter, setViewFilter] = useState<'all' | 'unassigned' | 'unattended'>('all');
  const [recruiters, setRecruiters] = useState<Array<{ id: string; name: string }>>([]);
  const [newPrimaryId, setNewPrimaryId] = useState<string>('');
  const [showCollaboratorsDialog, setShowCollaboratorsDialog] = useState(false);
  const [selectedCollaboratorIds, setSelectedCollaboratorIds] = useState<string[]>([]);
  const [tempCollaboratorId, setTempCollaboratorId] = useState<string>('');
  const [showSubmissionCapDialog, setShowSubmissionCapDialog] = useState(false);
  const [newSubmissionCap, setNewSubmissionCap] = useState<number>(5);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [managerFilter, setManagerFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showBulkReassignDialog, setShowBulkReassignDialog] = useState(false);
  const [bulkNewPrimaryId, setBulkNewPrimaryId] = useState<string>('');
  const [bulkCollaboratorIds, setBulkCollaboratorIds] = useState<string[]>([]);
  const [bulkTempCollaboratorId, setBulkTempCollaboratorId] = useState<string>('');
  const [bulkUpdateMode, setBulkUpdateMode] = useState<'replace' | 'append'>('replace');
  const { toast } = useToast();

  useEffect(() => {
    loadJDOwnerships();
  }, []);

  useEffect(() => {
    if (showReassignDialog || showCollaboratorsDialog) {
      loadRecruiters();
    }
  }, [showReassignDialog, showCollaboratorsDialog]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, managerFilter, viewFilter]);

  const loadJDOwnerships = async () => {
    setLoading(true);
    try {
      const data = await jdOwnershipService.getApprovedJDOwnerships();
      setJdOwnerships(data);
    } catch (error) {
      console.error('Failed to load JD ownerships:', error);
      toast({
        title: "Error",
        description: "Failed to load JD ownership data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecruiters = async () => {
    try {
      const data = await jdOwnershipService.getRecruiters();
      setRecruiters(data);
    } catch (error) {
      console.error('Failed to load recruiters:', error);
      toast({
        title: "Error",
        description: "Failed to load recruiter list",
        variant: "destructive"
      });
    }
  };

  const handleReassign = async (jdId: string, recruiterId: string) => {
    try {
      console.log('Assigning recruiter:', { jdId, recruiterId });
      
      await jdOwnershipService.updateJDOwnership(jdId, {
        recruiterId,
        updatedBy: 'current-user'
      });
      
      console.log('Assignment successful, reloading data...');
      await loadJDOwnerships();
      
      console.log('Data reloaded, switching to All JDs view');
      setViewFilter('all');
      
      setShowReassignDialog(false);
      setNewPrimaryId('');
      
      toast({
        title: "Success",
        description: "Primary recruiter assigned successfully. Viewing All JDs."
      });
    } catch (error) {
      console.error('Failed to reassign JD:', error);
      toast({
        title: "Error",
        description: "Failed to assign primary recruiter",
        variant: "destructive"
      });
    }
  };

  const handleLockToggle = async (jdId: string, isLocked: boolean) => {
    try {
      await jdOwnershipService.updateJDOwnership(jdId, {
        isLocked: !isLocked,
        updatedBy: 'current-user'
      });
      loadJDOwnerships();
      toast({
        title: "Success",
        description: `JD ${!isLocked ? 'locked' : 'unlocked'} successfully`
      });
    } catch (error) {
      console.error('Failed to toggle lock:', error);
      toast({
        title: "Error",
        description: "Failed to update lock status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: JDStatus) => {
    switch (status) {
      case 'Active': return 'default';
      case 'On Hold': return 'secondary';
      case 'Closed': return 'outline';
      case 'Draft': return 'secondary';
      case 'Cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getSlaStatusBadgeVariant = (slaStatus: SlaStatus) => {
    switch (slaStatus) {
      case 'On Track': return 'default';
      case 'Amber': return 'secondary';
      case 'Red': return 'destructive';
      case 'No Submission': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleQuickAction = async (action: string, jdId: string) => {
    try {
      switch (action) {
        case 'escalate':
          await jdOwnershipService.escalateToManager(jdId, 'No submissions received');
          toast({ title: "Escalated to Manager", description: "JD has been escalated to the staffing manager." });
          break;
        case 'notify':
          await jdOwnershipService.notifyRecruiter(jdId, 'Please prioritize submissions for this JD');
          toast({ title: "Recruiter Notified", description: "Reminder sent to the assigned recruiter." });
          break;
        default:
          break;
      }
      loadJDOwnerships();
    } catch (error) {
      toast({ title: "Error", description: "Failed to perform action.", variant: "destructive" });
    }
  };

  const handleManageCollaborators = (jd: JDOwnership) => {
    setSelectedJD(jd);
    // Get current collaborator IDs from names
    const currentCollaboratorIds = recruiters
      .filter(r => jd.collaborators.includes(r.name))
      .map(r => r.id);
    setSelectedCollaboratorIds(currentCollaboratorIds);
    setTempCollaboratorId('');
    setShowCollaboratorsDialog(true);
  };

  const handleAddCollaborator = () => {
    if (tempCollaboratorId && !selectedCollaboratorIds.includes(tempCollaboratorId)) {
      setSelectedCollaboratorIds([...selectedCollaboratorIds, tempCollaboratorId]);
      setTempCollaboratorId('');
    }
  };

  const handleRemoveCollaborator = (recruiterId: string) => {
    setSelectedCollaboratorIds(selectedCollaboratorIds.filter(id => id !== recruiterId));
  };

  const handleSaveCollaborators = async () => {
    if (!selectedJD) return;

    try {
      await jdOwnershipService.updateCollaborators(selectedJD.jdId, selectedCollaboratorIds);
      await loadJDOwnerships();
      setShowCollaboratorsDialog(false);
      setSelectedCollaboratorIds([]);
      setTempCollaboratorId('');
      toast({
        title: "Success",
        description: "Collaborators updated successfully"
      });
    } catch (error) {
      console.error('Failed to update collaborators:', error);
      toast({
        title: "Error",
        description: "Failed to update collaborators",
        variant: "destructive"
      });
    }
  };

  const handleOpenSubmissionCapDialog = (jd: JDOwnership) => {
    setSelectedJD(jd);
    setNewSubmissionCap(jd.perRecruiterSubmissionCap);
    setShowSubmissionCapDialog(true);
  };

  const handleSaveSubmissionCap = async () => {
    if (!selectedJD) return;

    if (newSubmissionCap < 1 || newSubmissionCap > 999) {
      toast({
        title: "Invalid Cap",
        description: "Submission cap must be between 1 and 999",
        variant: "destructive"
      });
      return;
    }

    try {
      await jdOwnershipService.updateSubmissionCap(selectedJD.jdId, newSubmissionCap);
      
      // Add delay to ensure DB write completes before fetching fresh data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await loadJDOwnerships();
      setShowSubmissionCapDialog(false);
      toast({
        title: "Success",
        description: "Submission cap updated successfully"
      });
    } catch (error) {
      console.error('Failed to update submission cap:', error);
      toast({
        title: "Error",
        description: "Failed to update submission cap",
        variant: "destructive"
      });
    }
  };

  const handleOpenBulkReassign = () => {
    setBulkNewPrimaryId('');
    setBulkCollaboratorIds([]);
    setBulkTempCollaboratorId('');
    setBulkUpdateMode('replace');
    setShowBulkReassignDialog(true);
  };

  const handleAddBulkCollaborator = () => {
    if (bulkTempCollaboratorId && !bulkCollaboratorIds.includes(bulkTempCollaboratorId)) {
      setBulkCollaboratorIds([...bulkCollaboratorIds, bulkTempCollaboratorId]);
      setBulkTempCollaboratorId('');
    }
  };

  const handleRemoveBulkCollaborator = (recruiterId: string) => {
    setBulkCollaboratorIds(bulkCollaboratorIds.filter(id => id !== recruiterId));
  };

  const handleBulkReassign = async () => {
    if (selectedJDs.length === 0) return;

    try {
      let successCount = 0;
      let errorCount = 0;

      // Process each selected JD
      for (const jdId of selectedJDs) {
        try {
          // Update primary recruiter if specified
          if (bulkNewPrimaryId) {
            await jdOwnershipService.updateJDOwnership(jdId, {
              recruiterId: bulkNewPrimaryId,
              updatedBy: 'current-user'
            });
          }

          // Update collaborators if specified
          if (bulkCollaboratorIds.length > 0) {
            if (bulkUpdateMode === 'replace') {
              // Replace all collaborators
              await jdOwnershipService.updateCollaborators(jdId, bulkCollaboratorIds);
            } else {
              // Append mode: get existing collaborators and merge
              const existingJD = jdOwnerships.find(jd => jd.jdId === jdId);
              if (existingJD) {
                const existingCollaboratorIds = recruiters
                  .filter(r => existingJD.collaborators.includes(r.name))
                  .map(r => r.id);
                const mergedIds = [...new Set([...existingCollaboratorIds, ...bulkCollaboratorIds])];
                await jdOwnershipService.updateCollaborators(jdId, mergedIds);
              }
            }
          }

          successCount++;
        } catch (error) {
          console.error(`Failed to update JD ${jdId}:`, error);
          errorCount++;
        }
      }

      // Reload data
      await loadJDOwnerships();

      // Clear selections and close dialog
      setSelectedJDs([]);
      setShowBulkReassignDialog(false);
      setBulkNewPrimaryId('');
      setBulkCollaboratorIds([]);

      // Show result toast
      if (errorCount === 0) {
        toast({
          title: "Success",
          description: `Successfully updated ${successCount} JD${successCount > 1 ? 's' : ''}`
        });
      } else {
        toast({
          title: "Partial Success",
          description: `Updated ${successCount} JD(s), ${errorCount} failed`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Bulk reassign failed:', error);
      toast({
        title: "Error",
        description: "Failed to perform bulk reassignment",
        variant: "destructive"
      });
    }
  };

  // Extract unique primary recruiters dynamically
  const uniquePrimaryRecruiters = useMemo(() => {
    const recruiters = new Set(
      jdOwnerships
        .map(jd => jd.primaryRecruiter)
        .filter(recruiter => 
          recruiter && 
          recruiter.trim() !== '' && 
          recruiter !== 'Unassigned'
        )
    );
    return Array.from(recruiters).sort();
  }, [jdOwnerships]);

  // Step 1: Apply search filter
  const searchFilteredJDs = jdOwnerships.filter(jd =>
    jd.jdTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jd.jdId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jd.primaryRecruiter.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jd.collaborators.some(collaborator => collaborator.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Step 2: Apply status filter
  const statusFilteredJDs = searchFilteredJDs.filter(jd => {
    if (statusFilter === 'all') return true;
    return jd.status === statusFilter;
  });

  // Step 3: Apply primary recruiter filter
  const primaryRecruiterFilteredJDs = statusFilteredJDs.filter(jd => {
    if (managerFilter === 'all') return true;
    return jd.primaryRecruiter === managerFilter;
  });

  // Step 4: Apply view filter
  const filteredJDs = primaryRecruiterFilteredJDs.filter(jd => {
    if (viewFilter === 'unassigned') {
      return jd.primaryRecruiter === 'Unassigned' || jd.primaryRecruiter === '';
    }
    if (viewFilter === 'unattended') {
      return jd.submissionsTotal === 0;
    }
    if (viewFilter === 'all') {
      return jd.primaryRecruiter !== 'Unassigned' && jd.primaryRecruiter !== '';
    }
    return true;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredJDs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedJDs = filteredJDs.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>JD Ownership Management</CardTitle>
              {/* View Toggle Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewFilter('all')}
                >
                  All JDs ({primaryRecruiterFilteredJDs.filter(jd => jd.primaryRecruiter !== 'Unassigned' && jd.primaryRecruiter !== '').length})
                </Button>
                <Button
                  variant={viewFilter === 'unassigned' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewFilter('unassigned')}
                >
                  Unassigned ({primaryRecruiterFilteredJDs.filter(jd => jd.primaryRecruiter === 'Unassigned' || jd.primaryRecruiter === '').length})
                </Button>
                <Button
                  variant={viewFilter === 'unattended' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewFilter('unattended')}
                >
                  Unattended ({primaryRecruiterFilteredJDs.filter(jd => jd.submissionsTotal === 0).length})
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedJDs.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleOpenBulkReassign}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Bulk Reassign ({selectedJDs.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by JD ID, title, or recruiter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={managerFilter} onValueChange={setManagerFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Primary Recruiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Primary</SelectItem>
                {uniquePrimaryRecruiters.map((recruiter) => (
                  <SelectItem key={recruiter} value={recruiter}>
                    {recruiter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* JD Ownership Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Descriptions ({filteredJDs.length})</CardTitle>
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
                    <th className="text-left p-2">
                      <Checkbox
                        checked={selectedJDs.length === filteredJDs.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedJDs(filteredJDs.map(jd => jd.jdId));
                          } else {
                            setSelectedJDs([]);
                          }
                        }}
                      />
                    </th>
                    <th className="text-left p-2">JD ID</th>
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Primary</th>
                    <th className="text-left p-2">Collaborators</th>
                    <th className="text-left p-2">Submissions Count (today/total)</th>
                    <th className="text-left p-2">First Submit Age</th>
                    <th className="text-left p-2">SLA Status</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Open Pool</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedJDs.map((jd) => (
                    <tr key={jd.id} className={`border-b hover:bg-muted/50 ${jd.submissionsTotal === 0 ? 'bg-red-50/50' : ''}`}>
                      <td className="p-2">
                        <Checkbox
                          checked={selectedJDs.includes(jd.jdId)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedJDs([...selectedJDs, jd.jdId]);
                            } else {
                              setSelectedJDs(selectedJDs.filter(id => id !== jd.jdId));
                            }
                          }}
                        />
                      </td>
                      <td className="p-2 font-mono text-sm">{jd.jdId}</td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{jd.jdTitle}</div>
                          <div className="text-xs text-muted-foreground">
                            Updated: {new Date(jd.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="default" className="text-xs">
                          {jd.primaryRecruiter}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {jd.collaborators.map((collaborator) => (
                            <Badge key={collaborator} variant="outline" className="text-xs">
                              {collaborator}
                            </Badge>
                          ))}
                          {jd.collaborators.length === 0 && (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </div>
                      </td>
                       <td className="p-2">
                         <div className="space-y-1">
                           <div className="flex justify-between text-sm font-medium">
                             <span>Today:</span>
                             <span className={`${jd.submissionsToday === 0 ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                               {jd.submissionsToday}
                             </span>
                           </div>
                           <div className="flex justify-between text-sm">
                             <span>Total:</span>
                             <span className={`${jd.submissionsTotal === 0 ? 'text-red-600 font-bold' : ''}`}>
                               {jd.submissionsTotal}
                             </span>
                           </div>
                           <details className="text-xs">
                             <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                               By Recruiter
                             </summary>
                             <div className="mt-1 space-y-1 border-t pt-1">
                               {Object.entries(jd.submissionsByRecruiter).map(([recruiter, count]) => (
                                 <div key={recruiter} className="flex justify-between">
                                   <span className="truncate max-w-[80px]">{recruiter.split(' ')[0]}</span>
                                   <span className={`font-medium ${count === 0 ? 'text-red-600' : ''}`}>{count}</span>
                                 </div>
                               ))}
                               <div className="text-muted-foreground border-t pt-1">
                                 Cap: {jd.perRecruiterSubmissionCap}/day
                               </div>
                             </div>
                           </details>
                         </div>
                       </td>
                      <td className="p-2">
                        <div className="text-sm">
                          {jd.firstSubmitAge > 0 ? (
                            <span className={`${jd.firstSubmitAge > 72 ? 'text-orange-600' : ''}`}>
                              {jd.firstSubmitAge}h
                            </span>
                          ) : (
                            <span className="text-red-600">No submissions</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant={getSlaStatusBadgeVariant(jd.slaStatus)} className="text-xs">
                          {jd.slaStatus}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant={getStatusBadgeVariant(jd.status)}>
                          {jd.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={jd.openPoolFlag ? "default" : "outline"} 
                            className="text-xs"
                          >
                            {jd.openPoolFlag ? "Open" : "Closed"}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          {jd.submissionsTotal === 0 && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuickAction('escalate', jd.jdId)}
                                title="Escalate to Manager"
                                className="p-1"
                              >
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuickAction('notify', jd.jdId)}
                                title="Notify Recruiter"
                                className="p-1"
                              >
                                <Bell className="h-4 w-4 text-blue-500" />
                              </Button>
                            </>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedJD(jd);
                                  setShowReassignDialog(true);
                                }}
                              >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Set/Change Primary
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleManageCollaborators(jd)}
                              >
                                <Users className="mr-2 h-4 w-4" />
                                Manage Collaborators
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Badge className="mr-2 h-4 w-4" />
                                Toggle Open Pool
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenSubmissionCapDialog(jd)}
                              >
                                <Users className="mr-2 h-4 w-4" />
                                Set Submission Cap
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <History className="mr-2 h-4 w-4" />
                                View Submitter Breakdown
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleQuickAction('escalate', jd.jdId)}
                              >
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Escalate to Manager
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleQuickAction('notify', jd.jdId)}
                              >
                                <Send className="mr-2 h-4 w-4" />
                                Notify Primary
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredJDs.length === 0 && (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No JD ownerships found</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {filteredJDs.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredJDs.length)} of {filteredJDs.length}
                </span>
              </div>

              {/* Pagination controls */}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {/* Add ellipsis if there's a gap */}
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reassign Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Primary Recruiter</DialogTitle>
            <DialogDescription>
              Set primary recruiter for "{selectedJD?.jdTitle}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Primary</label>
              <Badge variant="default">
                {selectedJD?.primaryRecruiter}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Primary</label>
              <Select value={newPrimaryId} onValueChange={setNewPrimaryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary recruiter" />
                </SelectTrigger>
                <SelectContent>
                  {recruiters.map((recruiter) => (
                    <SelectItem key={recruiter.id} value={recruiter.id}>
                      {recruiter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Collaborators</label>
              <div className="flex flex-wrap gap-2">
                {selectedJD?.collaborators.map((collaborator) => (
                  <Badge key={collaborator} variant="outline">
                    {collaborator}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Input placeholder="Reason for change" />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReassignDialog(false);
                setNewPrimaryId('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedJD && newPrimaryId) {
                  handleReassign(selectedJD.jdId, newPrimaryId);
                }
              }}
              disabled={!newPrimaryId}
            >
              Set Primary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Collaborators Dialog */}
      <Dialog open={showCollaboratorsDialog} onOpenChange={setShowCollaboratorsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Collaborators for {selectedJD?.jdTitle}</DialogTitle>
            <DialogDescription>
              Add or remove collaborators who can work on this JD
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Recruiter</label>
              <Badge variant="default">
                {selectedJD?.primaryRecruiter}
              </Badge>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Add Collaborators</label>
              <div className="flex gap-2">
                <Select value={tempCollaboratorId} onValueChange={setTempCollaboratorId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select collaborator to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {recruiters
                      .filter(r => {
                        // Filter out primary recruiter and already selected collaborators
                        const isPrimary = selectedJD && r.name === selectedJD.primaryRecruiter;
                        const isAlreadySelected = selectedCollaboratorIds.includes(r.id);
                        return !isPrimary && !isAlreadySelected;
                      })
                      .map((recruiter) => (
                        <SelectItem key={recruiter.id} value={recruiter.id}>
                          {recruiter.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddCollaborator}
                  disabled={!tempCollaboratorId}
                  size="sm"
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Current Collaborators</label>
              {selectedCollaboratorIds.length === 0 ? (
                <p className="text-sm text-muted-foreground">No collaborators added yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedCollaboratorIds.map((id) => {
                    const recruiter = recruiters.find(r => r.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="gap-1">
                        {recruiter?.name || 'Unknown'}
                        <button
                          type="button"
                          onClick={() => handleRemoveCollaborator(id)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCollaboratorsDialog(false);
                setSelectedCollaboratorIds([]);
                setTempCollaboratorId('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCollaborators}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Submission Cap Dialog */}
      <Dialog open={showSubmissionCapDialog} onOpenChange={setShowSubmissionCapDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Submission Cap</DialogTitle>
            <DialogDescription>
              Set the daily submission limit per recruiter for "{selectedJD?.jdTitle}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Cap</label>
              <Badge variant="default">
                {selectedJD?.perRecruiterSubmissionCap} submissions/day
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Cap (1-999)</label>
              <Input
                type="number"
                min="1"
                max="999"
                value={newSubmissionCap}
                onChange={(e) => setNewSubmissionCap(parseInt(e.target.value) || 1)}
                placeholder="Enter submission cap"
              />
              <p className="text-xs text-muted-foreground">
                This limits how many candidates each recruiter can submit per day for this JD.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubmissionCapDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSubmissionCap}>
              Save Cap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Reassign Dialog */}
      <Dialog open={showBulkReassignDialog} onOpenChange={setShowBulkReassignDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bulk Reassign JDs</DialogTitle>
            <DialogDescription>
              Update primary recruiter and/or collaborators for {selectedJDs.length} selected JD{selectedJDs.length > 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Show affected JDs */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Affected JDs ({selectedJDs.length})</label>
              <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                {jdOwnerships
                  .filter(jd => selectedJDs.includes(jd.jdId))
                  .map(jd => (
                    <div key={jd.jdId} className="text-xs flex items-center justify-between py-1">
                      <span className="font-mono">{jd.jdId}</span>
                      <span className="text-muted-foreground truncate max-w-[200px]">{jd.jdTitle}</span>
                      <Badge variant="outline" className="text-xs">{jd.primaryRecruiter}</Badge>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Primary Recruiter Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Set Primary Recruiter (Optional)</label>
              <Select value={bulkNewPrimaryId} onValueChange={setBulkNewPrimaryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary recruiter (leave empty to keep current)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Keep Current Primary</SelectItem>
                  {recruiters.map((recruiter) => (
                    <SelectItem key={recruiter.id} value={recruiter.id}>
                      {recruiter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This will replace the primary recruiter for all selected JDs
              </p>
            </div>

            {/* Collaborators Update Mode */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Collaborators Update Mode</label>
              <Select value={bulkUpdateMode} onValueChange={(value: 'replace' | 'append') => setBulkUpdateMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="replace">Replace All Collaborators</SelectItem>
                  <SelectItem value="append">Add to Existing Collaborators</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {bulkUpdateMode === 'replace' 
                  ? 'This will replace all existing collaborators with the ones selected below'
                  : 'This will add the selected collaborators to existing ones (no duplicates)'
                }
              </p>
            </div>

            {/* Collaborators Management */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Add Collaborators (Optional)</label>
              <div className="flex gap-2">
                <Select value={bulkTempCollaboratorId} onValueChange={setBulkTempCollaboratorId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select collaborator to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {recruiters
                      .filter(r => {
                        const isNewPrimary = bulkNewPrimaryId && r.id === bulkNewPrimaryId;
                        const isAlreadySelected = bulkCollaboratorIds.includes(r.id);
                        return !isNewPrimary && !isAlreadySelected;
                      })
                      .map((recruiter) => (
                        <SelectItem key={recruiter.id} value={recruiter.id}>
                          {recruiter.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddBulkCollaborator}
                  disabled={!bulkTempCollaboratorId}
                  size="sm"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Selected Collaborators Display */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Selected Collaborators</label>
              {bulkCollaboratorIds.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No collaborators selected (existing collaborators will be {bulkUpdateMode === 'replace' ? 'removed' : 'kept'})
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {bulkCollaboratorIds.map((id) => {
                    const recruiter = recruiters.find(r => r.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="gap-1">
                        {recruiter?.name || 'Unknown'}
                        <button
                          type="button"
                          onClick={() => handleRemoveBulkCollaborator(id)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Warning/Info Message */}
            {(bulkNewPrimaryId || bulkCollaboratorIds.length > 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <p className="text-xs text-amber-800">
                  <strong>⚠️ Warning:</strong> This action will affect {selectedJDs.length} JD{selectedJDs.length > 1 ? 's' : ''}. 
                  {bulkNewPrimaryId && ' Primary recruiters will be updated.'}
                  {bulkCollaboratorIds.length > 0 && ` Collaborators will be ${bulkUpdateMode === 'replace' ? 'replaced' : 'added'}.`}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkReassignDialog(false);
                setBulkNewPrimaryId('');
                setBulkCollaboratorIds([]);
                setBulkTempCollaboratorId('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkReassign}
              disabled={!bulkNewPrimaryId && bulkCollaboratorIds.length === 0}
            >
              Update {selectedJDs.length} JD{selectedJDs.length > 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}