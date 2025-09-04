import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, Users, Clock, CheckCircle, MessageSquare } from "lucide-react";
import { MeetingDTO } from "@/types/performance";

export function OneOnOnesTab() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingDTO | null>(null);

  // Mock data - will be replaced with real API data
  const mockMeetings: MeetingDTO[] = [
    {
      id: "meeting-1",
      cycleId: "cycle-2024",
      empId: "emp-001",
      managerId: "mgr-001",
      type: "goal_setting",
      scheduledAt: "2024-01-15T14:00:00Z",
      location: "Conference Room A",
      status: "done",
      notes: {
        publicNotes: "Discussed Q1 goals and career development opportunities",
        privateNotes: "Employee is motivated and ready for new challenges",
        actionItems: [
          { text: "Complete React training", ownerId: "emp-001", due: "2024-02-15", completed: true },
          { text: "Set up mentoring schedule", ownerId: "mgr-001", due: "2024-01-30", completed: true },
        ],
        empSigned: true,
        mgrSigned: true,
      },
      createdAt: "2024-01-10T00:00:00Z",
      updatedAt: "2024-01-15T16:00:00Z",
    },
    {
      id: "meeting-2",
      cycleId: "cycle-2024",
      empId: "emp-001",
      managerId: "mgr-001",
      type: "one_on_one",
      scheduledAt: "2024-03-15T15:00:00Z",
      location: "Virtual - Teams",
      status: "done",
      notes: {
        publicNotes: "Regular check-in on project progress and any blockers",
        privateNotes: "Good progress on current projects, no major concerns",
        actionItems: [
          { text: "Review code with senior developer", ownerId: "emp-001", due: "2024-03-22", completed: true },
        ],
        empSigned: true,
        mgrSigned: true,
      },
      createdAt: "2024-03-10T00:00:00Z",
      updatedAt: "2024-03-15T16:30:00Z",
    },
    {
      id: "meeting-3",
      cycleId: "cycle-2024",
      empId: "emp-001",
      managerId: "mgr-001",
      type: "mid_year",
      scheduledAt: "2024-06-20T10:00:00Z",
      location: "Conference Room B",
      status: "scheduled",
      createdAt: "2024-06-10T00:00:00Z",
      updatedAt: "2024-06-10T00:00:00Z",
    },
  ];

  const getMeetingTypeLabel = (type: string) => {
    switch (type) {
      case "goal_setting": return "Goal Setting";
      case "one_on_one": return "Regular 1:1";
      case "mid_year": return "Mid-Year Review";
      case "year_end": return "Year-End Review";
      case "rating_discussion": return "Rating Discussion";
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
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
      cell: (value: any, row: MeetingDTO) => (
        <div className="space-y-1">
          <div className="font-medium">{getMeetingTypeLabel(row.type)}</div>
          <Badge variant="outline" className="text-xs">
            {row.location}
          </Badge>
        </div>
      ),
    },
    {
      id: "scheduledAt",
      header: "Date & Time",
      accessor: "scheduledAt" as keyof MeetingDTO,
      cell: (value: any, row: MeetingDTO) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {new Date(row.scheduledAt).toLocaleDateString()}
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(row.scheduledAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: "status" as keyof MeetingDTO,
      cell: (value: any, row: MeetingDTO) => (
        <Badge variant={getStatusColor(row.status)}>
          {row.status === "done" ? "Completed" : "Scheduled"}
        </Badge>
      ),
    },
    {
      id: "notes",
      header: "Notes & Actions",
      accessor: "notes" as keyof MeetingDTO,
      cell: (value: any, row: MeetingDTO) => {
        const actionItems = row.notes?.actionItems || [];
        const completedActions = actionItems.filter(a => a.completed).length;
        
        return (
          <div className="space-y-1">
            {row.notes?.publicNotes && (
              <div className="text-sm text-muted-foreground line-clamp-2">
                {row.notes.publicNotes}
              </div>
            )}
            {actionItems.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {completedActions}/{actionItems.length} actions done
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "signatures",
      header: "Signatures",
      accessor: (row: MeetingDTO) => row.notes?.empSigned || row.notes?.mgrSigned,
      cell: (value: any, row: MeetingDTO) => {
        if (!row.notes) return <span className="text-muted-foreground">-</span>;
        
        return (
          <div className="flex gap-1">
            {row.notes.empSigned && (
              <Badge variant="outline" className="text-xs">✓ Employee</Badge>
            )}
            {row.notes.mgrSigned && (
              <Badge variant="outline" className="text-xs">✓ Manager</Badge>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">1:1 Meetings</h3>
          <p className="text-sm text-muted-foreground">
            Schedule and track your one-on-one meetings with your manager
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule 1:1 Meeting</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-muted-foreground">Meeting scheduling form will be implemented here.</p>
            </div>
          </DialogContent>
        </Dialog>
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
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockMeetings.filter(m => m.status === "done").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockMeetings.filter(m => m.status === "scheduled").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Items</CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockMeetings.reduce((acc, m) => acc + (m.notes?.actionItems?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meetings Table */}
      <Card>
        <DataTable
          columns={columns}
          data={mockMeetings}
          emptyMessage="No meetings scheduled"
        />
      </Card>

      {/* Meeting Templates Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Meeting Templates & Agendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Goal Setting Discussion</div>
              <ul className="text-muted-foreground mt-1 space-y-1">
                <li>• Review current goals and progress</li>
                <li>• Set new objectives for the period</li>
                <li>• Discuss career development plans</li>
                <li>• Identify required resources and support</li>
              </ul>
            </div>
            <div>
              <div className="font-medium">Regular 1:1 Check-in</div>
              <ul className="text-muted-foreground mt-1 space-y-1">
                <li>• Project updates and blockers</li>
                <li>• Feedback and recognition</li>
                <li>• Professional development</li>
                <li>• Team dynamics and collaboration</li>
              </ul>
            </div>
            <div>
              <div className="font-medium">Mid-Year Review</div>
              <ul className="text-muted-foreground mt-1 space-y-1">
                <li>• Progress against H1 goals</li>
                <li>• Skills development review</li>
                <li>• Adjustment of H2 objectives</li>
                <li>• Career planning discussion</li>
              </ul>
            </div>
            <div>
              <div className="font-medium">Rating Discussion</div>
              <ul className="text-muted-foreground mt-1 space-y-1">
                <li>• Review final performance rating</li>
                <li>• Discuss achievements and growth areas</li>
                <li>• Set goals for next cycle</li>
                <li>• Plan development activities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Detail Dialog */}
      {selectedMeeting && (
        <Dialog open={!!selectedMeeting} onOpenChange={() => setSelectedMeeting(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {getMeetingTypeLabel(selectedMeeting.type)} - {new Date(selectedMeeting.scheduledAt).toLocaleDateString()}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedMeeting.notes?.publicNotes && (
                <div>
                  <h4 className="font-medium mb-2">Meeting Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedMeeting.notes.publicNotes}</p>
                </div>
              )}
              
              {selectedMeeting.notes?.actionItems && selectedMeeting.notes.actionItems.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Action Items</h4>
                  <div className="space-y-2">
                    {selectedMeeting.notes.actionItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className={`w-4 h-4 ${item.completed ? 'text-green-600' : 'text-muted-foreground'}`} />
                        <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                          {item.text}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Due: {new Date(item.due).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}