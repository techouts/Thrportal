import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, Lock, Unlock, Users, UserPlus, History, MoreHorizontal } from 'lucide-react';
import { ownershipService } from '@/services/ownershipService';
import { JDOwnership, JDStatus } from '@/types/ownership';
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

  useEffect(() => {
    loadJDOwnerships();
  }, []);

  const loadJDOwnerships = async () => {
    setLoading(true);
    try {
      const data = await ownershipService.getJDOwnerships();
      setJdOwnerships(data);
    } catch (error) {
      console.error('Failed to load JD ownerships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async (jdId: string, newOwners: string[]) => {
    try {
      await ownershipService.updateJDOwnership(jdId, {
        recruiterOwners: newOwners,
        updatedBy: 'current-user'
      });
      loadJDOwnerships();
      setShowReassignDialog(false);
    } catch (error) {
      console.error('Failed to reassign JD:', error);
    }
  };

  const handleLockToggle = async (jdId: string, isLocked: boolean) => {
    try {
      await ownershipService.updateJDOwnership(jdId, {
        isLocked: !isLocked,
        updatedBy: 'current-user'
      });
      loadJDOwnerships();
    } catch (error) {
      console.error('Failed to toggle lock:', error);
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

  const filteredJDs = jdOwnerships.filter(jd =>
    jd.jdTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jd.jdId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jd.recruiterOwners.some(owner => owner.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>JD Ownership Management</CardTitle>
            <div className="flex items-center gap-2">
              {selectedJDs.length > 0 && (
                <Button variant="outline" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Bulk Reassign ({selectedJDs.length})
                </Button>
              )}
              <Button variant="outline" size="sm">
                <History className="mr-2 h-4 w-4" />
                Change History
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
                placeholder="Search by JD ID, title, or recruiter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select>
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
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Staffing Manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Managers</SelectItem>
                <SelectItem value="manager-1">Mike Rodriguez</SelectItem>
                <SelectItem value="manager-2">Lisa Thompson</SelectItem>
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
                    <th className="text-left p-2">Recruiter Owner(s)</th>
                    <th className="text-left p-2">Staffing Manager</th>
                    <th className="text-left p-2">Client SPOC</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Lock Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJDs.map((jd) => (
                    <tr key={jd.id} className="border-b hover:bg-muted/50">
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
                        <div className="flex flex-wrap gap-1">
                          {jd.recruiterOwners.map((owner) => (
                            <Badge key={owner} variant="outline" className="text-xs">
                              {owner}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-2">{jd.staffingManager}</td>
                      <td className="p-2">{jd.clientSpoc}</td>
                      <td className="p-2">
                        <Badge variant={getStatusBadgeVariant(jd.status)}>
                          {jd.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLockToggle(jd.jdId, jd.isLocked)}
                          className="p-1"
                        >
                          {jd.isLocked ? (
                            <Lock className="h-4 w-4 text-red-500" />
                          ) : (
                            <Unlock className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
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
                                setSelectedJD(jd);
                                setShowReassignDialog(true);
                              }}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Reassign Recruiters
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              Change Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <History className="mr-2 h-4 w-4" />
                              View History
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
        </CardContent>
      </Card>

      {/* Reassign Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reassign JD Recruiters</DialogTitle>
            <DialogDescription>
              Reassign recruiters for "{selectedJD?.jdTitle}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Recruiters</label>
              <div className="flex flex-wrap gap-2">
                {selectedJD?.recruiterOwners.map((owner) => (
                  <Badge key={owner} variant="outline">
                    {owner}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Recruiters</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select recruiters" />
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
                if (selectedJD) {
                  handleReassign(selectedJD.jdId, ['recruiter-1']); // Mock reassignment
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