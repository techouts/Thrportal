import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/shared/DataTable";
import { 
  Target, 
  Plus, 
  Search, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Edit,
  Share
} from "lucide-react";
import { GoalDTO } from "../../api/dtos";

export function TeamGoalsTab() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const mockTeamGoals: GoalDTO[] = [
    {
      id: "1",
      type: "TEAM",
      title: "Improve Frontend Performance Across All Products",
      description: "Reduce page load times and optimize user experience",
      kpi: "Average Page Load Time",
      target: "2",
      unit: "seconds",
      weight: 40,
      progressPct: 85,
      status: "approved",
      dueDate: "2024-12-31"
    },
    {
      id: "2",
      type: "TEAM", 
      title: "Implement Design System Standards",
      description: "Standardize UI components across all applications",
      kpi: "Component Library Coverage",
      target: "90",
      unit: "%",
      weight: 30,
      progressPct: 65,
      status: "approved",
      dueDate: "2024-10-31"
    }
  ];

  const mockTeamMembers = [
    { id: "1", name: "John Smith", alignedGoals: 2, totalGoals: 3 },
    { id: "2", name: "Sarah Johnson", alignedGoals: 3, totalGoals: 3 },
    { id: "3", name: "Mike Chen", alignedGoals: 1, totalGoals: 2 },
    { id: "4", name: "Emily Davis", alignedGoals: 2, totalGoals: 2 },
  ];

  const alignmentCoverage = Math.round(
    (mockTeamMembers.reduce((sum, member) => sum + member.alignedGoals, 0) / 
     mockTeamMembers.reduce((sum, member) => sum + member.totalGoals, 0)) * 100
  );

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
      cell: (value: any, row: GoalDTO) => (
        <div className="space-y-1">
          <div className="font-medium">{row.title}</div>
          {row.description && (
            <div className="text-sm text-muted-foreground line-clamp-2">
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "kpi",
      header: "KPI & Target",
      accessor: "kpi" as keyof GoalDTO,
      cell: (value: any, row: GoalDTO) => (
        <div className="text-sm">
          {row.kpi && (
            <div className="font-medium">{row.kpi}</div>
          )}
          {row.target && (
            <div className="text-muted-foreground">
              Target: {row.target} {row.unit}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "progress",
      header: "Progress",
      accessor: "progressPct" as keyof GoalDTO,
      cell: (value: any, row: GoalDTO) => (
        <div className="w-24">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>{row.progressPct}%</span>
          </div>
          <Progress value={row.progressPct} className="h-2" />
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: "status" as keyof GoalDTO,
      cell: (value: any, row: GoalDTO) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.status)}
          <Badge variant={getStatusVariant(row.status)}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </Badge>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      accessor: "id" as keyof GoalDTO,
      cell: (value: any, row: GoalDTO) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="outline">
            <Share className="w-3 h-3 mr-1" />
            Publish
          </Button>
        </div>
      ),
    },
  ];

  const filteredGoals = mockTeamGoals.filter(goal =>
    goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    goal.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Goals</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage goals for your team aligned with department objectives
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Team Goal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Goals</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTeamGoals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTeamMembers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alignment Coverage</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{alignmentCoverage}%</div>
            <p className="text-xs text-muted-foreground">
              Members with aligned goals
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(mockTeamGoals.reduce((sum, g) => sum + g.progressPct, 0) / mockTeamGoals.length)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Alignment Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Goal Alignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTeamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">{member.name.charAt(0)}</span>
                  </div>
                  <span className="font-medium">{member.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {member.alignedGoals}/{member.totalGoals} goals aligned
                  </div>
                  <div className="w-24">
                    <Progress 
                      value={(member.alignedGoals / member.totalGoals) * 100} 
                      className="h-2" 
                    />
                  </div>
                  <Badge 
                    variant={member.alignedGoals === member.totalGoals ? "default" : "secondary"}
                  >
                    {Math.round((member.alignedGoals / member.totalGoals) * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search team goals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Goals Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={filteredGoals}
            columns={columns}
          />
        </CardContent>
      </Card>
    </div>
  );
}