import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, UserCog, Users } from 'lucide-react';
import { ownershipService } from '@/services/ownershipService';
import { TalentPoolOwnership } from '@/types/ownership';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function TalentPoolsOwnershipTab() {
  const [pools, setPools] = useState<TalentPoolOwnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOwnerDialog, setEditOwnerDialog] = useState<{
    open: boolean;
    pool: TalentPoolOwnership | null;
  }>({ open: false, pool: null });
  const [viewCandidatesDialog, setViewCandidatesDialog] = useState<{
    open: boolean;
    pool: TalentPoolOwnership | null;
  }>({ open: false, pool: null });
  const [recruiters, setRecruiters] = useState<Array<{ id: string; name: string }>>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    setLoading(true);
    try {
      const data = await ownershipService.getTalentPoolOwnerships();
      setPools(data);
    } catch (error) {
      console.error('Failed to load talent pools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditOwner = async (pool: TalentPoolOwnership) => {
    try {
      const recruitersList = await ownershipService.getRecruiters();
      setRecruiters(recruitersList);
      setSelectedOwner(pool.owner !== 'Multiple Owners' && pool.owner !== 'Unassigned' ? pool.owner : '');
      setEditOwnerDialog({ open: true, pool });
    } catch (error) {
      console.error('Failed to fetch recruiters:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recruiters',
        variant: 'destructive',
      });
    }
  };

  const handleViewCandidates = async (pool: TalentPoolOwnership) => {
    try {
      const candidatesList = await ownershipService.getCandidatesByPoolTag(pool.poolName);
      setCandidates(candidatesList);
      setViewCandidatesDialog({ open: true, pool });
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load candidates',
        variant: 'destructive',
      });
    }
  };

  const handleSaveOwner = async () => {
    if (!editOwnerDialog.pool || !selectedOwner) return;

    setSaving(true);
    try {
      await ownershipService.updatePoolOwner(editOwnerDialog.pool.poolName, selectedOwner);
      toast({
        title: 'Success',
        description: 'Owner updated successfully',
      });
      setEditOwnerDialog({ open: false, pool: null });
      loadPools();
    } catch (error) {
      console.error('Failed to update owner:', error);
      toast({
        title: 'Error',
        description: 'Failed to update owner',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Talent Pool Ownership</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage access controls and ownership for talent pools
          </p>
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
                    <th className="text-left p-2">Pool Name</th>
                    <th className="text-left p-2">Owner</th>
                    <th className="text-left p-2">Candidates</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pools.map((pool) => (
                    <tr key={pool.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{pool.poolName}</td>
                      <td className="p-2">{pool.owner}</td>
                      <td className="p-2">{pool.candidateCount}</td>
                      <td className="p-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEditOwner(pool)}>
                              <UserCog className="mr-2 h-4 w-4" />
                              Edit Owner
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewCandidates(pool)}>
                              <Users className="mr-2 h-4 w-4" />
                              View Candidates
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

      <Dialog open={editOwnerDialog.open} onOpenChange={(open) => setEditOwnerDialog({ ...editOwnerDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Owner</DialogTitle>
            <DialogDescription>
              Change the owner for pool: {editOwnerDialog.pool?.poolName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Select Recruiter</Label>
              <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a recruiter" />
                </SelectTrigger>
                <SelectContent>
                  {recruiters.map(recruiter => (
                    <SelectItem key={recruiter.id} value={recruiter.name}>
                      {recruiter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOwnerDialog({ open: false, pool: null })}>
              Cancel
            </Button>
            <Button onClick={handleSaveOwner} disabled={!selectedOwner || saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewCandidatesDialog.open} onOpenChange={(open) => setViewCandidatesDialog({ ...viewCandidatesDialog, open })}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Candidates in {viewCandidatesDialog.pool?.poolName}</DialogTitle>
            <DialogDescription>
              Total: {candidates.length} candidates
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Phone</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Experience</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(candidate => (
                  <tr key={candidate.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{candidate.name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'N/A'}</td>
                    <td className="p-2">{candidate.email}</td>
                    <td className="p-2">{candidate.phone || 'N/A'}</td>
                    <td className="p-2">
                      <Badge variant="secondary">{candidate.status}</Badge>
                    </td>
                    <td className="p-2">{candidate.experience} yrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setViewCandidatesDialog({ open: false, pool: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}