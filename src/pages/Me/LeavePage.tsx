import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Plus, Clock, TrendingUp, BarChart3 } from "lucide-react";
import { format, startOfYear, endOfYear } from "date-fns";
import { 
  useLeaveBalances, 
  useMyLeaveRequests, 
  useHolidayCalendars 
} from "@/hooks/useLeave";
import { LeaveBalanceCard } from "@/components/leave/LeaveBalanceCard";
import { RBACGuard } from "@/features/performance/components/guards/RBACGuard";

export default function LeavePage() {
  const [selectedYear] = useState(new Date().getFullYear().toString());
  const yearStart = format(startOfYear(new Date()), 'yyyy-MM-dd');
  const yearEnd = format(endOfYear(new Date()), 'yyyy-MM-dd');

  const { data: balances, isLoading: balancesLoading } = useLeaveBalances(selectedYear);
  const { data: requests, isLoading: requestsLoading } = useMyLeaveRequests();
  const { data: calendars, isLoading: calendarsLoading } = useHolidayCalendars(yearStart, yearEnd);

  return (
    <RBACGuard requiredRoles={["EMPLOYEE", "MANAGER", "HR", "ADMIN"]}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leave Management</h1>
            <p className="text-muted-foreground">
              Manage your leave requests and view balances
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              Request Comp-Off
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Request Leave
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="request">Request Leave</TabsTrigger>
            <TabsTrigger value="history">My Requests</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Leave Balances */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Leave Balances</h2>
              {balancesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-8 bg-muted rounded w-1/2" />
                          <div className="h-2 bg-muted rounded" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {balances?.data?.map((balance) => (
                    <LeaveBalanceCard key={balance.id} balance={balance} />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Holiday Calendar */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Upcoming Holidays
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {calendarsLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-3 bg-muted rounded w-3/4 mb-1" />
                          <div className="h-2 bg-muted rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {calendars?.data?.[0]?.holidays
                        ?.filter(h => new Date(h.date) > new Date())
                        ?.slice(0, 3)
                        ?.map((holiday) => (
                          <div key={holiday.id} className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">{holiday.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(holiday.date), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {holiday.type}
                            </Badge>
                          </div>
                        ))}
                      {(!calendars?.data?.[0]?.holidays || calendars.data[0].holidays.length === 0) && (
                        <p className="text-sm text-muted-foreground">No upcoming holidays</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Requests */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {requestsLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-3 bg-muted rounded w-3/4 mb-1" />
                          <div className="h-2 bg-muted rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requests?.data?.slice(0, 3)?.map((request) => (
                        <div key={request.id} className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{request.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd')}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              request.status === 'approved' ? 'default' :
                              request.status === 'rejected' ? 'destructive' :
                              'secondary'
                            }
                            className="text-xs"
                          >
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                      {(!requests?.data || requests.data.length === 0) && (
                        <p className="text-sm text-muted-foreground">No recent requests</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Usage Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Usage Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {balancesLoading ? (
                    <div className="space-y-3">
                      <div className="animate-pulse">
                        <div className="h-2 bg-muted rounded mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {balances?.data?.slice(0, 3)?.map((balance) => {
                        const utilization = balance.allocated > 0 ? 
                          (balance.consumed / balance.allocated) * 100 : 0;
                        return (
                          <div key={balance.id}>
                            <div className="flex justify-between text-xs mb-1">
                              <span>{balance.type}</span>
                              <span>{Math.round(utilization)}%</span>
                            </div>
                            <Progress value={utilization} className="h-2" />
                          </div>
                        );
                      })}
                      {(!balances?.data || balances.data.length === 0) && (
                        <p className="text-sm text-muted-foreground">No balance data</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="request">
            <Card>
              <CardHeader>
                <CardTitle>Request Leave</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Leave request form will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>My Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Leave history table will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Leave Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Calendar view will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RBACGuard>
  );
}