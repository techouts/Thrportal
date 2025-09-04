import { useState, useEffect } from 'react'
import { SortDesc, Download, FileText, Split, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { ApplicationsService } from '@/services/applicationsService'
import { Submission, MatchFilters } from '@/types/applications'
import { useToast } from '@/hooks/use-toast'

export function JDResumeMatchTab() {
  const [matches, setMatches] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<MatchFilters>({
    limit: 10
  })
  const { toast } = useToast()

  const loadMatches = async () => {
    if (!filters.jdId) {
      setMatches([])
      return
    }

    try {
      setLoading(true)
      const data = await ApplicationsService.getMatches(filters)
      setMatches(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMatches()
  }, [filters])

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMatchScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 50) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">JD-Resume Match</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadMatches} disabled={!filters.jdId}>
            <SortDesc className="mr-2 h-4 w-4" />
            Rank By Match %
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Match Report
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Match Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select JD <span className="text-red-500">*</span></label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, jdId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose JD to match" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jd-001">Senior React Developer - TechCorp</SelectItem>
                  <SelectItem value="jd-002">DevOps Engineer - CloudSoft</SelectItem>
                  <SelectItem value="jd-003">Data Scientist - DataTech</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Min Experience (yrs)</label>
              <Input 
                type="number" 
                placeholder="Min years"
                onChange={(e) => setFilters(prev => ({ ...prev, expMin: parseInt(e.target.value) || undefined }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Experience (yrs)</label>
              <Input 
                type="number" 
                placeholder="Max years"
                onChange={(e) => setFilters(prev => ({ ...prev, expMax: parseInt(e.target.value) || undefined }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input 
                placeholder="Enter location"
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value || undefined }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Internal">Internal</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search in resumes</label>
              <Input 
                placeholder="Skills, keywords..."
                onChange={(e) => setFilters(prev => ({ ...prev, searchIn: e.target.value || undefined }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Resumes</label>
              <Select 
                value={filters.limit?.toString()} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, limit: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Results */}
      {!filters.jdId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Please select a JD to view matching resumes</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading matches...</p>
          </CardContent>
        </Card>
      ) : matches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No matching resumes found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {matches.map((match) => (
            <Card key={match.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">Alice Johnson</h3>
                    <Badge variant="outline" className="text-xs">Internal</Badge>
                    <Badge className={`text-xs ${getMatchScoreColor(match.match.score)} ${getMatchScoreBg(match.match.score)}`}>
                      {match.match.score}% Match
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      View Resume
                    </Button>
                    <Button variant="outline" size="sm">
                      <Split className="mr-2 h-4 w-4" />
                      Compare
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Feedback
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Match Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-green-600">✓ Matched Skills</label>
                    <div className="flex flex-wrap gap-1">
                      {match.match.matched && match.match.matched.length > 0 ? (
                        match.match.matched.map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs bg-green-50 text-green-700">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-yellow-600">⚠ Missing Skills</label>
                    <div className="flex flex-wrap gap-1">
                      {match.match.missing && match.match.missing.length > 0 ? (
                        match.match.missing.map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-600">➕ Extra Skills</label>
                    <div className="flex flex-wrap gap-1">
                      {match.match.extra && match.match.extra.length > 0 ? (
                        match.match.extra.map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Dimensions */}
                {match.match.dims && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Match Breakdown</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Skills</span>
                          <span>{match.match.dims.skills}%</span>
                        </div>
                        <Progress value={match.match.dims.skills} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Experience</span>
                          <span>{match.match.dims.exp}%</span>
                        </div>
                        <Progress value={match.match.dims.exp} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Education</span>
                          <span>{match.match.dims.edu}%</span>
                        </div>
                        <Progress value={match.match.dims.edu} className="h-2" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button size="sm">Shortlist</Button>
                  <Button variant="secondary" size="sm">Reject</Button>
                  <Button variant="ghost" size="sm">Schedule Interview</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}