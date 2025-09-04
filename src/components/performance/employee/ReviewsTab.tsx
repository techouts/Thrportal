import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { FileText, Clock, CheckCircle, Download, Save, Send } from "lucide-react";
import { ReviewDTO } from "@/types/performance";

export function ReviewsTab() {
  const [selectedReview, setSelectedReview] = useState<string | null>(null);

  // Mock data - will be replaced with real API data
  const mockReview: ReviewDTO = {
    id: "review-1",
    cycleId: "cycle-2024",
    empId: "emp-001",
    stage: "mid_year",
    status: "draft",
    items: [
      {
        goalId: "goal-1",
        selfRating: 4,
        notesSelf: "Successfully migrated 20 out of 25 components. Ahead of schedule and quality is high.",
      },
      {
        goalId: "goal-2",
        selfRating: 3,
        notesSelf: "Increased test coverage from 65% to 78%. Still working towards the 85% target.",
      },
      {
        goalId: "goal-3",
        selfRating: 3,
        notesSelf: "Conducted 6 mentoring sessions so far. Good feedback from junior team members.",
      },
    ],
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-06-15T00:00:00Z",
  };

  const mockGoals = [
    {
      id: "goal-1",
      title: "Complete React Migration Project",
      description: "Migrate legacy components to React 18 and implement new features",
      target: "25 components",
      progressPct: 85,
    },
    {
      id: "goal-2",
      title: "Improve Code Quality Metrics",
      description: "Increase unit test coverage and reduce technical debt",
      target: "85% coverage",
      progressPct: 70,
    },
    {
      id: "goal-3",
      title: "Leadership Development",
      description: "Mentor junior developers and lead technical discussions",
      target: "12 sessions",
      progressPct: 50,
    },
  ];

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return "Does Not Meet Expectations";
      case 2: return "Barely Meets Expectations";
      case 3: return "Meets Expectations";
      case 4: return "Exceeds Expectations";
      default: return "Not Rated";
    }
  };

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 1: return "text-red-600";
      case 2: return "text-orange-600";
      case 3: return "text-green-600";
      case 4: return "text-blue-600";
      default: return "text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "default";
      case "draft": return "secondary";
      case "published": return "default";
      default: return "outline";
    }
  };

  const handleSaveReview = () => {
    console.log("Saving review...");
    // API call to save review
  };

  const handleSubmitReview = () => {
    console.log("Submitting review...");
    // API call to submit review
  };

  const handleDownloadPDF = () => {
    console.log("Downloading PDF...");
    // Generate and download PDF
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Performance Reviews</h3>
          <p className="text-sm text-muted-foreground">
            Complete your self-review and view manager feedback
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Review Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Mid-Year Review 2024
            </CardTitle>
            <Badge variant={getStatusColor(mockReview.status)}>
              {mockReview.status === "draft" ? "In Progress" : mockReview.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Due: June 30, 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">3 of 3 goals reviewed</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Last updated: June 15, 2024</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Self-Review Form */}
      <Card>
        <CardHeader>
          <CardTitle>Self-Review</CardTitle>
          <p className="text-sm text-muted-foreground">
            Reflect on your performance against each goal and provide evidence of your achievements.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {mockGoals.map((goal, index) => {
            const reviewItem = mockReview.items.find(item => item.goalId === goal.id);
            
            return (
              <div key={goal.id} className="border rounded-lg p-4 space-y-4">
                <div>
                  <h4 className="font-medium">{goal.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress: {goal.progressPct}%</span>
                      <span>Target: {goal.target}</span>
                    </div>
                    <Progress value={goal.progressPct} className="h-2" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Self-Rating</label>
                  <div className="mt-2 flex gap-2">
                    {[1, 2, 3, 4].map((rating) => (
                      <Button
                        key={rating}
                        variant={reviewItem?.selfRating === rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          // Update rating logic here
                          console.log(`Rating ${rating} for goal ${goal.id}`);
                        }}
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                  {reviewItem?.selfRating && (
                    <p className={`text-sm mt-1 ${getRatingColor(reviewItem.selfRating)}`}>
                      {getRatingLabel(reviewItem.selfRating)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Self-Reflection & Evidence</label>
                  <Textarea
                    placeholder="Describe your achievements, challenges overcome, and evidence of your performance..."
                    value={reviewItem?.notesSelf || ""}
                    onChange={(e) => {
                      // Update notes logic here
                      console.log(`Notes updated for goal ${goal.id}:`, e.target.value);
                    }}
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
            );
          })}

          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium">Overall Self-Assessment</h4>
            <Textarea
              placeholder="Provide an overall reflection on your performance, key achievements, areas for development, and goals for the next period..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Manager Review (Read-only, shows after discussion) */}
      <Card>
        <CardHeader>
          <CardTitle>Manager Review</CardTitle>
          <p className="text-sm text-muted-foreground">
            Your manager's review will be visible after your rating discussion meeting.
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Manager review will be available after rating discussion</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={handleSaveReview}>
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
        <Button onClick={handleSubmitReview} disabled={mockReview.status === "submitted"}>
          <Send className="w-4 h-4 mr-2" />
          Submit Review
        </Button>
      </div>

      {/* Review Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Review Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">Self-Rating Scale</h5>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-red-100 text-red-800 text-xs flex items-center justify-center">1</span>
                  <span>Does Not Meet Expectations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-orange-100 text-orange-800 text-xs flex items-center justify-center">2</span>
                  <span>Barely Meets Expectations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-green-100 text-green-800 text-xs flex items-center justify-center">3</span>
                  <span>Meets Expectations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-blue-100 text-blue-800 text-xs flex items-center justify-center">4</span>
                  <span>Exceeds Expectations</span>
                </div>
              </div>
            </div>
            <div>
              <h5 className="font-medium mb-2">Tips for Strong Evidence</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Include specific metrics and outcomes</li>
                <li>• Mention feedback from colleagues or customers</li>
                <li>• Reference completed projects or deliverables</li>
                <li>• Highlight skills development and learning</li>
                <li>• Note any challenges overcome</li>
                <li>• Provide examples of collaboration and leadership</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}