import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Users, TrendingUp, AlertCircle } from "lucide-react";
import { RatingKey } from "../../api/dtos";

interface BellCurveData {
  rating: RatingKey;
  label: string;
  target: number;
  actual: number;
  employees: Array<{ id: string; name: string }>;
}

interface BellCurveWidgetProps {
  data: BellCurveData[];
  cohortSize: number;
  minCohortSize: number;
  isEnforced: boolean;
  onRequestException?: () => void;
  onMoveEmployee?: (empId: string, fromRating: RatingKey, toRating: RatingKey) => void;
}

export function BellCurveWidget({
  data,
  cohortSize,
  minCohortSize,
  isEnforced,
  onRequestException,
  onMoveEmployee,
}: BellCurveWidgetProps) {
  const isUnderThreshold = cohortSize < minCohortSize;
  const mode = isEnforced ? "Enforcement" : "Guidance";

  const getRatingColor = (rating: RatingKey) => {
    switch (rating) {
      case "EE": return "bg-green-500";
      case "ME": return "bg-blue-500";
      case "BME": return "bg-yellow-500";
      case "DME": return "bg-red-500";
    }
  };

  const getRatingBadgeColor = (rating: RatingKey) => {
    switch (rating) {
      case "EE": return "bg-green-100 text-green-800 border-green-200";
      case "ME": return "bg-blue-100 text-blue-800 border-blue-200";
      case "BME": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "DME": return "bg-red-100 text-red-800 border-red-200";
    }
  };

  const calculateVariance = (target: number, actual: number) => {
    return Math.abs(target - actual);
  };

  const getTotalVariance = () => {
    return data.reduce((sum, item) => sum + calculateVariance(item.target, item.actual), 0);
  };

  const hasViolations = () => {
    return data.some(item => {
      const variance = calculateVariance(item.target, item.actual);
      return isEnforced && variance > 5; // 5% tolerance
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Bell Curve Distribution
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isEnforced ? "destructive" : "secondary"}>
              {mode} Mode
            </Badge>
            {isUnderThreshold && (
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Under Threshold
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Cohort Info */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Cohort Size: {cohortSize}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Min Required: {minCohortSize}
          </div>
        </div>

        {/* Warning for under threshold */}
        {isUnderThreshold && (
          <div className="flex items-start gap-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-800">Below Minimum Cohort Size</p>
              <p className="text-orange-700">
                Distribution is in guidance mode only. Need at least {minCohortSize} employees for enforcement.
              </p>
            </div>
          </div>
        )}

        {/* Distribution Bars */}
        <div className="space-y-4">
          {data.map((item) => {
            const variance = calculateVariance(item.target, item.actual);
            const isViolation = isEnforced && variance > 5;
            
            return (
              <div key={item.rating} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={getRatingBadgeColor(item.rating)}
                    >
                      {item.rating}
                    </Badge>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>Target: {item.target}%</span>
                    <span>Actual: {item.actual}%</span>
                    {variance > 0 && (
                      <Badge 
                        variant={isViolation ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {variance > 0 ? "+" : ""}{(item.actual - item.target).toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${getRatingColor(item.rating)} ${
                        isViolation ? "animate-pulse" : ""
                      }`}
                      style={{ width: `${Math.min(item.actual, 100)}%` }}
                    />
                    {/* Target indicator */}
                    <div
                      className="absolute top-0 h-3 w-0.5 bg-gray-800"
                      style={{ left: `${item.target}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                {/* Employee count */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>{item.employees.length} employees</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary and Actions */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span>Total Variance:</span>
            <Badge variant={getTotalVariance() > 10 ? "destructive" : "secondary"}>
              {getTotalVariance().toFixed(1)}%
            </Badge>
          </div>

          {hasViolations() && onRequestException && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <div className="flex-1 text-sm text-red-800">
                Distribution violates bell curve constraints in enforcement mode.
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={onRequestException}
                className="text-red-700 border-red-300"
              >
                Request Exception
              </Button>
            </div>
          )}

          {!isEnforced && (
            <div className="text-xs text-muted-foreground p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium text-blue-800 mb-1">Guidance Mode</p>
              <p className="text-blue-700">
                These percentages are recommendations. You can distribute ratings as needed.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}