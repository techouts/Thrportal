import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Download, 
  Plus, 
  Search, 
  Calendar,
  MoreHorizontal,
  Play,
  Edit,
  Copy,
  Trash2,
  BarChart3,
  FileText,
  Clock,
  Share2,
  Filter,
  TrendingUp
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchAndSort } from '@/components/shared/SearchAndSort';
import { AdvancedFilter } from '@/components/shared/AdvancedFilter';
import { useAdvancedFilter } from '@/hooks/useAdvancedFilter';
import { ReportBuilder, ReportConfig } from './ReportBuilder';
import { useAuth } from '@/auth/AuthContext';
import { useVisible } from '@/hooks/useVisible';
import { useToast } from '@/hooks/use-toast';

interface ReportsDashboardProps {
  className?: string;
}

export function ReportsDashboard({ className = "" }: ReportsDashboardProps) {
  const { can } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingReport, setEditingReport] = useState<ReportConfig | undefined>();
  const [reports, setReports] = useState<ReportConfig[]>([]);
  const [loading, setLoading] = useState(false);

  // Permission checks
  const canCreateReports = useVisible(['reports.create', 'reports.*']);
  const canEditReports = useVisible(['reports.edit', 'reports.*']);
  const canDeleteReports = useVisible(['reports.delete', 'reports.*']);
  const canRunReports = useVisible(['reports.run', 'reports.*']);
  const canScheduleReports = useVisible(['reports.schedule', 'reports.*']);
  const canExportReports = useVisible(['reports.export', 'reports.*']);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockReports: ReportConfig[] = [
        {
          id: 'rpt_001',
          name: 'Project Performance Summary',
          description: 'Monthly overview of all active projects including budget, timeline, and resource utilization',
          category: 'projects',
          fields: ['project_name', 'client_name', 'status', 'budget', 'ft_target'],
          filters: [],
          groupBy: ['status'],
          orderBy: [{ field: 'project_name', direction: 'asc' }],
          chartType: 'table',
          schedule: {
            enabled: true,
            frequency: 'monthly',
            recipients: ['pm@company.com'],
            format: 'pdf'
          },
          createdBy: 'user_001',
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-01-20T00:00:00Z',
          isPublic: true,
          tags: ['projects', 'monthly', 'performance']
        },
        {
          id: 'rpt_002',
          name: 'CRM Client Health Report',
          description: 'Client engagement metrics and health scores for account management',
          category: 'crm',
          fields: ['client_name', 'health_score', 'interaction_count', 'last_interaction'],
          filters: [{ field: 'health_score', operator: 'greater_than', value: 5 }],
          groupBy: ['industry'],
          orderBy: [{ field: 'health_score', direction: 'desc' }],
          chartType: 'bar',
          schedule: {
            enabled: false,
            frequency: 'weekly',
            recipients: [],
            format: 'csv'
          },
          createdBy: 'user_002',
          createdAt: '2024-01-10T00:00:00Z',
          updatedAt: '2024-01-18T00:00:00Z',
          isPublic: false,
          tags: ['crm', 'health', 'clients']
        },
        {
          id: 'rpt_003',
          name: 'Hiring Pipeline Analytics',
          description: 'Comprehensive hiring metrics including time-to-hire, cost-per-hire, and conversion rates',
          category: 'hiring',
          fields: ['jd_title', 'candidate_count', 'hire_count', 'closure_rate'],
          filters: [],
          groupBy: ['month'],
          orderBy: [{ field: 'closure_rate', direction: 'desc' }],
          chartType: 'line',
          schedule: {
            enabled: true,
            frequency: 'weekly',
            recipients: ['hr@company.com', 'hiring@company.com'],
            format: 'xlsx'
          },
          createdBy: 'user_003',
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-22T00:00:00Z',
          isPublic: true,
          tags: ['hiring', 'pipeline', 'weekly']
        }
      ];

      // Filter reports based on permissions
      const visibleReports = mockReports.filter(report => {
        if (report.category === 'finance' && !can('finance.reports.read')) {
          return false;
        }
        if (report.category === 'hiring' && !can('hiring.dashboard.read')) {
          return false;
        }
        return true;
      });

      setReports(visibleReports);
      setLoading(false);
    }, 500);
  };

  // Filter function for reports
  const reportFilterFunction = (report: ReportConfig, filters: any) => {
    const searchMatch = !searchQuery || 
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const categoryMatch = selectedCategory === 'all' || report.category === selectedCategory;

    return searchMatch && categoryMatch;
  };

  const {
    filteredData: filteredReports,
    getFilterStats
  } = useAdvancedFilter(reports, reportFilterFunction, {
    storageKey: 'reports_dashboard'
  });

  const handleCreateReport = () => {
    setEditingReport(undefined);
    setShowBuilder(true);
  };

  const handleEditReport = (report: ReportConfig) => {
    setEditingReport(report);
    setShowBuilder(true);
  };

  const handleSaveReport = (reportConfig: ReportConfig) => {
    if (editingReport) {
      // Update existing report
      setReports(prev => prev.map(r => r.id === reportConfig.id ? reportConfig : r));
      toast({
        title: 'Report Updated',
        description: `${reportConfig.name} has been updated successfully.`
      });
    } else {
      // Create new report
      setReports(prev => [...prev, reportConfig]);
      toast({
        title: 'Report Created',
        description: `${reportConfig.name} has been created successfully.`
      });
    }
    setShowBuilder(false);
    setEditingReport(undefined);
  };

  const handleRunReport = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    toast({
      title: 'Running Report',
      description: `Generating ${report.name}...`
    });

    // Simulate report generation
    setTimeout(() => {
      toast({
        title: 'Report Ready',
        description: `${report.name} has been generated successfully.`
      });
    }, 2000);
  };

  const handleDeleteReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    setReports(prev => prev.filter(r => r.id !== reportId));
    toast({
      title: 'Report Deleted',
      description: `${report.name} has been deleted.`,
      variant: 'destructive'
    });
  };

  const handleDuplicateReport = (report: ReportConfig) => {
    const duplicatedReport: ReportConfig = {
      ...report,
      id: `${report.id}_copy_${Date.now()}`,
      name: `${report.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setReports(prev => [...prev, duplicatedReport]);
    toast({
      title: 'Report Duplicated',
      description: `Created a copy of ${report.name}.`
    });
  };

  const getStatusBadge = (report: ReportConfig) => {
    if (report.schedule?.enabled) {
      return <Badge variant="default">Scheduled</Badge>;
    }
    return <Badge variant="outline">Manual</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'projects': return <BarChart3 className="h-4 w-4" />;
      case 'crm': return <TrendingUp className="h-4 w-4" />;
      case 'hiring': return <FileText className="h-4 w-4" />;
      case 'finance': return <TrendingUp className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (showBuilder) {
    return (
      <ReportBuilder
        reportConfig={editingReport}
        onSave={handleSaveReport}
        onCancel={() => setShowBuilder(false)}
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <PageHeader
        title="Reports & Analytics"
        description="Create, manage, and schedule comprehensive business reports"
        actions={
          canCreateReports ? (
            <Button onClick={handleCreateReport}>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          ) : undefined
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="public">Public Reports</TabsTrigger>
        </TabsList>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="projects">Projects</SelectItem>
              <SelectItem value="crm">CRM</SelectItem>
              <SelectItem value="hiring">Hiring</SelectItem>
              {can('finance.reports.read') && (
                <SelectItem value="finance">Finance</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(report.category)}
                          <span className="capitalize">{report.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(report)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(report.updatedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {report.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {report.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{report.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canRunReports && (
                              <DropdownMenuItem onClick={() => handleRunReport(report.id)}>
                                <Play className="h-4 w-4 mr-2" />
                                Run Report
                              </DropdownMenuItem>
                            )}
                            {canEditReports && (
                              <DropdownMenuItem onClick={() => handleEditReport(report)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDuplicateReport(report)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            {report.isPublic && (
                              <DropdownMenuItem>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {canDeleteReports && (
                              <DropdownMenuItem 
                                onClick={() => handleDeleteReport(report.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReports
                  .filter(report => report.schedule?.enabled)
                  .map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(report.category)}
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Every {report.schedule?.frequency} • {report.schedule?.format?.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">Active</Badge>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="public" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Public Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReports
                  .filter(report => report.isPublic)
                  .map((report) => (
                    <Card key={report.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(report.category)}
                          <CardTitle className="text-base">{report.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3">
                          {report.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex flex-wrap gap-1">
                            {report.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}