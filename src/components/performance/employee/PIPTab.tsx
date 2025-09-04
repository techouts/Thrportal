import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Calendar, CheckCircle, Clock, Users } from "lucide-react";
import { PIPDTO } from "@/types/performance";

export function PIPTab() {
  // Mock data - will be replaced with real API data
  // Note: PIP would only be visible if the employee actually has an active PIP
  const mockPIP: PIPDTO | null = null; // Set to null to show no active PIP

  const activePIPExample: PIPDTO = {
    id: "pip-1",
    empId: "emp-001",
    managerId: "mgr-001",
    cycleId: "cycle-2024",
    status: "active",
    milestones: [
      {
        title: "Complete Technical Training",
        due: "2024-07-15",
        done: true,
        notes: "Successfully completed React certification course",
      },
      {
        title: "Improve Code Review Quality",
        due: "2024-08-01",
        done: true,
        notes: "Implemented peer feedback suggestions, showing improvement",
      },
      {
        title: "Deliver Project on Time",
        due: "2024-08-31",
        done: false,
        notes: "Currently on track, 75% complete",
      },
      {
        title: "Demonstrate Leadership Skills",
        due: "2024-09-15",
        done: false,
        notes: "Leading small team for new feature development",
      },
    ],
    cadence: "Weekly 1:1 meetings with manager and monthly progress reviews",
    reason: "Performance below expectations in project delivery and code quality",
    expectedOutcome: "Meet performance standards and demonstrate consistent improvement",
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-08-01T00:00:00Z",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "secondary";
      case "completed": return "default";
      case "cancelled": return "outline";
      default: return "outline";
    }
  };

  const getMilestoneProgress = (milestones: typeof activePIPExample.milestones) => {
    if (!milestones) return 0;
    const completed = milestones.filter(m => m.done).length;
    return (completed / milestones.length) * 100;
  };

  // If no active PIP, show informational content
  if (!mockPIP) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Performance Improvement Plan (PIP)</h3>
          <p className="text-sm text-muted-foreground">
            Track your performance improvement plan progress and milestones
          </p>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Active PIP</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You currently do not have an active Performance Improvement Plan. 
              Keep up the great work meeting your performance expectations!
            </p>
          </CardContent>
        </Card>

        {/* Information about PIPs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Understanding Performance Improvement Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h5 className="font-medium mb-2">Purpose of a PIP</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Provide clear performance expectations</li>
                  <li>• Offer structured support for improvement</li>
                  <li>• Set specific, measurable goals</li>
                  <li>• Create accountability through regular check-ins</li>
                  <li>• Document progress and efforts</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">What to Expect</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Clear milestones with deadlines</li>
                  <li>• Regular meetings with your manager</li>
                  <li>• Additional training or resources</li>
                  <li>• Frequent feedback and guidance</li>
                  <li>• Documentation of your progress</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Success Factors</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Actively engage with the process</li>
                  <li>• Communicate openly about challenges</li>
                  <li>• Take ownership of your development</li>
                  <li>• Utilize available resources and support</li>
                  <li>• Meet deadlines and commitments</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Support Available</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Manager coaching and guidance</li>
                  <li>• HR support and resources</li>
                  <li>• Training and development opportunities</li>
                  <li>• Peer mentoring when appropriate</li>
                  <li>• Employee assistance programs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show active PIP (this would be the case if mockPIP was set to activePIPExample)
  const pip = activePIPExample; // This would be mockPIP in real implementation
  const progress = getMilestoneProgress(pip.milestones || []);
  const completedMilestones = pip.milestones?.filter(m => m.done).length || 0;
  const totalMilestones = pip.milestones?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Performance Improvement Plan</h3>
        <p className="text-sm text-muted-foreground">
          Track your PIP progress and work towards meeting performance expectations
        </p>
      </div>

      {/* PIP Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Active Performance Improvement Plan
            </CardTitle>
            <Badge variant={getStatusColor(pip.status)}>
              {pip.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Progress Overview</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Milestones Completed</span>
                    <span>{completedMilestones} of {totalMilestones}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {progress.toFixed(0)}% complete
                  </p>
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-2">Meeting Cadence</h5>
                <p className="text-sm text-muted-foreground">{pip.cadence}</p>
              </div>
            </div>
            
            {pip.reason && (
              <div>
                <h5 className="font-medium mb-2">Focus Areas</h5>
                <p className="text-sm text-muted-foreground">{pip.reason}</p>
              </div>
            )}
            
            {pip.expectedOutcome && (
              <div>
                <h5 className="font-medium mb-2">Expected Outcome</h5>
                <p className="text-sm text-muted-foreground">{pip.expectedOutcome}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Milestones & Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pip.milestones?.map((milestone, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 ${
                      milestone.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {milestone.done ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className={`font-medium ${milestone.done ? 'text-green-700' : ''}`}>
                        {milestone.title}
                      </h5>
                      {milestone.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {milestone.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span className={new Date(milestone.due) < new Date() && !milestone.done ? 'text-red-600' : ''}>
                      {new Date(milestone.due).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {milestone.done && (
                  <Badge variant="outline" className="text-xs">
                    Completed
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confidentiality Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-amber-800 mb-1">Confidentiality Notice</h5>
              <p className="text-sm text-amber-700">
                Your Performance Improvement Plan is confidential and visible only to you, 
                your manager, and HR. This information is used solely for supporting your 
                professional development and performance improvement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}