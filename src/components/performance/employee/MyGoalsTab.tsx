import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Plus, Search, Target, TrendingUp, Calendar, Paperclip } from "lucide-react";
import { GoalDTO } from "@/types/performance";

export function MyGoalsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  // Mock data - will be replaced with real API data
  const mockGoals: GoalDTO[] = [
    {
      id: "goal-1",
      type: "PERSONAL",
      title: "Complete React Migration Project",
      description: "Migrate legacy components to React 18 and implement new features",
      kpi: "Components migrated",
      target: "25",
      unit: "components",
      weight: 30,
      dueDate: "2024-09-30",
      progressPct: 85,
      status: "approved",
      parentGoalId: "team-goal-1",
      createdAt: "2024-01-15T00:00:00Z",
      updatedAt: "2024-06-15T00:00:00Z",
    },
    {
      id: "goal-2",
      type: "PERSONAL",
      title: "Improve Code Quality Metrics",
      description: "Increase unit test coverage and reduce technical debt",
      kpi: "Test coverage",
      target: "85",
      unit: "%",
      weight: 25,
      dueDate: "2024-08-31",
      progressPct: 70,
      status: "approved",
      createdAt: "2024-01-15T00:00:00Z",
      updatedAt: "2024-06-10T00:00:00Z",
    },
    {
      id: "goal-3",
      type: "PERSONAL",
      title: "Leadership Development",
      description: "Mentor junior developers and lead technical discussions",
      kpi: "Mentoring sessions",
      target: "12",
      unit: "sessions",
      weight: 20,
      dueDate: "2024-12-31",
      progressPct: 50,
      status: "submitted",
      createdAt: "2024-02-01T00:00:00Z",
      updatedAt: "2024-06-01T00:00:00Z",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "submitted": return "secondary";
      case "draft": return "outline";
      default: return "outline";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const columns = [
    {
      id: "title",
      header: "Goal",
      accessor: "title",
      cell: ({ row }: { row: { original: GoalDTO } }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.title}</div>
          <div className="text-sm text-muted-foreground line-clamp-2">
            {row.original.description}
          </div>
          {row.original.parentGoalId && (
            <Badge variant="outline" className="text-xs">
              Aligned to Team Goal
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "kpi",
      header: "KPI & Target",
      accessor: "kpi",
      cell: ({ row }: { row: { original: GoalDTO } }) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">{row.original.kpi}</div>
          <div className="text-sm text-muted-foreground">
            Target: {row.original.target} {row.original.unit}
          </div>
        </div>
      ),
    },
    {
      id: "progress",
      header: "Progress",
      cell: ({ row }: { row: { original: GoalDTO } }) => (
        <div className="space-y-1">
          <div className={`text-sm font-medium ${getProgressColor(row.original.progressPct)}`}>
            {row.original.progressPct}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${row.original.progressPct}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      id: "weight",
      header: "Weight",
      cell: ({ row }: { row: { original: GoalDTO } }) => (
        <Badge variant="outline">{row.original.weight}%</Badge>
      ),
    },
    {
      id: "dueDate",
      header: "Due Date",
      cell: ({ row }: { row: { original: GoalDTO } }) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4" />
          {new Date(row.original.dueDate || "").toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }: { row: { original: GoalDTO } }) => (
        <Badge variant={getStatusColor(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
  ];

  const filteredGoals = mockGoals.filter(goal =>
    goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    goal.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">My Goals</h3>
          <p className="text-sm text-muted-foreground">
            Manage your personal goals and track progress
          </p>
        </div>
        <Drawer open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen}>
          <DrawerTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Create New Goal</DrawerTitle>
            </DrawerHeader>
            <div className="p-6">
              <p className="text-muted-foreground">Goal creation form will be implemented here.</p>
            </div>
          </DrawerContent>
        </Drawer>
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
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockGoals.filter(g => g.progressPct >= 70).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockGoals.reduce((acc, g) => acc + g.progressPct, 0) / mockGoals.length)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due This Month</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
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
      </div>

      {/* Goals Table */}
      <Card>
        <DataTable
          columns={columns}
          data={filteredGoals}
          emptyMessage="No goals found"
        />
      </Card>

      {/* SMART Goals Helper */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            SMART Goals Framework
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-600">Specific</div>
              <div className="text-muted-foreground">Clear and well-defined</div>
            </div>
            <div>
              <div className="font-medium text-green-600">Measurable</div>
              <div className="text-muted-foreground">Quantifiable outcomes</div>
            </div>
            <div>
              <div className="font-medium text-yellow-600">Achievable</div>
              <div className="text-muted-foreground">Realistic and attainable</div>
            </div>
            <div>
              <div className="font-medium text-purple-600">Relevant</div>
              <div className="text-muted-foreground">Aligned with objectives</div>
            </div>
            <div>
              <div className="font-medium text-red-600">Time-bound</div>
              <div className="text-muted-foreground">Clear deadline</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}