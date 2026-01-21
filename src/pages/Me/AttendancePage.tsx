import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  MapPin,
  Calendar,
  TrendingUp,
  Timer,
  CheckCircle,
  Wifi,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { attendanceService } from "@/services/attendanceService";
import {
  AttendanceRecord,
  AttendanceStats,
  AttendanceStatsFilter,
  AttendanceLogsFilter,
} from "@/types/attendance";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";
import { format, subMonths, startOfDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceRowActions } from "@/components/attendance/AttendanceRowActions";
import { RegularizeAttendanceDialog } from "@/components/attendance/RegularizeAttendanceDialog";
import {
  RequestLeaveDialog,
  LeaveRequestData,
} from "@/components/leave/RequestLeaveDialog";
import { supabase } from "@/integrations/supabase/client";
import { useCompOffBalance } from "@/hooks/useCompOffBalance";
import NodeApiClient from "@/services/nodeApiClient";

export default function AttendancePage() {
  const { user: currentUser } = useAuth();
  const { data: compOffBalance } = useCompOffBalance(currentUser?.id);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("stats");
  const [statsFilter, setStatsFilter] =
    useState<AttendanceStatsFilter>("1month");
  const [logsFilter, setLogsFilter] = useState<AttendanceLogsFilter>("30_days");
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [clockingIn, setClockingin] = useState(false);
  const [remoteClockInType, setRemoteClockInType] = useState<
    "Remote" | "WFH" | ""
  >("");

  // Dialog states
  const [showRegularizeDialog, setShowRegularizeDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null
  );

  // Regularization requests for checking pending status
  const [regularizationRequests, setRegularizationRequests] = useState<
    Record<string, string>
  >({});

  // Leave requests for checking pending status by date
  const [leaveRequestDates, setLeaveRequestDates] = useState<Set<string>>(
    new Set()
  );
  // All existing leave requests for conflict validation
  const [existingLeaveRequests, setExistingLeaveRequests] = useState<
    Array<{ id: string; start_date: string; end_date: string; status: string }>
  >([]);
  // Generate previous 6 months for filter
  const previousMonths = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, "yyyy-MM"),
      label: format(date, "MMM").toUpperCase(),
    };
  });
  const userName =
    currentUser?.display_name ||
    `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim() ||
    currentUser?.email ||
    "";

  useEffect(() => {
    loadData();
  }, [currentUser, statsFilter, logsFilter]);

  const loadData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const [statsResponse, recordsResponse] = await Promise.all([
        attendanceService.getEmployeeStats(currentUser.id, statsFilter),
        attendanceService.getEmployeeAttendance(currentUser.id, logsFilter),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (recordsResponse.success) {
        const today = format(new Date(), "yyyy-MM-dd");
        const todayRec = recordsResponse.data.find((r) => r.date === today);
        setTodayRecord(todayRec || null);
        setRecentRecords(recordsResponse.data);

        // Fetch regularization requests and leave requests using dates
        const dates = recordsResponse.data.map((r) => r.date);
        await Promise.all([
          loadRegularizationRequests(dates),
          loadLeaveRequests(dates),
        ]);
      }
    } catch (error) {
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const loadRegularizationRequests = async (dates: string[]) => {
    if (!currentUser || dates.length === 0) return;

    try {
      // Query by attendance_date - include both pending and approved requests
      // const { data, error } = await supabase
      //   .from("attendance_regularization_requests")
      //   .select("attendance_date, status")
      //   .eq("employee_id", currentUser.id)
      //   .in("attendance_date", dates)
      //   .in("status", ["pending", "approved"]);

      // if (error) throw error;
      const response = await NodeApiClient.get(
        "/attendance/regularization/status",
        {
          params: {
            employee_id: currentUser.id,
            dates: dates.join(","),
            status: "pending,approved",
          },
        }
      );
      const data = response.data;

      // Map by date with actual status
      const requestsMap: Record<string, string> = {};
      data?.forEach((req) => {
        requestsMap[req.attendance_date] = req.status;
      });
      setRegularizationRequests(requestsMap);
    } catch (error) {
      console.error("Error loading regularization requests:", error);
    }
  };

  const loadLeaveRequests = async (dates: string[]) => {
    if (!currentUser || dates.length === 0) return;

    try {
      const minDate = dates.reduce((a, b) => (a < b ? a : b));
      const maxDate = dates.reduce((a, b) => (a > b ? a : b));

      // const { data, error } = await supabase
      //   .from("leave_requests")
      //   .select("start_date, end_date")
      //   .eq("employee_id", currentUser.id)
      //   .eq("status", "pending")
      //   .lte("start_date", maxDate)
      //   .gte("end_date", minDate);

      // if (error) throw error;
      const response = await NodeApiClient.get("/leaves/all", {
        params: {
          employee_id: currentUser.id,
          status: "pending",
          start_date: minDate,
          end_date: maxDate,
        },
      });

      const data = response.data;
      setExistingLeaveRequests(data);
      // Build a set of dates that have pending leave requests
      const leaveDates = new Set<string>();
      data?.forEach((req) => {
        const start = new Date(req.start_date);
        const end = new Date(req.end_date);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          leaveDates.add(format(d, "yyyy-MM-dd"));
        }
      });
      setLeaveRequestDates(leaveDates);
    } catch (error) {
      console.error("Error loading leave requests:", error);
    }
  };

  const handleClockIn = async (location: "Office" | "Remote" | "WFH") => {
    if (!currentUser) return;

    setClockingin(true);
    try {
      const response = await attendanceService.clockIn({
        employeeId: currentUser.id,
        location,
      });

      if (response.success) {
        setTodayRecord(response.data);
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to clock in");
    } finally {
      setClockingin(false);
    }
  };

  const handleClockOut = async () => {
    if (!currentUser) return;

    setClockingin(true);
    try {
      const response = await attendanceService.clockOut(currentUser.id);

      if (response.success) {
        setTodayRecord(response.data);
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to clock out");
    } finally {
      setClockingin(false);
    }
  };

  const handleRegularize = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setShowRegularizeDialog(true);
  };

  const handleRequestLeave = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setShowLeaveDialog(true);
  };

  const handleLeaveSubmit = async (data: LeaveRequestData) => {
    if (!currentUser) return;

    try {
      // const { error } = await supabase.from("leave_requests").insert({
      //   employee_id: currentUser.id,
      //   leave_type: data.leave_type,
      //   start_date: format(data.start_date, "yyyy-MM-dd"),
      //   end_date: format(data.end_date, "yyyy-MM-dd"),
      //   total_days: data.total_days,
      //   reason: data.reason,
      //   status: "pending",
      // });

      // if (error) throw error;
      await NodeApiClient.post("/leaves/create", {
        employee_id: currentUser.id,
        leave_type: data.leave_type,
        start_date: format(data.start_date, "yyyy-MM-dd"),
        end_date: format(data.end_date, "yyyy-MM-dd"),
        total_days: data.total_days,
        reason: data.reason,
        status: "pending",
        requested_by: userName,
      });

      toast.success("Leave request submitted successfully");
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast.error("Failed to submit leave request");
      throw error;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "regularized":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100";
      case "late":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "absent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "work_from_home":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "regularization_pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
      case "leave_requested":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      case "on_leave":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100";
      case "week_off":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
      case "holiday":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const getDisplayStatus = (record: AttendanceRecord): string => {
    // Check if regularization was approved
    if (regularizationRequests[record.date] === "approved") {
      return "regularized";
    }
    // Check if there's a pending regularization request (now using date)
    if (regularizationRequests[record.date] === "pending") {
      return "regularization_pending";
    }
    // Check if there's a pending leave request for this date
    if (leaveRequestDates.has(record.date)) {
      return "leave_requested";
    }
    return record.status;
  };

  const formatStatusLabel = (status: string): string => {
    if (status === "regularized") {
      return "Regularized";
    }
    if (status === "regularization_pending") {
      return "Regularization Pending";
    }
    if (status === "leave_requested") {
      return "Leave Requested";
    }
    if (status === "on_leave") {
      return "On Leave";
    }
    if (status === "week_off") {
      return "W-OFF";
    }
    if (status === "holiday") {
      return "Holiday";
    }
    return status.replace("_", " ");
  };

  const isMissingClockOut = (record: AttendanceRecord): boolean => {
    // Don't show actions for approved leave days or week-offs
    if (record.status === "on_leave" || record.status === "week_off")
      return false;

    // For holidays, only show actions if the employee actually worked (has checkIn)
    if (record.status === "holiday") {
      return record.checkIn !== undefined;
    }

    if (record.checkOut) return false;
    // Hide actions for any regularization (pending or approved)
    if (regularizationRequests[record.date]) return false;
    if (leaveRequestDates.has(record.date)) return false;

    const recordDate = startOfDay(new Date(record.date));
    const today = startOfDay(new Date());

    return recordDate < today;
  };

  const formatCheckOutDisplay = (record: AttendanceRecord) => {
    if (record.checkOut) return record.checkOut;

    const recordDate = startOfDay(new Date(record.date));
    const today = startOfDay(new Date());

    // If date is in the past and no check-out, show "Missing Clock Out"
    if (recordDate < today) {
      return "Missing Clock Out";
    }

    return "Ongoing";
  };

  const formatHoursDisplay = (totalHours: number): string => {
    if (!totalHours || totalHours === 0) return "-";

    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);

    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const formatTimeDisplay = (record: AttendanceRecord) => {
    if (record.status === "week_off") {
      return "Full day Weekly-off";
    }
    if (record.status === "holiday") {
      // If the employee worked on a holiday, show the clock-in/clock-out times
      if (record.checkIn) {
        const checkOutDisplay = record.checkOut || "Ongoing";
        return `${record.checkIn} - ${checkOutDisplay}`;
      }
      // Otherwise show the holiday name
      return record.notes || "Holiday";
    }
    if (!record.checkIn) {
      return "— No attendance recorded";
    }
    return `${record.checkIn} - ${formatCheckOutDisplay(record)}`;
  };

  const renderClockInContent = (isRemote: boolean = false) => {
    const expectedLocation = isRemote
      ? remoteClockInType || "Remote"
      : "Office";
    const hasClockedIn = todayRecord?.checkIn;
    const isRemoteLocation = (loc: string) => loc === "Remote" || loc === "WFH";
    const clockedInFromDifferentLocation = isRemote
      ? hasClockedIn && !isRemoteLocation(todayRecord.location)
      : hasClockedIn && todayRecord.location !== "Office";

    return (
      <Card className="rounded-2xl shadow-sm max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {isRemote ? (
              <Wifi className="w-5 h-5" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
            Today's Attendance {isRemote && "(Remote)"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold">
              {format(new Date(), "HH:mm")}
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(), "EEEE, MMM dd, yyyy")}
            </div>
          </div>

          {clockedInFromDifferentLocation ? (
            <div className="space-y-3">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  You've already clocked in from{" "}
                  <strong>
                    {todayRecord.location === "WFH"
                      ? "Work From Home"
                      : todayRecord.location}
                  </strong>{" "}
                  today at {todayRecord.checkIn}
                </p>
              </div>
              <Button disabled className="w-full" size="lg">
                <CheckCircle className="w-4 h-4 mr-2" />
                Already Clocked In
              </Button>
            </div>
          ) : todayRecord ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Check-in:</span>
                <span className="font-medium">
                  {todayRecord.checkIn || "Not recorded"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Check-out:</span>
                <span className="font-medium">
                  {todayRecord.checkOut || "Not recorded"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Location:</span>
                <Badge variant="outline">
                  {todayRecord.location === "WFH"
                    ? "Work From Home"
                    : todayRecord.location}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Status:</span>
                <Badge className={getStatusColor(todayRecord.status)}>
                  {todayRecord.status.replace("_", " ")}
                </Badge>
              </div>

              {!todayRecord.checkOut && (
                <Button
                  onClick={handleClockOut}
                  disabled={clockingIn}
                  className="w-full"
                  variant="destructive"
                >
                  {clockingIn ? "Clocking Out..." : "Clock Out"}
                </Button>
              )}
            </div>
          ) : isRemote ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Type of Remote Clock-in
                </label>
                <Select
                  value={remoteClockInType}
                  onValueChange={(value: "Remote" | "WFH") =>
                    setRemoteClockInType(value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select remote type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remote">
                      Remote/Client Clock-in
                    </SelectItem>
                    <SelectItem value="WFH">Work From Home</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() =>
                  handleClockIn(remoteClockInType as "Remote" | "WFH")
                }
                disabled={clockingIn || !remoteClockInType}
                className="w-full"
                size="lg"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {clockingIn ? "Clocking In..." : "Clock In (Remote)"}
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => handleClockIn("Office")}
              disabled={clockingIn}
              className="w-full"
              size="lg"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {clockingIn ? "Clocking In..." : "Clock In"}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-2xl">
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="clock" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Clock-in</span>
          </TabsTrigger>
          <TabsTrigger value="remote" className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            <span className="hidden sm:inline">Remote Clock-in</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Attendance Logs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-6">
          <div className="flex justify-end">
            <ToggleGroup
              type="single"
              value={statsFilter}
              onValueChange={(value) =>
                value && setStatsFilter(value as AttendanceStatsFilter)
              }
            >
              <ToggleGroupItem value="1month" aria-label="1 Month">
                1 Month
              </ToggleGroupItem>
              <ToggleGroupItem value="3months" aria-label="3 Months">
                3 Months
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Present Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.presentDays}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statsFilter === "1month" ? "This month" : "Last 3 months"}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.averageHours.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">Per day</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Late Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.lateDays}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statsFilter === "1month" ? "This month" : "Last 3 months"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="clock" className="space-y-6">
          {renderClockInContent(false)}
        </TabsContent>

        <TabsContent value="remote" className="space-y-6">
          {renderClockInContent(true)}
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          {/* Mobile: Dropdown filter, Desktop: ToggleGroup */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <span className="text-sm font-medium">Filter Period</span>
            {isMobile ? (
              <Select
                value={logsFilter}
                onValueChange={(value) =>
                  setLogsFilter(value as AttendanceLogsFilter)
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30_days">Last 30 Days</SelectItem>
                  {previousMonths.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <ToggleGroup
                type="single"
                value={logsFilter}
                onValueChange={(value) =>
                  value && setLogsFilter(value as AttendanceLogsFilter)
                }
              >
                <ToggleGroupItem value="30_days" aria-label="30 Days">
                  30 DAYS
                </ToggleGroupItem>
                {previousMonths.map((month) => (
                  <ToggleGroupItem
                    key={month.value}
                    value={month.value}
                    aria-label={month.label}
                  >
                    {month.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          </div>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Attendance Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentRecords.length > 0 ? (
                  recentRecords.map((record) => {
                    const displayStatus = getDisplayStatus(record);
                    const showActions = isMissingClockOut(record);

                    return isMobile ? (
                      /* Mobile: Card-based layout */
                      <Card
                        key={record.id}
                        className={`overflow-hidden ${
                          displayStatus === "week_off"
                            ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                            : displayStatus === "holiday"
                            ? "bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800"
                            : ""
                        }`}
                      >
                        <CardContent className="p-4 space-y-3">
                          {/* Row 1: Date and Status */}
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">
                              {format(new Date(record.date), "MMM dd, yyyy")}
                            </span>
                            <Badge className={getStatusColor(displayStatus)}>
                              {formatStatusLabel(displayStatus)}
                            </Badge>
                          </div>
                          {/* Row 2: Time range */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Timer className="w-4 h-4" />
                            <span>{formatTimeDisplay(record)}</span>
                          </div>
                          {/* Row 3: Location and Hours */}
                          <div className="flex items-center justify-between text-sm">
                            {record.checkIn && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>{record.location}</span>
                              </div>
                            )}
                            {record.checkIn && (
                              <span className="font-semibold ml-auto">
                                {formatHoursDisplay(record.totalHours)}
                              </span>
                            )}
                          </div>
                          {/* Row 4: Actions (if needed) */}
                          {showActions && (
                            <div className="pt-2 border-t">
                              <AttendanceRowActions
                                onRegularize={() => handleRegularize(record)}
                                onRequestLeave={() =>
                                  handleRequestLeave(record)
                                }
                                isHoliday={displayStatus === "holiday"}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ) : (
                      /* Desktop: Horizontal layout */
                      <div
                        key={record.id}
                        className={`flex items-center justify-between p-3 border rounded-xl ${
                          displayStatus === "week_off"
                            ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                            : displayStatus === "holiday"
                            ? "bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium">
                            {format(new Date(record.date), "MMM dd, yyyy")}
                          </div>
                          <Badge className={getStatusColor(displayStatus)}>
                            {formatStatusLabel(displayStatus)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            {formatTimeDisplay(record)}
                          </div>
                          {record.checkIn && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {record.location}
                            </div>
                          )}
                          {record.checkIn && (
                            <div className="font-medium text-foreground">
                              {formatHoursDisplay(record.totalHours)}
                            </div>
                          )}
                          {showActions && (
                            <AttendanceRowActions
                              onRegularize={() => handleRegularize(record)}
                              onRequestLeave={() => handleRequestLeave(record)}
                              isHoliday={displayStatus === "holiday"}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No attendance records found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Regularize Attendance Dialog */}
      {selectedRecord && (
        <RegularizeAttendanceDialog
          open={showRegularizeDialog}
          onOpenChange={setShowRegularizeDialog}
          attendanceRecordId={selectedRecord.id}
          attendanceDate={selectedRecord.date}
          onSuccess={() => {
            loadData();
            setSelectedRecord(null);
          }}
        />
      )}

      {/* Request Leave Dialog */}
      <RequestLeaveDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        onSubmit={handleLeaveSubmit}
        initialDate={selectedRecord ? new Date(selectedRecord.date) : undefined}
        compOffBalance={compOffBalance?.available ?? 0}
        existingRequests={existingLeaveRequests}
      />
    </div>
  );
}
