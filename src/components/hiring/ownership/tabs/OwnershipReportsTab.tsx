import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, TrendingUp, Users, AlertTriangle, Clock, Target } from 'lucide-react';
import { ownershipService } from '@/services/ownershipService';
import { WorkloadDistribution, ManagerDashboard, ClientSlaReport, OrphanReport, NoSubmissionReport, NoSubmissionWidget } from '@/types/ownership';
import { KPICard } from '@/components/shared/KPICard';

export function OwnershipReportsTab() {
  const [workloadData, setWorkloadData] = useState<WorkloadDistribution[]>([]);
  const [managerData, setManagerData] = useState<ManagerDashboard[]>([]);
  const [clientData, setClientData] = useState<ClientSlaReport[]>([]);
  const [orphanData, setOrphanData] = useState<OrphanReport | null>(null);
  const [noSubmissionData, setNoSubmissionData] = useState<NoSubmissionReport[]>([]);
  const [noSubmissionWidget, setNoSubmissionWidget] = useState<NoSubmissionWidget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [workload, manager, client, orphan, noSubmission, widget] = await Promise.all([
        ownershipService.getWorkloadDistribution(),
        ownershipService.getManagerDashboards(),
        ownershipService.getClientSlaReports(),
        ownershipService.getOrphanReport(),
        ownershipService.getNoSubmissionReports(),
        ownershipService.getNoSubmissionWidget()
      ]);
      setWorkloadData(workload);
      setManagerData(manager);
      setClientData(client);
      setOrphanData(orphan);
      setNoSubmissionData(noSubmission);
      setNoSubmissionWidget(widget);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ownership Reports & Analytics</CardTitle>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Reports
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="nosubmissions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="nosubmissions">No Submissions</TabsTrigger>
          <TabsTrigger value="workload">Workload</TabsTrigger>
          <TabsTrigger value="managers">Managers</TabsTrigger>
          <TabsTrigger value="clients">Client SLA</TabsTrigger>
          <TabsTrigger value="orphans">Orphan Report</TabsTrigger>
        </TabsList>

        <TabsContent value="nosubmissions" className="space-y-6">
          {/* No Submission Widget */}
          {noSubmissionWidget && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <KPICard
                title="JDs (Last 24h)"
                value={noSubmissionWidget.jdsLast24h.toString()}
                icon={Clock}
                trend={{ direction: "down", value: "1" }}
              />
              <KPICard
                title="JDs (Last 7d)"
                value={noSubmissionWidget.jdsLast7d.toString()}
                icon={AlertTriangle}
                trend={{ direction: "up", value: "3" }}
              />
              <KPICard
                title="Total Open JDs"
                value={noSubmissionWidget.totalOpenJds.toString()}
                icon={Target}
                trend={{ direction: "up", value: "2" }}
              />
              <KPICard
                title="Critical JDs"
                value={noSubmissionWidget.criticalJds.toString()}
                icon={AlertTriangle}
                trend={{ direction: "down", value: "1" }}
              />
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Open JDs with No Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">JD ID</th>
                      <th className="text-left p-2">JD Title</th>
                      <th className="text-left p-2">Client</th>
                      <th className="text-left p-2">Recruiter Owner</th>
                      <th className="text-left p-2">SLA Deadline</th>
                      <th className="text-left p-2">Days Since Posted</th>
                      <th className="text-left p-2">Days Past Deadline</th>
                      <th className="text-left p-2">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {noSubmissionData.map((jd) => (
                      <tr key={jd.jdId} className="border-b">
                        <td className="p-2 font-mono text-sm">{jd.jdId}</td>
                        <td className="p-2 font-medium">{jd.jdTitle}</td>
                        <td className="p-2">{jd.client}</td>
                        <td className="p-2">{jd.recruiterOwner}</td>
                        <td className="p-2">{new Date(jd.slaDeadline).toLocaleDateString()}</td>
                        <td className="p-2">{jd.daysSincePosted}</td>
                        <td className="p-2">
                          {jd.daysPastDeadline ? (
                            <span className="text-red-600 font-medium">{jd.daysPastDeadline}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-2">
                          <span className={`text-sm font-medium ${
                            jd.riskLevel === 'High' ? 'text-red-600' : 
                            jd.riskLevel === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {jd.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {noSubmissionData.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">All JDs have submissions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workload" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard
              title="Total Recruiters"
              value={workloadData.length.toString()}
              icon={Users}
              trend={{ direction: "up", value: "3%" }}
            />
            <KPICard
              title="Avg Workload"
              value={`${Math.round(workloadData.reduce((sum, w) => sum + w.workloadScore, 0) / workloadData.length)}%`}
              icon={TrendingUp}
              trend={{ direction: "down", value: "5%" }}
            />
            <KPICard
              title="Overloaded"
              value={workloadData.filter(w => w.workloadScore >= 80).length.toString()}
              icon={AlertTriangle}
              trend={{ direction: "down", value: "2" }}
            />
            <KPICard
              title="Balance Index"
              value="0.85"
              icon={TrendingUp}
              trend={{ direction: "up", value: "0.05" }}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recruiter Workload Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Recruiter</th>
                      <th className="text-left p-2">Active JDs</th>
                      <th className="text-left p-2">Candidates</th>
                      <th className="text-left p-2">Workload</th>
                      <th className="text-left p-2">Utilization</th>
                      <th className="text-left p-2">SLA Compliance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workloadData.map((recruiter) => (
                      <tr key={recruiter.recruiterId} className="border-b">
                        <td className="p-2 font-medium">{recruiter.recruiterName}</td>
                        <td className="p-2">{recruiter.activeJDs}</td>
                        <td className="p-2">{recruiter.activeCandidates}</td>
                        <td className="p-2">{recruiter.workloadScore}%</td>
                        <td className="p-2">{recruiter.utilizationRate}%</td>
                        <td className="p-2">{recruiter.slaCompliance}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="managers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manager Dashboards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {managerData.map((manager) => (
                  <div key={manager.managerId} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">{manager.managerName}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Team Size</p>
                        <p className="font-medium">{manager.teamSize} recruiters</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Team JDs</p>
                        <p className="font-medium">{manager.teamJDs}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">SLA Compliance</p>
                        <p className="font-medium">{manager.teamSlaCompliance}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Escalations</p>
                        <p className="font-medium">{manager.escalationsReceived}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client SLA Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Client</th>
                      <th className="text-left p-2">SPOC</th>
                      <th className="text-left p-2">JDs</th>
                      <th className="text-left p-2">Avg TAT</th>
                      <th className="text-left p-2">SLA Adherence</th>
                      <th className="text-left p-2">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientData.map((client) => (
                      <tr key={client.clientId} className="border-b">
                        <td className="p-2 font-medium">{client.clientName}</td>
                        <td className="p-2">{client.spocName}</td>
                        <td className="p-2">{client.totalJDs}</td>
                        <td className="p-2">{client.avgTurnaroundTime}d</td>
                        <td className="p-2">{client.slaAdherence}%</td>
                        <td className="p-2">
                          <span className={`text-sm ${client.riskLevel === 'High' ? 'text-red-600' : 'text-green-600'}`}>
                            {client.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orphans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Orphan Report</CardTitle>
            </CardHeader>
            <CardContent>
              {orphanData && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Unassigned Candidates ({orphanData.unassignedCandidates.length})</h4>
                    <div className="space-y-2">
                      {orphanData.unassignedCandidates.map((candidate) => (
                        <div key={candidate.candidateId} className="p-2 border rounded text-sm">
                          {candidate.candidateName} - {candidate.daysSinceCreated} days old
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Unlinked JDs ({orphanData.unlinkedJDs.length})</h4>
                    <div className="space-y-2">
                      {orphanData.unlinkedJDs.map((jd) => (
                        <div key={jd.jdId} className="p-2 border rounded text-sm">
                          {jd.jdTitle} - {jd.daysSinceCreated} days old
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}