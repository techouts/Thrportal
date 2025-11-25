import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, Download, Search, Filter } from 'lucide-react';

interface ComplianceRecord {
  candidateId: string;
  candidateName: string;
  consentStatus: 'Provided' | 'Not Provided' | 'Expired';
  consentDate?: string;
  gdprCompliant: boolean;
  bgvStatus: 'Not Initiated' | 'In Progress' | 'Completed' | 'Failed';
  dataRetention: 'Active' | 'Scheduled for Deletion' | 'Deleted';
  lastUpdated: string;
  recruiterCollected: string;
}

export function CandidateComplianceTab() {
  const [complianceData, setComplianceData] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [consentFilter, setConsentFilter] = useState<string>('all');

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    setLoading(true);
    // Mock data
    const mockData: ComplianceRecord[] = [
      {
        candidateId: 'candidate-1',
        candidateName: 'John Smith',
        consentStatus: 'Provided',
        consentDate: '2024-01-10',
        gdprCompliant: true,
        bgvStatus: 'Completed',
        dataRetention: 'Active',
        lastUpdated: '2024-01-15',
        recruiterCollected: 'Sarah Johnson'
      },
      {
        candidateId: 'candidate-2',
        candidateName: 'Emily Chen',
        consentStatus: 'Provided',
        consentDate: '2024-01-08',
        gdprCompliant: true,
        bgvStatus: 'In Progress',
        dataRetention: 'Active',
        lastUpdated: '2024-01-14',
        recruiterCollected: 'Mike Rodriguez'
      },
      {
        candidateId: 'candidate-3',
        candidateName: 'David Wilson',
        consentStatus: 'Not Provided',
        gdprCompliant: false,
        bgvStatus: 'Not Initiated',
        dataRetention: 'Scheduled for Deletion',
        lastUpdated: '2024-01-13',
        recruiterCollected: 'Lisa Thompson'
      }
    ];
    setComplianceData(mockData);
    setLoading(false);
  };

  const getConsentBadge = (status: string) => {
    switch (status) {
      case 'Provided':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" />Provided</Badge>;
      case 'Expired':
        return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />Expired</Badge>;
      default:
        return <Badge variant="secondary"><XCircle className="mr-1 h-3 w-3" />Not Provided</Badge>;
    }
  };

  const filteredData = complianceData.filter(record => {
    const matchesSearch = record.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.candidateId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesConsent = consentFilter === 'all' || record.consentStatus === consentFilter;
    
    return matchesSearch && matchesConsent;
  });

  const complianceStats = {
    totalCandidates: complianceData.length,
    withConsent: complianceData.filter(r => r.consentStatus === 'Provided').length,
    gdprCompliant: complianceData.filter(r => r.gdprCompliant).length,
    bgvCompleted: complianceData.filter(r => r.bgvStatus === 'Completed').length,
    scheduledForDeletion: complianceData.filter(r => r.dataRetention === 'Scheduled for Deletion').length
  };

  return (
    <div className="space-y-6">
      {/* Compliance Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.totalCandidates}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">With Consent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{complianceStats.withConsent}</div>
            <p className="text-xs text-muted-foreground">
              {((complianceStats.withConsent / complianceStats.totalCandidates) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">GDPR Compliant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{complianceStats.gdprCompliant}</div>
            <p className="text-xs text-muted-foreground">
              {((complianceStats.gdprCompliant / complianceStats.totalCandidates) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">BGV Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{complianceStats.bgvCompleted}</div>
            <p className="text-xs text-muted-foreground">
              {((complianceStats.bgvCompleted / complianceStats.totalCandidates) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Deletion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{complianceStats.scheduledForDeletion}</div>
            <p className="text-xs text-muted-foreground">Data retention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tracker" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tracker">Consent Tracker</TabsTrigger>
          <TabsTrigger value="purge">Data Purge</TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Consent Tracker</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={consentFilter} onValueChange={setConsentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Consent Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Consent Status</SelectItem>
                    <SelectItem value="Provided">Provided</SelectItem>
                    <SelectItem value="Not Provided">Not Provided</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Compliance Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Candidate</th>
                      <th className="text-left p-3 font-medium">Consent Status</th>
                      <th className="text-left p-3 font-medium">Consent Date</th>
                      <th className="text-left p-3 font-medium">GDPR</th>
                      <th className="text-left p-3 font-medium">Data Retention</th>
                      <th className="text-left p-3 font-medium">Collected By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((record) => (
                      <tr key={record.candidateId} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{record.candidateName}</div>
                            <div className="text-sm text-muted-foreground">{record.candidateId}</div>
                          </div>
                        </td>
                        <td className="p-3">{getConsentBadge(record.consentStatus)}</td>
                        <td className="p-3 text-sm">{record.consentDate || '-'}</td>
                        <td className="p-3">
                          {record.gdprCompliant ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="mr-1 h-3 w-3" />Yes
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="mr-1 h-3 w-3" />No
                            </Badge>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge variant={record.dataRetention === 'Active' ? 'default' : 'destructive'}>
                            {record.dataRetention}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">{record.recruiterCollected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purge" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Purge Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Auto-delete inactive candidates after:</label>
                    <Select defaultValue="6">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 months</SelectItem>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      Preview Deletion Queue
                    </Button>
                    <Button variant="destructive" className="w-full">
                      Execute Data Purge
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/20">
                    <h4 className="font-medium mb-2">Purge Statistics</h4>
                    <div className="space-y-1 text-sm">
                      <div>Candidates scheduled for deletion: <span className="font-medium">8</span></div>
                      <div>Last purge executed: <span className="font-medium">2024-01-01</span></div>
                      <div>Total records purged: <span className="font-medium">156</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}