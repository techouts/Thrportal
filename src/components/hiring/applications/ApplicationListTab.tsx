import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus, MoreHorizontal, Eye, UserX, RefreshCw, AlertTriangle } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Application {
  id: string;
  candidateName: string;
  candidateId: string;
  jdTitle: string;
  jdId: string;
  client: string;
  submitterRecruiter: string;
  primaryRecruiter: string;
  stage: 'Submitted' | 'Shortlisted' | 'Interview Scheduled' | 'Interview Completed' | 'Offer Extended' | 'Offer Accepted' | 'Joined' | 'Rejected' | 'Withdrawn';
  slaStatus: 'On Track' | 'At Risk' | 'Overdue';
  lastUpdated: string;
  submittedAt: string;
  currentStage: string;
  feedback?: string;
}

interface ApplicationListTabProps {
  onViewApplication: (applicationId: string) => void;
}

export function ApplicationListTab({ onViewApplication }: ApplicationListTabProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    jd: '',
    client: '',
    recruiter: '',
    stage: '',
    slaStatus: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState<'all' | 'open' | 'closed'>('all');

  useEffect(() => {
    loadApplications();
  }, [filters, activeView]);

  const loadApplications = async () => {
    setLoading(true);
    // Mock data
    const mockApplications: Application[] = [
      {
        id: 'app-001',
        candidateName: 'John Smith',
        candidateId: 'candidate-1',
        jdTitle: 'Senior React Developer',
        jdId: 'jd-001',
        client: 'TechCorp Inc',
        submitterRecruiter: 'Sarah Johnson',
        primaryRecruiter: 'Mike Rodriguez',
        stage: 'Interview Scheduled',
        slaStatus: 'On Track',
        lastUpdated: '2024-01-15T10:30:00Z',
        submittedAt: '2024-01-10T09:00:00Z',
        currentStage: 'Technical Interview scheduled for Jan 16'
      },
      {
        id: 'app-002',
        candidateName: 'Emily Chen',
        candidateId: 'candidate-2',
        jdTitle: 'Python Backend Engineer',
        jdId: 'jd-002',
        client: 'DataFlow Solutions',
        submitterRecruiter: 'Lisa Thompson',
        primaryRecruiter: 'Lisa Thompson',
        stage: 'Shortlisted',
        slaStatus: 'At Risk',
        lastUpdated: '2024-01-14T14:20:00Z',
        submittedAt: '2024-01-08T11:15:00Z',
        currentStage: 'Pending client feedback'
      },
      {
        id: 'app-003',
        candidateName: 'David Wilson',
        candidateId: 'candidate-3',
        jdTitle: 'Full Stack Developer',
        jdId: 'jd-003',
        client: 'StartupXYZ',
        submitterRecruiter: 'John Anderson',
        primaryRecruiter: 'Sarah Johnson',
        stage: 'Offer Extended',
        slaStatus: 'On Track',
        lastUpdated: '2024-01-13T16:45:00Z',
        submittedAt: '2024-01-05T08:30:00Z',
        currentStage: 'Offer pending candidate response'
      },
      {
        id: 'app-004',
        candidateName: 'Sarah Davis',
        candidateId: 'candidate-4',
        jdTitle: 'DevOps Engineer',
        jdId: 'jd-004',
        client: 'CloudTech Ltd',
        submitterRecruiter: 'Mike Rodriguez',
        primaryRecruiter: 'John Anderson',
        stage: 'Submitted',
        slaStatus: 'Overdue',
        lastUpdated: '2024-01-05T12:15:00Z',
        submittedAt: '2024-01-05T12:15:00Z',
        currentStage: 'Awaiting initial review'
      },
      {
        id: 'app-005',
        candidateName: 'Michael Brown',
        candidateId: 'candidate-5',
        jdTitle: 'Senior Java Developer',
        jdId: 'jd-005',
        client: 'Enterprise Solutions',
        submitterRecruiter: 'Sarah Johnson',
        primaryRecruiter: 'Lisa Thompson',
        stage: 'Joined',
        slaStatus: 'On Track',
        lastUpdated: '2024-01-11T09:30:00Z',
        submittedAt: '2024-01-01T10:00:00Z',
        currentStage: 'Successfully onboarded'
      }
    ];
    
    setApplications(mockApplications);
    setLoading(false);
  };

  const getStageBadgeVariant = (stage: string) => {
    switch (stage) {
      case 'Submitted': return 'secondary';
      case 'Shortlisted': return 'default';
      case 'Interview Scheduled': return 'default';
      case 'Interview Completed': return 'default';
      case 'Offer Extended': return 'default';
      case 'Offer Accepted': return 'default';
      case 'Joined': return 'default';
      case 'Rejected': return 'destructive';
      case 'Withdrawn': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSLABadgeVariant = (status: string) => {
    switch (status) {
      case 'On Track': return 'default';
      case 'At Risk': return 'secondary';
      case 'Overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.jdTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.client.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesView = activeView === 'all' || 
                       (activeView === 'open' && !['Joined', 'Rejected', 'Withdrawn'].includes(app.stage)) ||
                       (activeView === 'closed' && ['Joined', 'Rejected', 'Withdrawn'].includes(app.stage));
    
    return matchesSearch && matchesView;
  });

  const getRowHighlight = (app: Application) => {
    if (app.slaStatus === 'Overdue') return 'bg-red-50 border-red-200';
    if (app.slaStatus === 'At Risk') return 'bg-amber-50 border-amber-200';
    return '';
  };

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
              <Button variant="default" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Application
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* View Tabs */}
          <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
            <Button 
              variant={activeView === 'all' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setActiveView('all')}
            >
              All Applications
            </Button>
            <Button 
              variant={activeView === 'open' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setActiveView('open')}
            >
              Open Applications <Badge variant="secondary" className="ml-1">4</Badge>
            </Button>
            <Button 
              variant={activeView === 'closed' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setActiveView('closed')}
            >
              Closed Applications <Badge variant="secondary" className="ml-1">1</Badge>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by candidate name, JD title, or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => loadApplications()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 border rounded-lg bg-muted/20">
              <div className="space-y-2">
                <label className="text-sm font-medium">JD</label>
                <Select value={filters.jd} onValueChange={(value) => setFilters(prev => ({ ...prev, jd: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select JD" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All JDs</SelectItem>
                    <SelectItem value="jd-001">Senior React Developer</SelectItem>
                    <SelectItem value="jd-002">Python Backend Engineer</SelectItem>
                    <SelectItem value="jd-003">Full Stack Developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <Select value={filters.client} onValueChange={(value) => setFilters(prev => ({ ...prev, client: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="techcorp">TechCorp Inc</SelectItem>
                    <SelectItem value="dataflow">DataFlow Solutions</SelectItem>
                    <SelectItem value="startupxyz">StartupXYZ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Recruiter</label>
                <Select value={filters.recruiter} onValueChange={(value) => setFilters(prev => ({ ...prev, recruiter: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recruiter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Recruiters</SelectItem>
                    <SelectItem value="sarah">Sarah Johnson</SelectItem>
                    <SelectItem value="mike">Mike Rodriguez</SelectItem>
                    <SelectItem value="lisa">Lisa Thompson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Stage</label>
                <Select value={filters.stage} onValueChange={(value) => setFilters(prev => ({ ...prev, stage: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                    <SelectItem value="Offer Extended">Offer Extended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">SLA Status</label>
                <Select value={filters.slaStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, slaStatus: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select SLA status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All SLA Status</SelectItem>
                    <SelectItem value="On Track">On Track</SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                {filteredApplications.filter(app => app.slaStatus === 'Overdue').length} overdue
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Application ID</th>
                  <th className="text-left p-3 font-medium">Candidate Name</th>
                  <th className="text-left p-3 font-medium">JD Title</th>
                  <th className="text-left p-3 font-medium">Client</th>
                  <th className="text-left p-3 font-medium">Submitter</th>
                  <th className="text-left p-3 font-medium">Primary</th>
                  <th className="text-left p-3 font-medium">Stage</th>
                  <th className="text-left p-3 font-medium">SLA Status</th>
                  <th className="text-left p-3 font-medium">Last Updated</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application) => (
                  <tr 
                    key={application.id} 
                    className={`border-b hover:bg-muted/50 ${getRowHighlight(application)}`}
                  >
                    <td className="p-3">
                      <div className="font-mono text-sm">{application.id}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{application.candidateName}</div>
                      <div className="text-sm text-muted-foreground">{application.candidateId}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{application.jdTitle}</div>
                      <div className="text-sm text-muted-foreground">{application.jdId}</div>
                    </td>
                    <td className="p-3">{application.client}</td>
                    <td className="p-3">{application.submitterRecruiter}</td>
                    <td className="p-3">{application.primaryRecruiter}</td>
                    <td className="p-3">
                      <Badge variant={getStageBadgeVariant(application.stage)}>
                        {application.stage}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={getSLABadgeVariant(application.slaStatus)}>
                        {application.slaStatus}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{new Date(application.lastUpdated).toLocaleDateString()}</div>
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewApplication(application.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reassign
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserX className="mr-2 h-4 w-4" />
                            Withdraw
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}