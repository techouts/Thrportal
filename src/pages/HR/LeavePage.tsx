import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  FileUp, 
  BarChart3, 
  Calendar,
  AlertTriangle,
  Search,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { 
  usePendingL2Approvals,
  useLeaveSettings,
  useUpdateLeaveSettings,
  useLeaveReports,
  useApproveL2,
  useUploadAllocations
} from "@/hooks/useLeave";
import { RBACGuard } from "@/features/performance/components/guards/RBACGuard";
import { useToast } from "@/hooks/use-toast";

export default function HRLeavePage() {
  const [settingsData, setSettingsData] = useState<any>({});
  const [reportFilters, setReportFilters] = useState({
    from: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
    departments: [],
    locations: []
  });
  
  const { data: pendingL2, isLoading: pendingLoading } = usePendingL2Approvals();
  const { data: settings, isLoading: settingsLoading } = useLeaveSettings();
  const { data: reports } = useLeaveReports(reportFilters);
  
  const approveL2 = useApproveL2();
  const updateSettings = useUpdateLeaveSettings();
  const uploadAllocations = useUploadAllocations();
  const { toast } = useToast();

  const handleApproveL2 = (id: string) => {
    approveL2.mutate({ id });
  };

  const handleUpdateSettings = () => {
    updateSettings.mutate(settingsData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAllocations.mutate(file);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'pending_L2': 'default',
      'approved': 'default',
      'rejected': 'destructive'
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getFlagIcon = (request: any) => {
    const flags = [];
    if (request.backdatedDays > 7) flags.push('Backdated Override');
    if (request.negativeBalanceAfter) flags.push('Negative Balance');
    if (request.appliesSandwich) flags.push('Sandwich Applied');
    return flags;
  };

  return (
    <RBACGuard requiredRoles={["MANAGER", "HR", "ADMIN"]}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">HR Leave Management</h1>
            <p className="text-muted-foreground">
              Manage leave policies, approvals, and organization-wide settings
            </p>
          </div>
        </div>

        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="allocations">Allocations</TabsTrigger>
            <TabsTrigger value="holidays">Holidays</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Stage-2 Approvals ({pendingL2?.data?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-muted rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Leave Details</TableHead>
                        <TableHead>Policy Flags</TableHead>
                        <TableHead>L1 Approval</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingL2?.data?.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{request.employeeName}</p>
                              <p className="text-sm text-muted-foreground">{request.reason}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{request.type}</Badge>
                                <span className="text-sm">{request.totalDays} days</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd')}
                              </p>
                              {request.halfDay && (
                                <Badge variant="secondary" className="text-xs">
                                  Half Day ({request.halfDay})
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {getFlagIcon(request).map((flag, index) => (
                                <div key={index} className="flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                  <span className="text-xs text-yellow-700">{flag}</span>
                                </div>
                              ))}
                              {getFlagIcon(request).length === 0 && (
                                <span className="text-xs text-muted-foreground">No flags</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {request.l1ApprovedBy && (
                                <>
                                  <p className="text-green-600">✓ Approved</p>
                                  <p className="text-muted-foreground text-xs">
                                    {format(new Date(request.l1ApprovedAt!), 'MMM dd, HH:mm')}
                                  </p>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleApproveL2(request.id)}
                                disabled={approveL2.isPending}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                disabled={approveL2.isPending}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                
                {!pendingLoading && (!pendingL2?.data || pendingL2.data.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending L2 approvals found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Leave Policies & Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {settingsLoading ? (
                  <div className="space-y-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                        <div className="h-8 bg-muted rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Global Settings */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Global Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="backdated-limit">Backdated Days Allowed</Label>
                          <Input
                            id="backdated-limit"
                            type="number"
                            defaultValue={7}
                            onChange={(e) => setSettingsData({
                              ...settingsData,
                              backdatedGlobalLimit: parseInt(e.target.value)
                            })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="wfh-limit">WFH Weekly Limit</Label>
                          <Input
                            id="wfh-limit"
                            type="number"
                            defaultValue={2}
                            onChange={(e) => setSettingsData({
                              ...settingsData,
                              wfhGlobalLimit: parseInt(e.target.value)
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Leave Type Policies */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Leave Type Policies</h3>
                      <div className="space-y-4">
                        {['CL', 'SL', 'PL', 'COMP_OFF'].map((type) => (
                          <Card key={type} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">{type} - {
                                type === 'CL' ? 'Casual Leave' :
                                type === 'SL' ? 'Sick Leave' :
                                type === 'PL' ? 'Privilege Leave' :
                                'Comp-Off'
                              }</h4>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="flex items-center space-x-2">
                                <Switch id={`${type}-negative`} />
                                <Label htmlFor={`${type}-negative`} className="text-sm">Allow Negative</Label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Switch id={`${type}-halfday`} defaultChecked={type === 'CL' || type === 'SL'} />
                                <Label htmlFor={`${type}-halfday`} className="text-sm">Half Day</Label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Switch id={`${type}-sandwich`} />
                                <Label htmlFor={`${type}-sandwich`} className="text-sm">Sandwich Rule</Label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Switch id={`${type}-l2`} defaultChecked />
                                <Label htmlFor={`${type}-l2`} className="text-sm">Require HR Approval</Label>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Integration Settings */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Integration Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch id="outlook-sync" defaultChecked />
                          <Label htmlFor="outlook-sync">Enable Outlook Calendar Sync</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch id="attendance-auto" />
                          <Label htmlFor="attendance-auto">Auto-mark Attendance for Approved Leaves</Label>
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleUpdateSettings} disabled={updateSettings.isPending}>
                      Save Settings
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileUp className="h-5 w-5" />
                    Bulk Upload Allocations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="allocation-file">Upload CSV File</Label>
                    <Input
                      id="allocation-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      disabled={uploadAllocations.isPending}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      CSV should contain: Employee ID, Leave Type, Days, Reason
                    </p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // Download template
                      const csvContent = "Employee ID,Leave Type,Days,Reason\nEMP001,PL,21,Annual Allocation\nEMP002,CL,12,Annual Allocation";
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'leave_allocation_template.csv';
                      a.click();
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manual Allocation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee-search">Employee</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="employee-search"
                        placeholder="Search employee..."
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="leave-type">Leave Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CL">Casual Leave</SelectItem>
                        <SelectItem value="SL">Sick Leave</SelectItem>
                        <SelectItem value="PL">Privilege Leave</SelectItem>
                        <SelectItem value="COMP_OFF">Comp-Off</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="days">Days to Allocate</Label>
                    <Input id="days" type="number" placeholder="Enter days" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea id="reason" placeholder="Reason for allocation" />
                  </div>
                  
                  <Button className="w-full">
                    Allocate Leave
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="holidays" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Holiday Calendar Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Holiday calendar management functionality will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Leave Analytics & Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Leave analytics and reporting functionality will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RBACGuard>
  );
}