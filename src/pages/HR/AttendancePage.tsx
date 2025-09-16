import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock, MapPin, Settings, Calendar } from 'lucide-react';
import { attendanceService } from '@/services/attendanceService';
import { AttendancePolicy } from '@/types/attendance';
import { useAuth } from '@/auth/AuthContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function HRAttendancePage() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('timings');
  const [policies, setPolicies] = useState<AttendancePolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const policiesResponse = await attendanceService.getAttendancePolicies();

      if (policiesResponse.success) {
        setPolicies(policiesResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load attendance policies');
    } finally {
      setLoading(false);
    }
  };

  const handlePolicyUpdate = (policyId: string, updates: Partial<AttendancePolicy>) => {
    setPolicies(prev => prev.map(policy => 
      policy.id === policyId ? { ...policy, ...updates } : policy
    ));
    toast.success('Policy updated successfully');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="HR Attendance Management" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="rounded-2xl">
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const defaultPolicy = policies[0];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="HR Attendance Management"
        description="Configure attendance policies and settings"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timings" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Timings</span>
          </TabsTrigger>
          <TabsTrigger value="geofencing" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Geo-fencing</span>
          </TabsTrigger>
          <TabsTrigger value="remote" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Remote/WFH</span>
          </TabsTrigger>
          <TabsTrigger value="calendars" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Calendars</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timings" className="space-y-6">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Office Timings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {defaultPolicy && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Office Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={defaultPolicy.officeStartTime}
                        onChange={(e) => handlePolicyUpdate(defaultPolicy.id, { officeStartTime: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endTime">Office End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={defaultPolicy.officeEndTime}
                        onChange={(e) => handlePolicyUpdate(defaultPolicy.id, { officeEndTime: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gracePeriod">Late Grace Period (minutes)</Label>
                      <Input
                        id="gracePeriod"
                        type="number"
                        value={defaultPolicy.lateGracePeriod}
                        onChange={(e) => handlePolicyUpdate(defaultPolicy.id, { lateGracePeriod: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="minHours">Minimum Working Hours</Label>
                      <Input
                        id="minHours"
                        type="number"
                        step="0.5"
                        value={defaultPolicy.minimumHours}
                        onChange={(e) => handlePolicyUpdate(defaultPolicy.id, { minimumHours: parseFloat(e.target.value) })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Working Days</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <label key={day} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={defaultPolicy.workingDays.includes(day)}
                              onChange={(e) => {
                                const newWorkingDays = e.target.checked
                                  ? [...defaultPolicy.workingDays, day]
                                  : defaultPolicy.workingDays.filter(d => d !== day);
                                handlePolicyUpdate(defaultPolicy.id, { workingDays: newWorkingDays });
                              }}
                              className="rounded"
                            />
                            <span>{day.substring(0, 3)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geofencing" className="space-y-6">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Geo-fencing Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {defaultPolicy && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="geofence-toggle">Enable Geo-fencing</Label>
                      <p className="text-sm text-muted-foreground">
                        Require employees to be within office radius to clock in
                      </p>
                    </div>
                    <Switch
                      id="geofence-toggle"
                      checked={defaultPolicy.geofenceEnabled}
                      onCheckedChange={(checked) => handlePolicyUpdate(defaultPolicy.id, { geofenceEnabled: checked })}
                    />
                  </div>
                  
                  {defaultPolicy.geofenceEnabled && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="radius">Allowed Radius (meters)</Label>
                        <Input
                          id="radius"
                          type="number"
                          value={defaultPolicy.geofenceRadius}
                          onChange={(e) => handlePolicyUpdate(defaultPolicy.id, { geofenceRadius: parseInt(e.target.value) })}
                        />
                      </div>
                      
                      {defaultPolicy.officeLocation && (
                        <div className="space-y-2">
                          <Label>Office Location</Label>
                          <div className="p-3 bg-gray-50 rounded-lg text-sm">
                            <p className="font-medium">{defaultPolicy.officeLocation.address}</p>
                            <p className="text-muted-foreground">
                              Lat: {defaultPolicy.officeLocation.lat}, Lng: {defaultPolicy.officeLocation.lng}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remote" className="space-y-6">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Remote & WFH Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Work From Home</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable employees to mark attendance while working remotely
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require WFH Approval</Label>
                    <p className="text-sm text-muted-foreground">
                      WFH requests need manager approval before attendance
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Photo Verification for Remote</Label>
                    <p className="text-sm text-muted-foreground">
                      Require selfie when clocking in from remote locations
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="wfh-limit">Maximum WFH Days per Month</Label>
                  <Input
                    id="wfh-limit"
                    type="number"
                    defaultValue="8"
                    min="0"
                    max="31"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendars" className="space-y-6">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Holiday Calendars
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Holiday Calendar</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically mark holidays as non-working days
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="holiday-region">Holiday Region</Label>
                  <select id="holiday-region" className="w-full p-2 border rounded-md">
                    <option value="in">India</option>
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="custom">Custom Calendar</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Upcoming Holidays</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Gandhi Jayanti</span>
                      <span className="text-sm text-muted-foreground">Oct 2, 2024</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Diwali</span>
                      <span className="text-sm text-muted-foreground">Nov 1, 2024</span>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Christmas</span>
                      <span className="text-sm text-muted-foreground">Dec 25, 2024</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  Add Custom Holiday
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}