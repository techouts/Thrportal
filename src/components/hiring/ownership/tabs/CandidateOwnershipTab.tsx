import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, UserX, Users, Link2, Unlink, MoreHorizontal } from 'lucide-react';
import { ownershipService } from '@/services/ownershipService';
import { CandidateOwnership, CandidateStage } from '@/types/ownership';
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

export function CandidateOwnershipTab() {
  const [candidateOwnerships, setCandidateOwnerships] = useState<CandidateOwnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateOwnership | null>(null);

  useEffect(() => {
    loadCandidateOwnerships();
  }, []);

  const loadCandidateOwnerships = async () => {
    setLoading(true);
    try {
      const data = await ownershipService.getCandidateOwnerships();
      setCandidateOwnerships(data);
    } catch (error) {
      console.error('Failed to load candidate ownerships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async (candidateId: string, newOwnerId: string, reason?: string) => {
    try {
      await ownershipService.reassignCandidate(candidateId, newOwnerId, reason);
      loadCandidateOwnerships();
      setShowReassignDialog(false);
    } catch (error) {
      console.error('Failed to reassign candidate:', error);
    }
  };

  const handleBulkReassign = async () => {
    try {
      await ownershipService.bulkReassign({
        operation: 'REASSIGN',
        resourceIds: selectedCandidates,
        targetOwnerId: 'recruiter-1', // Mock target
        reason: 'Bulk reassignment for workload balancing'
      });
      loadCandidateOwnerships();
      setSelectedCandidates([]);
    } catch (error) {
      console.error('Failed to bulk reassign:', error);
    }
  };

  const getStageBadgeVariant = (stage: CandidateStage) => {
    switch (stage) {
      case 'New': return 'secondary';
      case 'Shortlisted': return 'default';
      case 'Submitted': return 'default';
      case 'Interview': return 'default';
      case 'Offer': return 'default';
      case 'Joined': return 'default';
      case 'Rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const filteredCandidates = candidateOwnerships.filter(candidate =>
    candidate.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.recruiterOwner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.jdLinks.some(jd => jd.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Candidate Ownership Management</CardTitle>
            <div className="flex items-center gap-2">
              {selectedCandidates.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleBulkReassign}>
                  <UserX className="mr-2 h-4 w-4" />
                  Bulk Reassign ({selectedCandidates.length})
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Link2 className="mr-2 h-4 w-4" />
                Bulk Link to JDs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by candidate name, recruiter, or JD..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                <SelectItem value="Interview">Interview</SelectItem>
                <SelectItem value="Offer">Offer</SelectItem>
                <SelectItem value="Joined">Joined</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Recruiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recruiters</SelectItem>
                <SelectItem value="recruiter-1">Sarah Johnson</SelectItem>
                <SelectItem value="recruiter-2">David Chen</SelectItem>
                <SelectItem value="recruiter-3">Emily Davis</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Ownership Table */}
      <Card>
        <CardHeader>
          <CardTitle>Candidates ({filteredCandidates.length})</CardTitle>
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
                        checked={selectedCandidates.length === filteredCandidates.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCandidates(filteredCandidates.map(c => c.candidateId));
                          } else {
                            setSelectedCandidates([]);
                          }
                        }}
                      />
                    </th>
                    <th className="text-left p-2">Candidate Name</th>
                    <th className="text-left p-2">Recruiter Owner</th>
                    <th className="text-left p-2">JD Link(s)</th>
                    <th className="text-left p-2">Current Stage</th>
                    <th className="text-left p-2">Last Updated</th>
                    <th className="text-left p-2">Assigned Since</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <Checkbox
                          checked={selectedCandidates.includes(candidate.candidateId)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCandidates([...selectedCandidates, candidate.candidateId]);
                            } else {
                              setSelectedCandidates(selectedCandidates.filter(id => id !== candidate.candidateId));
                            }
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{candidate.candidateName}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {candidate.candidateId}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">{candidate.recruiterOwner}</Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {candidate.jdLinks.map((jdId) => (
                            <Badge key={jdId} variant="secondary" className="text-xs">
                              {jdId}
                            </Badge>
                          ))}
                          {candidate.jdLinks.length === 0 && (
                            <span className="text-xs text-muted-foreground">No JD linked</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant={getStageBadgeVariant(candidate.currentStage)}>
                          {candidate.currentStage}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm">
                        {new Date(candidate.lastUpdated).toLocaleDateString()}
                      </td>
                      <td className="p-2 text-sm">
                        {Math.floor((Date.now() - new Date(candidate.assignedAt).getTime()) / (1000 * 60 * 60 * 24))} days
                      </td>
                      <td className="p-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCandidate(candidate);
                                setShowReassignDialog(true);
                              }}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Reassign Recruiter
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link2 className="mr-2 h-4 w-4" />
                              Link to JD
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Unlink className="mr-2 h-4 w-4" />
                              Unlink from JD
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              View History
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCandidates.length === 0 && (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No candidate ownerships found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reassign Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reassign Candidate</DialogTitle>
            <DialogDescription>
              Reassign "{selectedCandidate?.candidateName}" to a new recruiter
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Recruiter</label>
              <Badge variant="outline">{selectedCandidate?.recruiterOwner}</Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Recruiter</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select new recruiter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recruiter-1">Sarah Johnson</SelectItem>
                  <SelectItem value="recruiter-2">David Chen</SelectItem>
                  <SelectItem value="recruiter-3">Emily Davis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Input placeholder="Reason for reassignment" />
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
                if (selectedCandidate) {
                  handleReassign(selectedCandidate.candidateId, 'recruiter-1', 'Workload balancing');
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