import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building, Building2, Users, Target, Link } from "lucide-react";
import { GoalDTO, GoalType } from "../../api/dtos";

interface GoalAlignmentPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentGoals: {
    company: GoalDTO[];
    department: GoalDTO[];
    team: GoalDTO[];
  };
  onAlignToGoal: (parentGoalId: string) => void;
  currentGoalType: GoalType;
}

export function GoalAlignmentPanel({
  open,
  onOpenChange,
  parentGoals,
  onAlignToGoal,
  currentGoalType,
}: GoalAlignmentPanelProps) {
  const getGoalTypeIcon = (type: GoalType) => {
    switch (type) {
      case "COMPANY": return <Building className="w-4 h-4" />;
      case "DEPARTMENT": return <Building2 className="w-4 h-4" />;
      case "TEAM": return <Users className="w-4 h-4" />;
      case "PERSONAL": return <Target className="w-4 h-4" />;
    }
  };

  const getGoalTypeColor = (type: GoalType) => {
    switch (type) {
      case "COMPANY": return "bg-purple-100 text-purple-800 border-purple-200";
      case "DEPARTMENT": return "bg-blue-100 text-blue-800 border-blue-200";
      case "TEAM": return "bg-green-100 text-green-800 border-green-200";
      case "PERSONAL": return "bg-orange-100 text-orange-800 border-orange-200";
    }
  };

  const getAvailableParentTypes = () => {
    switch (currentGoalType) {
      case "PERSONAL": return ["COMPANY", "DEPARTMENT", "TEAM"];
      case "TEAM": return ["COMPANY", "DEPARTMENT"];
      case "DEPARTMENT": return ["COMPANY"];
      default: return [];
    }
  };

  const availableTypes = getAvailableParentTypes();

  const renderGoalSection = (type: GoalType, goals: GoalDTO[]) => {
    if (!availableTypes.includes(type) || goals.length === 0) return null;

    return (
      <Card key={type}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            {getGoalTypeIcon(type)}
            {type.charAt(0) + type.slice(1).toLowerCase()} Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="p-3 rounded-lg border border-border hover:border-primary/20 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-medium leading-tight">{goal.title}</h4>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getGoalTypeColor(goal.type)}`}
                  >
                    {goal.type}
                  </Badge>
                </div>
                
                {goal.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {goal.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {goal.kpi && (
                      <span>KPI: {goal.kpi}</span>
                    )}
                    {goal.target && (
                      <span>Target: {goal.target} {goal.unit}</span>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAlignToGoal(goal.id)}
                    className="text-xs"
                  >
                    <Link className="w-3 h-3 mr-1" />
                    Align
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Goal Alignment
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <p className="text-sm text-muted-foreground mb-6">
            Align your goal to existing company, department, or team goals to ensure strategic alignment and cascade.
          </p>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4">
              {renderGoalSection("COMPANY", parentGoals.company)}
              {renderGoalSection("DEPARTMENT", parentGoals.department)}
              {renderGoalSection("TEAM", parentGoals.team)}
              
              {availableTypes.every(type => {
                const goals = type === "COMPANY" ? parentGoals.company : 
                             type === "DEPARTMENT" ? parentGoals.department : 
                             parentGoals.team;
                return goals.length === 0;
              }) && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-sm font-medium mb-2">No Parent Goals Available</h3>
                    <p className="text-xs text-muted-foreground">
                      There are no published goals at higher levels to align with.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}