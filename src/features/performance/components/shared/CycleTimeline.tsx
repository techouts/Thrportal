import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, Lock } from "lucide-react";
import { CycleWindowDTO } from "../../api/dtos";
import { format } from "date-fns";

interface CycleTimelineProps {
  cycleName: string;
  windows: CycleWindowDTO[];
  onStageClick?: (stage: CycleWindowDTO) => void;
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  };
}

export function CycleTimeline({
  cycleName,
  windows,
  onStageClick,
  primaryAction,
}: CycleTimelineProps) {
  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      goal_setting: "Goal Setting",
      mid_year: "Mid-Year Review",
      year_end: "Year-End Review",
      mgr_review: "Manager Review",
      calibration: "Calibration",
      rating_discussion: "Rating Discussion",
      publish: "Publish Results",
    };
    return labels[stage] || stage;
  };

  const getStageIcon = (window: CycleWindowDTO) => {
    if (window.isLocked) return <Lock className="w-4 h-4" />;
    
    const now = new Date();
    const openAt = new Date(window.openAt);
    const closeAt = new Date(window.closeAt);
    
    if (now > closeAt) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (now >= openAt) return <Clock className="w-4 h-4 text-blue-600" />;
    return <Calendar className="w-4 h-4 text-muted-foreground" />;
  };

  const getStageStatus = (window: CycleWindowDTO) => {
    const now = new Date();
    const openAt = new Date(window.openAt);
    const dueAt = new Date(window.dueAt);
    const closeAt = new Date(window.closeAt);
    
    if (window.isLocked) return "locked";
    if (now > closeAt) return "completed";
    if (now >= openAt && now <= dueAt) return "active";
    if (now > dueAt && now <= closeAt) return "overdue";
    return "upcoming";
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "active": return "secondary";
      case "overdue": return "destructive";
      case "locked": return "outline";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Completed";
      case "active": return "Active";
      case "overdue": return "Overdue";
      case "locked": return "Locked";
      default: return "Upcoming";
    }
  };

  const calculateOverallProgress = () => {
    const completedStages = windows.filter(w => {
      const now = new Date();
      const closeAt = new Date(w.closeAt);
      return now > closeAt;
    });
    return (completedStages.length / windows.length) * 100;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{cycleName}</h3>
              <p className="text-sm text-muted-foreground">
                Performance cycle timeline and progress
              </p>
            </div>
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                variant={primaryAction.variant || "default"}
              >
                {primaryAction.label}
              </Button>
            )}
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(calculateOverallProgress())}%</span>
            </div>
            <Progress value={calculateOverallProgress()} className="h-2" />
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {windows.map((window, index) => {
              const status = getStageStatus(window);
              const isClickable = onStageClick && !window.isLocked;
              
              return (
                <div
                  key={window.stage}
                  className={`relative p-4 rounded-lg border transition-colors ${
                    isClickable
                      ? "cursor-pointer hover:bg-muted/50"
                      : ""
                  } ${
                    status === "active"
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => isClickable && onStageClick(window)}
                >
                  <div className="space-y-3">
                    {/* Stage Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getStageIcon(window)}
                        <span className="text-sm font-medium">
                          {getStageLabel(window.stage)}
                        </span>
                      </div>
                      <Badge variant={getStatusVariant(status)} className="text-xs">
                        {getStatusLabel(status)}
                      </Badge>
                    </div>

                    {/* Dates */}
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Opens: {format(new Date(window.openAt), "MMM d")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Due: {format(new Date(window.dueAt), "MMM d")}</span>
                      </div>
                    </div>

                    {/* Progress indicator for active stage */}
                    {status === "active" && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>65%</span>
                        </div>
                        <Progress value={65} className="h-1" />
                      </div>
                    )}
                  </div>

                  {/* Stage number */}
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}