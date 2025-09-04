import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/shared/DataTable";
import { GoalAlignmentPanel } from "../shared/GoalAlignmentPanel";
import { 
  Target, 
  Plus, 
  Search, 
  Filter, 
  Link, 
  Paperclip, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle 
} from "lucide-react";
import { GoalDTO, GoalType } from "../../api/dtos";

export function MyGoalsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<GoalDTO | null>(null);
  const [showAlignmentPanel, setShowAlignmentPanel] = useState(false);

  // Mock data
  const mockGoals: GoalDTO[] = [
    {
      id: "1",
      type: "PERSONAL",
      title: "Improve JavaScript Performance Optimization",
      description: "Focus on advanced optimization techniques and best practices",
      kpi: "Page Load Time",
      target: "2",
      unit: "seconds",
      weight: 30,
      progressPct: 75,
      status: "approved",
      dueDate: "2024-12-31",
      attachments: [
        { id: "1", filename: "performance-plan.pdf", url: "#", sizeBytes: 1024000 }
      ]
    },
    {
      id: "2", 
      type: "PERSONAL",
      title: "Complete React Advanced Course",
      description: "Master advanced React patterns and hooks",
      kpi: "Course Completion",
      target: "100",
      unit: "%",
      weight: 20,
      progressPct: 45,
      status: "submitted",
      dueDate: "2024-10-31"
    }
  ];

  const mockParentGoals = {
    company: [
      {
        id: "c1",
        type: "COMPANY" as GoalType,
        title: "Improve Product Performance by 50%",
        description: "Enhance overall application performance across all products",
        progressPct: 60,
        status: "approved" as const
      }
    ],
    department: [
      {
        id: "d1", 
        type: "DEPARTMENT" as GoalType,
        title: "Reduce Page Load Times",
        description: "Optimize frontend performance across web applications",
        progressPct: 70,
        status: "approved" as const
      }
    ],
    team: [
      {
        id: "t1",
        type: "TEAM" as GoalType, 
        title: "Implement Performance Monitoring",
        description: "Set up comprehensive performance tracking tools",
        progressPct: 80,
        status: "approved" as const
      }
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "submitted": return <Clock className="w-4 h-4 text-blue-600" />;
      case "draft": return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "submitted": return "secondary"; 
      case "draft": return "outline";
      default: return "secondary";
    }
  };

  const columns = [
    {
      id: "title",
      header: "Goal",
      accessor: "title" as keyof GoalDTO,
      cell: ({ row }: { row: { original: GoalDTO } }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.title}</div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground line-clamp-1">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "kpi",
      header: "KPI & Target",
      accessor: "kpi" as keyof GoalDTO,
      cell: ({ row }: { row: { original: GoalDTO } }) => (
        <div className="text-sm">
          {row.original.kpi && (
            <div className="font-medium">{row.original.kpi}</div>
          )}
          {row.original.target && (
            <div className="text-muted-foreground">
              Target: {row.original.target} {row.original.unit}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "progress",
      header: "Progress",
      accessor: "progressPct" as keyof GoalDTO,
      cell: ({ row }: { row: { original: GoalDTO } }) => (
        <div className="w-24">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>{row.original.progressPct}%</span>
          </div>
          <Progress value={row.original.progressPct} className="h-2" />
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: "status" as keyof GoalDTO,
      cell: ({ row }: { row: { original: GoalDTO } }) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.original.status)}
          <Badge variant={getStatusVariant(row.original.status)}>
            {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
          </Badge>
        </div>
      ),
    },
    {
      id: "dueDate",
      header: "Due Date",
      accessor: "dueDate" as keyof GoalDTO,
      cell: ({ row }: { row: { original: GoalDTO } }) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          {row.original.dueDate ? 
            new Date(row.original.dueDate).toLocaleDateString() : 
            "No due date"
          }
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      accessor: "id" as keyof GoalDTO,
      cell: ({ row }: { row: { original: GoalDTO } }) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            Edit
          </Button>
          {row.original.attachments && row.original.attachments.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Paperclip className="w-3 h-3 mr-1" />
              {row.original.attachments.length}
            </Badge>
          )}
        </div>
      ),
    },
  ];

  const filteredGoals = mockGoals.filter(goal =>
    goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    goal.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAlignToGoal = (parentGoalId: string) => {
    console.log("Aligning to goal:", parentGoalId);
    setShowAlignmentPanel(false);
    // Handle goal alignment logic
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">My Goals</h3>
          <p className="text-sm text-muted-foreground">
            Create and track your personal performance goals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAlignmentPanel(true)}
          >
            <Link className="w-4 h-4 mr-2" />
            Align Goals
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockGoals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockGoals.filter(g => g.status === "approved").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <Clock className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockGoals.filter(g => g.status === "submitted").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockGoals.reduce((sum, g) => sum + g.progressPct, 0) / mockGoals.length)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search goals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Goals Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={filteredGoals}
            columns={columns}
            onRowClick={(goal) => setSelectedGoal(goal)}
          />
        </CardContent>
      </Card>

      {/* Goal Alignment Panel */}
      <GoalAlignmentPanel
        open={showAlignmentPanel}
        onOpenChange={setShowAlignmentPanel}
        parentGoals={mockParentGoals}
        onAlignToGoal={handleAlignToGoal}
        currentGoalType="PERSONAL"
      />
    </div>
  );
}