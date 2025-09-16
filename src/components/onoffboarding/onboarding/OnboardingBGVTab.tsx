import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OnOffboardingService } from '@/services/onoffboardingService';
import type { BGVCase } from '@/types/onoffboarding';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  Search,
  Filter
} from 'lucide-react';

export const OnboardingBGVTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [bgvCases, setBgvCases] = useState<BGVCase[]>([]);
  const [stats, setStats] = useState<any>({});
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [vendor, setVendor] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadBGVData();
  }, []);

  const loadBGVData = async () => {
    try {
      const [casesResponse, statsResponse] = await Promise.all([
        OnOffboardingService.getBGVCases(),
        OnOffboardingService.getBGVStats()
      ]);

      if (casesResponse.success) {
        setBgvCases(casesResponse.data);
      }
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading BGV data:', error);
      toast({
        title: "Error",
        description: "Failed to load BGV data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'initiated': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'inconclusive': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCheckStatusIcon = (status: string) => {
    switch (status) {
      case 'clear': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'adverse': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getOverallResultColor = (result: string) => {
    switch (result) {
      case 'clear': return 'text-green-600';
      case 'adverse': return 'text-red-600';
      case 'inconclusive': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const filteredCases = bgvCases.filter(bgvCase => {
    const matchesSearch = bgvCase.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bgvCase.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bgvCase.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filter === 'all' || bgvCase.status === filter;
    const matchesVendor = vendor === 'all' || bgvCase.vendor === vendor;
    
    return matchesSearch && matchesStatus && matchesVendor;
  });

  const caseCounts = {
    all: bgvCases.length,
    initiated: bgvCases.filter(c => c.status === 'initiated').length,
    in_progress: bgvCases.filter(c => c.status === 'in_progress').length,
    verified: bgvCases.filter(c => c.status === 'verified').length,
    failed: bgvCases.filter(c => c.status === 'failed').length,
    inconclusive: bgvCases.filter(c => c.status === 'inconclusive').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Background Verification</h3>
          <p className="text-sm text-muted-foreground">
            Monitor BGV progress, costs, and compliance
          </p>
        </div>
        <Button variant="outline" onClick={loadBGVData}>
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="cases">BGV Cases</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* BGV Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingVerifications || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingIncrease > 0 ? (
                    <span className="text-red-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +{stats.pendingIncrease}% from last week
                    </span>
                  ) : (
                    <span className="text-green-600 flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      {stats.pendingIncrease}% from last week
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg TAT (Days)</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgTAT || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Target: 7 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.failureRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.failedCases || 0} failed out of {stats.totalCases || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalCost?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Avg ₹{stats.avgCostPerCase || 0} per case
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(caseCounts).map(([status, count]) => (
              <Card key={status} className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {status.replace('_', ' ')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Vendor Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Performance</CardTitle>
              <CardDescription>Compare BGV vendors by TAT, cost, and success rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.vendorPerformance?.map((vendor: any) => (
                  <div key={vendor.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{vendor.name}</div>
                      <div className="text-sm text-muted-foreground">{vendor.casesHandled} cases</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{vendor.avgTAT} days</div>
                        <div className="text-muted-foreground">Avg TAT</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">₹{vendor.avgCost}</div>
                        <div className="text-muted-foreground">Avg Cost</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">{vendor.successRate}%</div>
                        <div className="text-muted-foreground">Success Rate</div>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-4 text-muted-foreground">
                    No vendor data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <Label htmlFor="search">Search Cases</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="initiated">Initiated</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="inconclusive">Inconclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vendor-filter">Vendor</Label>
              <Select value={vendor} onValueChange={setVendor}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  <SelectItem value="AuthBridge">AuthBridge</SelectItem>
                  <SelectItem value="IDfy">IDfy</SelectItem>
                  <SelectItem value="SpringVerify">SpringVerify</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* BGV Cases */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((bgvCase) => (
              <Card key={bgvCase.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{bgvCase.candidateName}</CardTitle>
                      <CardDescription className="text-sm">
                        {bgvCase.position} • {bgvCase.department}
                      </CardDescription>
                      <div className="text-xs text-muted-foreground mt-1">
                        {bgvCase.email}
                      </div>
                    </div>
                    <Badge className={getStatusColor(bgvCase.status)}>
                      {bgvCase.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  {bgvCase.escalated && (
                    <Badge variant="destructive" className="w-fit">
                      Escalated
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Case Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Vendor</div>
                      <div className="font-medium">{bgvCase.vendor}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Package</div>
                      <div className="font-medium">{bgvCase.package}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">TAT</div>
                      <div className="font-medium">{bgvCase.tat} days</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Cost</div>
                      <div className="font-medium">₹{bgvCase.cost}</div>
                    </div>
                  </div>

                  {/* Verification Checks */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Verification Checks</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Identity</span>
                        {getCheckStatusIcon(bgvCase.checks.identity)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Education</span>
                        {getCheckStatusIcon(bgvCase.checks.education)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Employment</span>
                        {getCheckStatusIcon(bgvCase.checks.employment)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Criminal</span>
                        {getCheckStatusIcon(bgvCase.checks.criminal)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Reference</span>
                        {getCheckStatusIcon(bgvCase.checks.reference)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Address</span>
                        {getCheckStatusIcon(bgvCase.checks.address)}
                      </div>
                    </div>
                  </div>

                  {/* Overall Result */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Overall Result</span>
                    <span className={`text-sm font-bold ${getOverallResultColor(bgvCase.overallResult)}`}>
                      {bgvCase.overallResult.toUpperCase()}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Initiated: {bgvCase.initiatedDate}</div>
                    {bgvCase.completedDate && (
                      <div>Completed: {bgvCase.completedDate}</div>
                    )}
                  </div>

                  {/* Comments */}
                  {bgvCase.comments && (
                    <div className="text-xs">
                      <div className="text-muted-foreground">Comments:</div>
                      <div className="mt-1 p-2 bg-muted rounded text-xs">
                        {bgvCase.comments}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    {bgvCase.status === 'in_progress' && (
                      <Button size="sm" variant="secondary">
                        Follow Up
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCases.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No BGV cases found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filter !== 'all' || vendor !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'No background verification cases initiated yet.'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>BGV Reports</CardTitle>
              <CardDescription>Generate detailed reports for compliance and analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex flex-col items-center gap-2">
                  <FileText className="h-6 w-6" />
                  <span>Monthly BGV Report</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>Vendor Performance</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center gap-2">
                  <DollarSign className="h-6 w-6" />
                  <span>Cost Analysis</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center gap-2">
                  <AlertTriangle className="h-6 w-6" />
                  <span>Failed Cases Report</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center gap-2">
                  <Clock className="h-6 w-6" />
                  <span>TAT Analysis</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center gap-2">
                  <Shield className="h-6 w-6" />
                  <span>Compliance Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};