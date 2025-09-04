import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BellCurveWidget } from "../shared/BellCurveWidget";
import { 
  Calendar, 
  Plus, 
  Settings, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Lock,
  Play,
  Pause,
  Archive
} from "lucide-react";
import { PerformanceCycleDTO, RatingKey } from "../../api/dtos";

export function PeriodsTab() {
  const [selectedCycle, setSelectedCycle] = useState<PerformanceCycleDTO | null>(null);

  // Mock data
  const mockCycles: PerformanceCycleDTO[] = [
    {
      id: "1",
      name: "FY 2024 Performance Cycle",
      startDate: "2024-01-01",
      endDate: "2024-12-31", 
      status: "active",
      windows: [
        {
          stage: "goal_setting",
          openAt: "2024-01-01T00:00:00Z",
          dueAt: "2024-01-31T23:59:59Z",
          closeAt: "2024-02-05T23:59:59Z",
          isLocked: false
        },
        {
          stage: "mid_year",
          openAt: "2024-06-01T00:00:00Z", 
          dueAt: "2024-06-30T23:59:59Z",
          closeAt: "2024-07-05T23:59:59Z",
          isLocked: false
        },
        {
          stage: "calibration",
          openAt: "2024-07-20T00:00:00Z",
          dueAt: "2024-07-31T23:59:59Z", 
          closeAt: "2024-08-05T23:59:59Z",
          isLocked: false
        }
      ],
      settings: {
        ratingLabels: {
          DME: { title: "Does Not Meet", description: "Performance below expectations" },
          BME: { title: "Barely Meets", description: "Performance meets minimum requirements" },
          ME: { title: "Meets", description: "Performance meets expectations" },
          EE: { title: "Exceeds", description: "Performance exceeds expectations" }
        },
        bellCurveDefaults: {
          DME: 10,
          BME: 20, 
          ME: 60,
          EE: 10
        },
        minCohortSize: 8,
        visibilityRule: "post_discussion",
        attachment: { maxMb: 10, types: ["pdf", "doc", "docx"] }
      }
    },
    {
      id: "2",
      name: "FY 2023 Performance Cycle",
      startDate: "2023-01-01",
      endDate: "2023-12-31",
      status: "archived",
      windows: [],
      settings: {
        ratingLabels: {
          DME: { title: "Does Not Meet", description: "Performance below expectations" },
          BME: { title: "Barely Meets", description: "Performance meets minimum requirements" },
          ME: { title: "Meets", description: "Performance meets expectations" },
          EE: { title: "Exceeds", description: "Performance exceeds expectations" }
        },
        bellCurveDefaults: { DME: 10, BME: 20, ME: 60, EE: 10 },
        minCohortSize: 8,
        visibilityRule: "post_discussion",
        attachment: { maxMb: 10, types: ["pdf", "doc", "docx"] }
      }
    }
  ];

  const mockBellCurveData = [
    {
      rating: "EE" as RatingKey,
      label: "Exceeds",
      target: 10,
      actual: 12,
      employees: [
        { id: "1", name: "John Smith" },
        { id: "2", name: "Sarah Johnson" }
      ]
    },
    {
      rating: "ME" as RatingKey,
      label: "Meets", 
      target: 60,
      actual: 58,
      employees: Array.from({ length: 15 }, (_, i) => ({
        id: `me-${i}`,
        name: `Employee ${i + 1}`
      }))
    },
    {
      rating: "BME" as RatingKey,
      label: "Barely Meets",
      target: 20,
      actual: 22,
      employees: Array.from({ length: 6 }, (_, i) => ({
        id: `bme-${i}`,
        name: `Employee ${i + 16}`
      }))
    },
    {
      rating: "DME" as RatingKey,
      label: "Does Not Meet",
      target: 10,
      actual: 8,
      employees: [
        { id: "dme-1", name: "Employee 22" },
        { id: "dme-2", name: "Employee 23" }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Play className="w-4 h-4 text-green-600" />;
      case "planned": return <Clock className="w-4 h-4 text-blue-600" />;
      case "locked": return <Lock className="w-4 h-4 text-orange-600" />;
      case "published": return <CheckCircle className="w-4 h-4 text-purple-600" />;
      case "archived": return <Archive className="w-4 h-4 text-gray-600" />;
      default: return <Pause className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "planned": return "secondary";
      case "locked": return "destructive";
      case "published": return "outline";
      case "archived": return "secondary";
      default: return "secondary";
    }
  };

  const activeCycle = mockCycles.find(c => c.status === "active");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Performance Periods</h3>
          <p className="text-sm text-muted-foreground">
            Manage performance cycles, rating scales, and distribution settings
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Cycle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cycles</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCycles.filter(c => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">84%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cycles Completed</CardTitle>
            <CheckCircle className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockCycles.filter(c => c.status === "archived").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cycles List */}
        <div className="space-y-4">
          <h4 className="font-medium">Performance Cycles</h4>
          {mockCycles.map((cycle) => (
            <Card 
              key={cycle.id}
              className={`cursor-pointer transition-colors ${
                selectedCycle?.id === cycle.id ? "border-primary" : ""
              }`}
              onClick={() => setSelectedCycle(cycle)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">{cycle.name}</h5>
                  <Badge variant={getStatusVariant(cycle.status)}>
                    {getStatusIcon(cycle.status)}
                    <span className="ml-1">
                      {cycle.status.charAt(0).toUpperCase() + cycle.status.slice(1)}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Duration:</span>
                  <span className="font-medium">
                    {cycle.startDate} - {cycle.endDate}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Windows:</span>
                  <span className="font-medium">{cycle.windows.length}</span>
                </div>

                {cycle.status === "active" && (
                  <div className="flex items-center gap-2">
                    <Progress value={65} className="flex-1 h-2" />
                    <span className="text-sm">65%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cycle Configuration */}
        <div>
          {selectedCycle ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Cycle Configuration
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Start Date</Label>
                      <Input value={selectedCycle.startDate} disabled />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">End Date</Label>
                      <Input value={selectedCycle.endDate} disabled />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium mb-3 block">Rating Scale</Label>
                    <div className="space-y-2">
                      {Object.entries(selectedCycle.settings.ratingLabels).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{key}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {label.title}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Min Cohort Size</Label>
                      <Input value={selectedCycle.settings.minCohortSize} disabled />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Visibility Rule</Label>
                      <Input value={selectedCycle.settings.visibilityRule} disabled />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bell Curve Widget */}
              {selectedCycle.status === "active" && (
                <BellCurveWidget
                  data={mockBellCurveData}
                  cohortSize={25}
                  minCohortSize={selectedCycle.settings.minCohortSize}
                  isEnforced={false}
                  onRequestException={() => console.log("Request exception")}
                />
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h4 className="font-medium mb-2">Select a Cycle</h4>
                <p className="text-sm text-muted-foreground">
                  Choose a performance cycle to view configuration and settings.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}