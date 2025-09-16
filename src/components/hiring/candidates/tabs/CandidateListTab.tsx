import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  UserPlus, 
  Archive, 
  MoreHorizontal,
  BrainCircuit,
  AlertTriangle
} from 'lucide-react';
import { candidatesService } from '@/services/candidatesService';
import { CandidateProfile, CandidateFilters, CandidateStatus, CandidateSource } from '@/types/candidates';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/shared/DataTable';
import { SmartUploadCandidatesModal } from '../shared/SmartUploadCandidatesModal';

interface CandidateListTabProps {
  onViewCandidate: (candidateId: string) => void;
}

export function CandidateListTab({ onViewCandidate }: CandidateListTabProps) {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'all'>('all');
  const [showSmartUpload, setShowSmartUpload] = useState(false);
  const [filters, setFilters] = useState<CandidateFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, [filters]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await candidatesService.getCandidates({
        ...filters,
        search: searchTerm
      });
      setCandidates(data);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const getStatusBadgeVariant = (status: CandidateStatus) => {
    switch (status) {
      case 'New': return 'secondary';
      case 'Shortlisted': return 'default';
      case 'Submitted': return 'default';
      case 'Interview Scheduled': return 'default';
      case 'Interview Completed': return 'default';
      case 'Offer Extended': return 'default';
      case 'Offer Accepted': return 'default';
      case 'Joined': return 'default';
      case 'Rejected': return 'destructive';
      case 'On Hold': return 'secondary';
      case 'Withdrawn': return 'secondary';
      default: return 'secondary';
    }
  };

  const columns = [
    {
      id: 'select',
      header: ({ table }: any) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: any) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: 'Candidate ID',
      cell: ({ row }: any) => (
        <div className="text-sm font-mono">{row.original.id}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => {
        const candidate = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{candidate.name}</div>
            <div className="text-sm text-muted-foreground">{candidate.email}</div>
            <div className="text-sm text-muted-foreground">{candidate.phone}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'skills',
      header: 'Skills',
      cell: ({ row }: any) => {
        const skills = row.original.skills.slice(0, 3);
        const remaining = row.original.skills.length - 3;
        return (
          <div className="space-y-1">
            <div className="flex flex-wrap gap-1">
              {skills.map((skill: string) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {remaining > 0 && (
                <Badge variant="outline" className="text-xs">
                  +{remaining} more
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'experience',
      header: 'Exp',
      cell: ({ row }: any) => `${row.original.experience}y`,
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.location}</div>
      ),
    },
    {
      accessorKey: 'recruiterOwner',
      header: 'Recruiter Owner',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.recruiterOwner || 'Unassigned'}</div>
      ),
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }: any) => (
        <Badge variant="outline">{row.original.source}</Badge>
      ),
    },
    {
      accessorKey: 'poolTags',
      header: 'Pool Tags',
      cell: ({ row }: any) => (
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">Frontend</Badge>
          <Badge variant="secondary" className="text-xs">Senior</Badge>
        </div>
      ),
    },
    {
      accessorKey: 'consent',
      header: 'Consent',
      cell: ({ row }: any) => (
        <Badge variant={row.original.consent ? 'default' : 'destructive'}>
          {row.original.consent ? 'Y' : 'N'}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={getStatusBadgeVariant(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'expectedCtc',
      header: 'Expected CTC',
      cell: ({ row }: any) => {
        const ctc = row.original.expectedCtc;
        return ctc ? `$${(ctc / 1000).toFixed(0)}K` : '-';
      },
    },
    {
      accessorKey: 'lastUpdated',
      header: 'Last Updated',
      cell: ({ row }: any) => {
        const date = new Date(row.original.lastUpdated);
        return date.toLocaleDateString();
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const candidate = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewCandidate(candidate.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Candidate
              </DropdownMenuItem>
              <DropdownMenuItem>
                Reassign Owner
              </DropdownMenuItem>
              <DropdownMenuItem>
                Add to Pool
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Search & Filters</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setShowSmartUpload(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <BrainCircuit className="mr-2 h-4 w-4" />
                Smart Upload
              </Button>
              <Button variant="outline" size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Candidate
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* View Tabs */}
          <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
            <Button 
              variant="default" 
              size="sm"
            >
              All Candidates
            </Button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, LinkedIn, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status?.[0] || 'all'} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : [value as CandidateStatus] }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                    <SelectItem value="Offer Extended">Offer Extended</SelectItem>
                    <SelectItem value="Joined">Joined</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Source</label>
                <Select value={filters.source?.[0] || 'all'} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, source: value === 'all' ? undefined : [value as CandidateSource] }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Job Board">Job Board</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Internal Pool">Internal Pool</SelectItem>
                    <SelectItem value="Direct Application">Direct Application</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Experience Range</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.experienceRange?.min || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      experienceRange: {
                        ...prev.experienceRange,
                        min: parseInt(e.target.value) || 0,
                        max: prev.experienceRange?.max || 20
                      }
                    }))}
                    className="w-20"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.experienceRange?.max || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      experienceRange: {
                        ...prev.experienceRange,
                        min: prev.experienceRange?.min || 0,
                        max: parseInt(e.target.value) || 20
                      }
                    }))}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="Enter location"
                  value={filters.location?.[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    location: e.target.value ? [e.target.value] : undefined
                  }))}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidate List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Candidates ({candidates.length})</CardTitle>
            {selectedCandidates.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedCandidates.length} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Reassign Owner
                  </Button>
                  <Button variant="outline" size="sm">
                    Add to Pool
                  </Button>
                  <Button variant="outline" size="sm">
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Candidate ID</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Location</th>
                  <th className="text-left p-2">Recruiter Owner</th>
                  <th className="text-left p-2">Source</th>
                  <th className="text-left p-2">Pool Tags</th>
                  <th className="text-left p-2">Consent</th>
                  <th className="text-left p-2">Last Updated</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => {
                  const isUnattended = new Date(candidate.lastUpdated) < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
                  return (
                    <tr 
                      key={candidate.id} 
                      className={`border-b hover:bg-muted/50 ${isUnattended ? 'bg-red-50 border-red-200' : ''}`}
                    >
                      <td className="p-2">
                        <div className="text-sm font-mono">{candidate.id}</div>
                      </td>
                      <td className="p-2">
                        <div>{candidate.name}</div>
                        <div className="text-sm text-muted-foreground">{candidate.email}</div>
                        <div className="text-sm text-muted-foreground">{candidate.phone}</div>
                      </td>
                      <td className="p-2">{candidate.location}</td>
                      <td className="p-2">
                        <div className="text-sm">{candidate.recruiterOwner || 'Unassigned'}</div>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">{candidate.source}</Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">Frontend</Badge>
                          <Badge variant="secondary" className="text-xs">Senior</Badge>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant={candidate.consent ? 'default' : 'destructive'}>
                          {candidate.consent ? 'Y' : 'N'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="text-sm">{new Date(candidate.lastUpdated).toLocaleDateString()}</div>
                      </td>
                      <td className="p-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onViewCandidate(candidate.id)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Smart Upload Modal */}
      <SmartUploadCandidatesModal
        open={showSmartUpload}
        onClose={() => setShowSmartUpload(false)}
      />
    </div>
  );
}