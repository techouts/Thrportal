import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/shared/DataTable";
import { 
  Calendar,
  Plus,
  Search,
  Users,
  Clock,
  CheckCircle,
  MapPin,
  FileText,
  PenTool
} from "lucide-react";
import { MeetingDTO, MeetingType } from "../../api/dtos";
import { format } from "date-fns";

export function OneOnOnesTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingDTO | null>(null);

  // Mock data
  const mockMeetings: MeetingDTO[] = [
    {
      id: "1",
      cycleId: "cycle1",
      empId: "emp1", 
      managerId: "mgr1",
      type: "one_on_one",
      scheduledAt: "2024-03-15T10:00:00Z",
      location: "Conference Room A",
      status: "scheduled",
      notes: {
        publicNotes: "Discussing Q1 goals progress and upcoming projects",
        privateNotes: "",
        actionItems: [
          { text: "Complete React training", ownerId: "emp1", due: "2024-03-30" },
          { text: "Review code review guidelines", ownerId: "mgr1", due: "2024-03-20" }
        ],
        empSigned: false,
        mgrSigned: false
      }
    },
    {
      id: "2",
      cycleId: "cycle1", 
      empId: "emp1",
      managerId: "mgr1",
      type: "mid_year",
      scheduledAt: "2024-06-15T14:00:00Z",
      location: "Manager's Office",
      status: "done",
      notes: {
        publicNotes: "Mid-year performance review discussion",
        privateNotes: "Employee showing great improvement in technical skills",
        actionItems: [
          { text: "Set Q3 stretch goals", ownerId: "emp1", due: "2024-07-01" }
        ],
        empSigned: true,
        mgrSigned: true
      }
    }
  ];

  const getMeetingTypeLabel = (type: MeetingType) => {
    const labels = {
      goal_setting: "Goal Setting",
      one_on_one: "1:1 Meeting",
      mid_year: "Mid-Year Review",
      year_end: "Year-End Review", 
      rating_discussion: "Rating Discussion"
    };
    return labels[type] || type;
  };

  const getMeetingTypeColor = (type: MeetingType) => {
    switch (type) {
      case "goal_setting": return "bg-blue-100 text-blue-800 border-blue-200";
      case "one_on_one": return "bg-green-100 text-green-800 border-green-200";
      case "mid_year": return "bg-orange-100 text-orange-800 border-orange-200";
      case "year_end": return "bg-purple-100 text-purple-800 border-purple-200";
      case "rating_discussion": return "bg-red-100 text-red-800 border-red-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "scheduled": return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "done": return "default";
      case "scheduled": return "secondary";
      default: return "outline";
    }
  };

  const columns = [
    {
      id: "type",
      header: "Meeting Type",
      accessor: "type" as keyof MeetingDTO,
      cell: ({ row }: { row: { original: MeetingDTO } }) => (
        <Badge variant="outline" className={getMeetingTypeColor(row.original.type)}>
          {getMeetingTypeLabel(row.original.type)}
        </Badge>
      ),
    },
    {
      id: "scheduledAt",
      header: "Date & Time",
      accessor: "scheduledAt" as keyof MeetingDTO,
      cell: ({ row }: { row: { original: MeetingDTO } }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              {format(new Date(row.original.scheduledAt), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(row.original.scheduledAt), "h:mm a")}</span>
          </div>
        </div>
      ),
    },
    {
      id: "location",
      header: "Location",
      accessor: "location" as keyof MeetingDTO,
      cell: ({ row }: { row: { original: MeetingDTO } }) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{row.original.location || "TBD"}</span>
        </div>
      ),
    },
    {
      id: "status", 
      header: "Status",
      accessor: "status" as keyof MeetingDTO,
      cell: ({ row }: { row: { original: MeetingDTO } }) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.original.status)}
          <Badge variant={getStatusVariant(row.original.status)}>
            {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
          </Badge>
        </div>
      ),
    },
    {
      id: "notes",
      header: "Notes & Sign-offs",
      accessor: "notes" as keyof MeetingDTO,
      cell: ({ row }: { row: { original: MeetingDTO } }) => (
        <div className="space-y-1">
          {row.original.notes?.publicNotes && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-3 h-3 text-muted-foreground" />
              <span className="truncate max-w-[200px]">
                {row.original.notes.publicNotes}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            {row.original.notes?.empSigned && (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Employee Signed
              </Badge>
            )}
            {row.original.notes?.mgrSigned && (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Manager Signed
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      accessor: "id" as keyof MeetingDTO,
      cell: ({ row }: { row: { original: MeetingDTO } }) => (
        <div className="flex items-center gap-2">
          {row.original.status === "scheduled" ? (
            <Button size="sm" variant="outline">
              <PenTool className="w-3 h-3 mr-1" />
              Prepare
            </Button>
          ) : (
            <Button size="sm" variant="outline">
              <FileText className="w-3 h-3 mr-1" />
              View Notes
            </Button>
          )}
        </div>
      ),
    },
  ];

  const filteredMeetings = mockMeetings.filter(meeting =>
    getMeetingTypeLabel(meeting.type).toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.notes?.publicNotes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingMeetings = mockMeetings.filter(m => m.status === "scheduled");
  const completedMeetings = mockMeetings.filter(m => m.status === "done");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">1:1 Meetings</h3>
          <p className="text-sm text-muted-foreground">
            Manage your one-on-one meetings and performance discussions
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMeetings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingMeetings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedMeetings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Items</CardTitle>
            <FileText className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {mockMeetings.reduce((sum, m) => sum + (m.notes?.actionItems?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search meetings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Meetings Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={filteredMeetings}
            columns={columns}
          />
        </CardContent>
      </Card>
    </div>
  );
}