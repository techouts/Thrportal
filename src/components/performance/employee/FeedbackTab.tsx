import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, User, Calendar, Download, Search, Star } from "lucide-react";
import { FeedbackRequestDTO } from "@/types/performance";

export function FeedbackTab() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - will be replaced with real API data
  const mockFeedbackRequests: FeedbackRequestDTO[] = [
    {
      id: "feedback-1",
      requesterId: "mgr-001",
      subjectEmpId: "emp-001",
      cycleId: "cycle-2024",
      isAnonymous: false,
      respondentIds: ["emp-002", "emp-003", "emp-004"],
      status: "closed",
      responses: [
        {
          id: "response-1",
          responderId: "emp-002",
          content: "John is an excellent collaborator who always delivers high-quality work. His technical skills are strong and he's very helpful to junior team members.",
          ratingHint: 4,
          createdAt: "2024-05-15T00:00:00Z",
        },
        {
          id: "response-2",
          responderId: "emp-003",
          content: "John has been instrumental in our React migration project. He shows great attention to detail and is always willing to help others. His communication skills have improved significantly this year.",
          ratingHint: 4,
          createdAt: "2024-05-18T00:00:00Z",
        },
        {
          id: "response-3",
          responderId: "emp-004",
          content: "Working with John has been a pleasure. He brings creative solutions to complex problems and maintains a positive attitude even under pressure. I've learned a lot from his approach to problem-solving.",
          ratingHint: 3,
          createdAt: "2024-05-20T00:00:00Z",
        },
      ],
      createdAt: "2024-05-10T00:00:00Z",
      updatedAt: "2024-05-20T00:00:00Z",
    },
    {
      id: "feedback-2",
      requesterId: "mgr-001",
      subjectEmpId: "emp-001",
      cycleId: "cycle-2024",
      isAnonymous: true,
      respondentIds: ["emp-005", "emp-006"],
      status: "open",
      responses: [
        {
          id: "response-4",
          responderId: "emp-005",
          content: "Great leadership qualities and technical expertise. Always approachable for questions and provides constructive feedback.",
          ratingHint: 4,
          createdAt: "2024-06-01T00:00:00Z",
        },
      ],
      createdAt: "2024-05-25T00:00:00Z",
      updatedAt: "2024-06-01T00:00:00Z",
    },
  ];

  // Mock employee data for respondent names
  const mockEmployees = {
    "emp-002": { name: "Sarah Johnson", role: "Senior Developer" },
    "emp-003": { name: "Mike Chen", role: "Tech Lead" },
    "emp-004": { name: "Lisa Davis", role: "Product Manager" },
    "emp-005": { name: "Anonymous", role: "Team Member" },
    "emp-006": { name: "Anonymous", role: "Team Member" },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "closed": return "default";
      case "open": return "secondary";
      default: return "outline";
    }
  };

  const getRatingStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  const filteredFeedback = mockFeedbackRequests.filter(request =>
    request.responses?.some(response =>
      response.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const allResponses = filteredFeedback.flatMap(request =>
    request.responses?.map(response => ({
      ...response,
      isAnonymous: request.isAnonymous,
      requestId: request.id,
    })) || []
  );

  const handleDownloadSummary = () => {
    console.log("Downloading feedback summary...");
    // Generate and download PDF summary
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Feedback</h3>
          <p className="text-sm text-muted-foreground">
            View feedback from your peers and manager
          </p>
        </div>
        <Button variant="outline" onClick={handleDownloadSummary}>
          <Download className="w-4 h-4 mr-2" />
          Download Summary
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Requests</CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockFeedbackRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <User className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allResponses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allResponses.filter(r => r.ratingHint).length > 0
                ? (allResponses.reduce((acc, r) => acc + (r.ratingHint || 0), 0) /
                   allResponses.filter(r => r.ratingHint).length).toFixed(1)
                : "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Cycle</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockFeedbackRequests.filter(r => r.cycleId === "cycle-2024").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Feedback Requests */}
      <div className="space-y-4">
        {filteredFeedback.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Feedback Request - {new Date(request.createdAt).toLocaleDateString()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {request.isAnonymous && (
                    <Badge variant="outline">Anonymous</Badge>
                  )}
                  <Badge variant={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {request.responses?.length || 0} of {request.respondentIds.length} responses received
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {request.responses?.map((response) => {
                  const respondent = mockEmployees[response.responderId as keyof typeof mockEmployees];
                  
                  return (
                    <div key={response.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {request.isAnonymous ? "Anonymous" : respondent?.name}
                            </div>
                            {!request.isAnonymous && (
                              <div className="text-sm text-muted-foreground">
                                {respondent?.role}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getRatingStars(response.ratingHint)}
                          <span className="text-xs text-muted-foreground">
                            {new Date(response.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{response.content}</p>
                    </div>
                  );
                })}
                
                {(!request.responses || request.responses.length === 0) && (
                  <div className="text-center py-4 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No responses yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFeedback.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No feedback found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms." : "No feedback requests have been created yet."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Feedback Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">Receiving Feedback</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Read all feedback with an open mind</li>
                <li>• Look for patterns across multiple responses</li>
                <li>• Focus on specific examples and suggestions</li>
                <li>• Consider feedback as growth opportunities</li>
                <li>• Follow up with respondents if needed</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">Confidentiality</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Anonymous feedback protects respondent identity</li>
                <li>• Do not share feedback content with others</li>
                <li>• Respect the confidential nature of responses</li>
                <li>• Use feedback for personal development only</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}