import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, CheckCircle, AlertTriangle, Lock } from "lucide-react";
import { CycleTimelineStage } from "@/types/performance";
import { formatDistanceToNow, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface CycleTimelineProps {
  cycleName: string;
  stages: CycleTimelineStage[];
  onStageClick?: (stage: CycleTimelineStage) => void;
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary";
  };
}

export function CycleTimeline({ 
  cycleName, 
  stages, 
  onStageClick,
  primaryAction 
}: CycleTimelineProps) {
  const activeStage = stages.find(s => s.isActive);
  const completedStages = stages.filter(s => s.isCompleted).length;
  const overallProgress = (completedStages / stages.length) * 100;

  const getStageStatus = (stage: CycleTimelineStage) => {
    if (stage.isCompleted) return { variant: "default" as const, icon: CheckCircle };
    if (stage.isActive) return { variant: "secondary" as const, icon: Clock };
    if (stage.isLocked) return { variant: "destructive" as const, icon: Lock };
    
    const dueDate = parseISO(stage.dueAt);
    const isOverdue = new Date() > dueDate;
    
    return { 
      variant: isOverdue ? "destructive" as const : "outline" as const, 
      icon: isOverdue ? AlertTriangle : Calendar 
    };
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">{cycleName}</h2>
          <p className="text-sm text-muted-foreground">
            Performance cycle progress - {completedStages} of {stages.length} stages completed
          </p>
        </div>
        {primaryAction && (
          <Button 
            variant={primaryAction.variant || "default"}
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {stages.map((stage) => {
            const { variant, icon: StatusIcon } = getStageStatus(stage);
            const dueDate = parseISO(stage.dueAt);
            const isUpcoming = !stage.isCompleted && !stage.isActive;
            
            return (
              <div
                key={stage.stage}
                className={cn(
                  "p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50",
                  stage.isActive && "ring-2 ring-primary/20 bg-primary/5",
                  stage.isCompleted && "bg-muted/30"
                )}
                onClick={() => onStageClick?.(stage)}
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge variant={variant} className="text-xs">
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {stage.label}
                  </Badge>
                  {stage.completionPct !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {stage.completionPct}%
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Due: {formatDistanceToNow(dueDate, { addSuffix: true })}</span>
                  </div>
                  
                  {stage.isLocked && (
                    <div className="flex items-center gap-1 text-destructive">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </div>
                  )}
                </div>

                {stage.completionPct !== undefined && (
                  <Progress value={stage.completionPct} className="h-1 mt-2" />
                )}
              </div>
            );
          })}
        </div>

        {activeStage && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium">Current Stage: {activeStage.label}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Due {formatDistanceToNow(parseISO(activeStage.dueAt), { addSuffix: true })}
              {activeStage.completionPct !== undefined && 
                ` • ${activeStage.completionPct}% completed`
              }
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}