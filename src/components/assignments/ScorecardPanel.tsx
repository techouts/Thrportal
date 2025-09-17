import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserCheck, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Target,
  BarChart3,
  Calendar
} from 'lucide-react';

interface ScorecardPanelProps {
  type: 'project' | 'employee';
  data: any;
}

export function ScorecardPanel({ type, data }: ScorecardPanelProps) {
  if (type === 'project') {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Project Scorecard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Employees */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Total Allocated</span>
            </div>
            <span className="font-semibold">{data.totalEmployees}</span>
          </div>

          {/* Shadow Resources */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Shadow Resources</span>
              </div>
              <Badge variant="secondary">{data.shadowResources}</Badge>
            </div>
            <Progress value={data.shadowPct} className="w-full h-2" />
            <span className="text-xs text-muted-foreground">{data.shadowPct.toFixed(1)}% of team</span>
          </div>

          {/* Under-allocated */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm">Under 50% Dedicated</span>
            </div>
            <Badge variant={data.underAllocated > 0 ? "destructive" : "secondary"}>
              {data.underAllocated}
            </Badge>
          </div>

          {/* Over-allocated */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <span className="text-sm">Overallocated (>100%)</span>
            </div>
            <Badge variant={data.overAllocated > 0 ? "destructive" : "secondary"}>
              {data.overAllocated}
            </Badge>
          </div>

          {/* Bench Eligible */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Bench-eligible in 2w</span>
            </div>
            <span className="font-semibold">{data.benchEligibleIn2Weeks}</span>
          </div>

          {/* Monthly Cost */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm">Monthly Project Cost</span>
              </div>
              <span className="font-semibold">${data.monthlyCost.toLocaleString()}</span>
            </div>
            <div className="text-xs text-muted-foreground">Active + Shadow allocations</div>
          </div>

          {/* Hours Tracking */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Planned vs Actual</span>
              </div>
              <span className="text-sm">{data.actualHours}/{data.plannedHours}h</span>
            </div>
            <Progress value={(data.actualHours / data.plannedHours) * 100} className="w-full h-2" />
            <span className="text-xs text-muted-foreground">
              {((data.actualHours / data.plannedHours) * 100).toFixed(1)}% completion
            </span>
          </div>

          {/* Average Utilization */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Avg Utilization</span>
              </div>
              <span className="font-semibold">{data.avgUtilization.toFixed(1)}%</span>
            </div>
            <Progress value={data.avgUtilization} className="w-full h-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Employee scorecard
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Employee Scorecard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Allocations */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Total Allocations</span>
          </div>
          <span className="font-semibold">{data.totalAllocations} projects</span>
        </div>

        {/* Current Utilization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Current Utilization</span>
            </div>
            <span className="font-semibold">{data.currentUtilization}%</span>
          </div>
          <Progress 
            value={data.currentUtilization} 
            className={`w-full h-3 ${
              data.currentUtilization > 100 ? 'text-red-500' : 
              data.currentUtilization < 70 ? 'text-amber-500' : 'text-green-500'
            }`} 
          />
          <Badge variant={
            data.currentUtilization > 100 ? "destructive" : 
            data.currentUtilization < 70 ? "secondary" : "default"
          }>
            {data.currentUtilization > 100 ? "Overallocated" : 
             data.currentUtilization < 70 ? "Underutilized" : "Optimal"}
          </Badge>
        </div>

        {/* Shadow Allocations */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Shadow Allocations</span>
          </div>
          <Badge variant="secondary">{data.shadowAllocations}</Badge>
        </div>

        {/* Dedication Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Dedication Level</span>
          </div>
          <Badge variant={data.isDedicated ? "default" : "secondary"}>
            {data.isDedicated ? "Dedicated (>70%)" : "Non-Dedicated (<70%)"}
          </Badge>
        </div>

        {/* Overallocation Warning */}
        {data.isOverallocated && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm">Overallocation Risk</span>
            </div>
            <Badge variant="destructive">High</Badge>
          </div>
        )}

        {/* Bench Days */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Bench Days</span>
          </div>
          <span className="font-semibold">{data.benchDays} days</span>
        </div>

        {/* Monthly Cost */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm">Monthly Cost</span>
            </div>
            <span className="font-semibold">${data.monthlyCost.toLocaleString()}</span>
          </div>
          <div className="text-xs text-muted-foreground">Role rate × allocation</div>
        </div>

        {/* Top Skills */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Top Skills</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {data.topSkills?.map((skill: string) => (
              <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}