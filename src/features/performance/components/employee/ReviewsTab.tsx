import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Save, 
  Send, 
  Star, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Eye,
  Download
} from "lucide-react";
import { ReviewDTO } from "../../api/dtos";

export function ReviewsTab() {
  const [selectedReview, setSelectedReview] = useState<ReviewDTO | null>(null);
  const [selfRating, setSelfRating] = useState<number>(0);
  const [selfNotes, setSelfNotes] = useState("");

  // Mock data
  const mockReviews: ReviewDTO[] = [
    {
      id: "1",
      cycleId: "cycle1",
      empId: "emp1",
      stage: "mid_year",
      status: "submitted",
      items: [
        {
          goalId: "goal1",
          selfRating: 4,
          notesSelf: "Exceeded expectations by optimizing performance by 40%",
          notesMgr: "Excellent work on performance optimization initiatives"
        },
        {
          goalId: "goal2", 
          selfRating: 3,
          notesSelf: "Completed React course but still working on advanced patterns",
          notesMgr: "Good progress, continue building expertise"
        }
      ],
      rating: {
        finalRating: 4,
        visibleToEmp: false
      },
      submittedAt: "2024-06-15T10:30:00Z"
    },
    {
      id: "2",
      cycleId: "cycle1",
      empId: "emp1", 
      stage: "year_end",
      status: "draft",
      items: [
        {
          goalId: "goal1",
          selfRating: 0,
          notesSelf: "",
        }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "draft": return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case "finalized": return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "submitted": return "default";
      case "draft": return "secondary";
      case "finalized": return "outline";
      default: return "secondary";
    }
  };

  const renderStarRating = (rating: number, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-pointer transition-colors ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }`}
            onClick={() => onChange?.(star)}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {rating > 0 ? `${rating}/4` : "Not rated"}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Performance Reviews</h3>
          <p className="text-sm text-muted-foreground">
            Complete your self-assessments and view manager feedback
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Reviews
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockReviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockReviews.filter(r => r.status === "submitted").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {mockReviews.filter(r => r.status === "draft").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">3.5/4</div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Review Cards */}
        <div className="space-y-4">
          <h4 className="font-medium">Review Periods</h4>
          {mockReviews.map((review) => (
            <Card 
              key={review.id} 
              className={`cursor-pointer transition-colors ${
                selectedReview?.id === review.id ? "border-primary" : ""
              }`}
              onClick={() => setSelectedReview(review)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium">
                      {review.stage === "mid_year" ? "Mid-Year Review" : "Year-End Review"}
                    </h5>
                    <Badge variant={getStatusVariant(review.status)}>
                      {getStatusIcon(review.status)}
                      <span className="ml-1">
                        {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                      </span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Goals Reviewed:</span>
                  <span className="font-medium">{review.items.length}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Progress:</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={review.status === "submitted" ? 100 : 30} 
                      className="w-16 h-2" 
                    />
                    <span>{review.status === "submitted" ? "100%" : "30%"}</span>
                  </div>
                </div>

                {review.submittedAt && (
                  <div className="text-xs text-muted-foreground">
                    Submitted: {new Date(review.submittedAt).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Review Form */}
        <div>
          {selectedReview ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {selectedReview.stage === "mid_year" ? "Mid-Year Review" : "Year-End Review"}
                  </CardTitle>
                  {selectedReview.status === "submitted" && (
                    <Badge variant="outline">
                      <Eye className="w-3 h-3 mr-1" />
                      Read Only
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedReview.items.map((item, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h6 className="font-medium">Goal {index + 1}</h6>
                      <Badge variant="outline">Weight: 30%</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Self Rating</Label>
                      {renderStarRating(
                        item.selfRating || selfRating, 
                        selectedReview.status === "draft" ? setSelfRating : undefined
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Self Assessment</Label>
                      <Textarea
                        value={item.notesSelf || selfNotes}
                        onChange={(e) => setSelfNotes(e.target.value)}
                        placeholder="Describe your achievements, challenges, and learnings for this goal..."
                        className="min-h-[100px]"
                        disabled={selectedReview.status === "submitted"}
                      />
                    </div>

                    {item.notesMgr && (
                      <div className="space-y-2">
                        <Label>Manager Feedback</Label>
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm">{item.notesMgr}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {selectedReview.status === "draft" && (
                  <div className="flex items-center gap-2 pt-4">
                    <Button variant="outline">
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h4 className="font-medium mb-2">Select a Review</h4>
                <p className="text-sm text-muted-foreground">
                  Choose a review period from the list to view details and complete your assessment.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}