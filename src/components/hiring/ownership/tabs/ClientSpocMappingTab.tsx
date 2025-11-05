import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, TrendingUp, AlertTriangle, CheckCircle, Users, FileText, Plus } from 'lucide-react';
import { ClientSpocMapping } from '@/types/ownership';
import { ClientSpocMappingService } from '@/services/clientSpocMappingService';
import { CreateClientSpocMappingDialog } from '../dialogs/CreateClientSpocMappingDialog';
import { toast } from 'sonner';

export function ClientSpocMappingTab() {
  const [clientMappings, setClientMappings] = useState<ClientSpocMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadClientMappings();
  }, []);

  const loadClientMappings = async () => {
    setLoading(true);
    try {
      const data = await ClientSpocMappingService.getAllMappings();
      setClientMappings(data);
    } catch (error) {
      console.error('Failed to load client mappings:', error);
      toast.error('Failed to load client mappings');
    } finally {
      setLoading(false);
    }
  };

  const getSlaAdherenceColor = (adherence: number) => {
    if (adherence >= 90) return 'text-green-600';
    if (adherence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSlaAdherenceVariant = (adherence: number) => {
    if (adherence >= 90) return 'default';
    if (adherence >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Client & SPOC Mapping</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage client relationships, SPOC assignments, and recruiter mappings
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="mappings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mappings">Client Mappings</TabsTrigger>
          <TabsTrigger value="spoc-dashboard">SPOC Dashboard</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="mappings" className="space-y-6">
          {/* Client Mappings Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Client SPOC Mappings</CardTitle>
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Client SPOC Mapping
              </Button>
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
                        <th className="text-left p-3">Client Name</th>
                        <th className="text-left p-3">Primary SPOC</th>
                        <th className="text-left p-3">Secondary SPOC</th>
                        <th className="text-left p-3">Assigned Recruiters</th>
                        <th className="text-left p-3">Active JDs</th>
                        <th className="text-left p-3">Avg TAT</th>
                        <th className="text-left p-3">Feedback Aging</th>
                        <th className="text-left p-3">SLA Adherence</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientMappings.map((mapping) => (
                        <tr key={mapping.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <div>
                              <div className="font-medium">{mapping.clientName}</div>
                              <div className="text-xs text-muted-foreground">
                                ID: {mapping.clientId}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              {mapping.primarySpoc}
                            </div>
                          </td>
                          <td className="p-3">
                            {mapping.secondarySpoc ? (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                {mapping.secondarySpoc}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Not assigned</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {mapping.assignedRecruiters.map((recruiter) => (
                                <Badge key={recruiter} variant="outline" className="text-xs">
                                  {recruiter}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary">{mapping.jdCount}</Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{mapping.avgTurnaroundTime}d</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {mapping.feedbackAgeing > 3 ? (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              <span className="text-sm">{mapping.feedbackAgeing}d</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <div className={`text-sm font-medium ${getSlaAdherenceColor(mapping.slaAdherence)}`}>
                                {mapping.slaAdherence}%
                              </div>
                              <Progress 
                                value={mapping.slaAdherence} 
                                className="h-1 w-16"
                              />
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spoc-dashboard" className="space-y-6">
          {/* SPOC Performance Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold">2.3 hours</p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Feedback</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">SLA Breaches</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overall SLA</p>
                    <p className="text-2xl font-bold">78%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SPOC Details */}
          <Card>
            <CardHeader>
              <CardTitle>SPOC Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientMappings.map((mapping) => (
                  <div key={mapping.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{mapping.primarySpoc}</h4>
                        <p className="text-sm text-muted-foreground">{mapping.clientName}</p>
                      </div>
                      <Badge variant={getSlaAdherenceVariant(mapping.slaAdherence)}>
                        SLA: {mapping.slaAdherence}%
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Active JDs</p>
                        <p className="font-medium">{mapping.jdCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Turnaround</p>
                        <p className="font-medium">{mapping.avgTurnaroundTime} days</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Feedback Aging</p>
                        <p className="font-medium">{mapping.feedbackAgeing} days</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Assigned Recruiters</p>
                        <p className="font-medium">{mapping.assignedRecruiters.length}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Client Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Performance Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">High Performers</span>
                    </div>
                    <div className="space-y-1">
                      {clientMappings
                        .filter(m => m.slaAdherence >= 85)
                        .map(m => (
                          <div key={m.id} className="text-sm">
                            {m.clientName} ({m.slaAdherence}%)
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">Needs Attention</span>
                    </div>
                    <div className="space-y-1">
                      {clientMappings
                        .filter(m => m.slaAdherence >= 70 && m.slaAdherence < 85)
                        .map(m => (
                          <div key={m.id} className="text-sm">
                            {m.clientName} ({m.slaAdherence}%)
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Critical</span>
                    </div>
                    <div className="space-y-1">
                      {clientMappings
                        .filter(m => m.slaAdherence < 70)
                        .map(m => (
                          <div key={m.id} className="text-sm">
                            {m.clientName} ({m.slaAdherence}%)
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Detailed Performance Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Client</th>
                        <th className="text-left p-2">SPOC</th>
                        <th className="text-left p-2">Response Pattern</th>
                        <th className="text-left p-2">Improvement Areas</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientMappings.map((mapping) => (
                        <tr key={mapping.id} className="border-b">
                          <td className="p-2 font-medium">{mapping.clientName}</td>
                          <td className="p-2">{mapping.primarySpoc}</td>
                          <td className="p-2">
                            <div className="text-sm">
                              <div>Avg: {mapping.avgTurnaroundTime}d response</div>
                              <div className="text-muted-foreground">
                                Best time: 9-11 AM
                              </div>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="space-y-1">
                              {mapping.feedbackAgeing > 3 && (
                                <Badge variant="destructive" className="text-xs">
                                  Slow feedback
                                </Badge>
                              )}
                              {mapping.slaAdherence < 80 && (
                                <Badge variant="secondary" className="text-xs">
                                  SLA improvement needed
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <Button variant="outline" size="sm">
                              Schedule Review
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <CreateClientSpocMappingDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={loadClientMappings}
      />
    </div>
  );
}