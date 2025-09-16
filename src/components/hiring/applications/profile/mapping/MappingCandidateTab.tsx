import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, MapPin, DollarSign, Mail, MessageSquare, Send, Eye, CheckCircle, XCircle } from 'lucide-react'
import { MappingService } from '@/services/mappingService'
import { MappingCandidate } from '@/types/applications'
import { toast } from 'sonner'

interface MappingCandidateTabProps {
  jdId: string
}

export const MappingCandidateTab: React.FC<MappingCandidateTabProps> = ({ jdId }) => {
  const [candidates, setCandidates] = useState<MappingCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [filters, setFilters] = useState({
    skills: '',
    location: '',
    experience: '',
    availability: '',
    ctcRange: '',
    activelyLooking: true,
    consent: true,
    minMatchScore: 65
  })

  useEffect(() => {
    loadCandidates()
  }, [jdId, filters])

  const loadCandidates = async () => {
    try {
      setLoading(true)
      const data = await MappingService.getCandidatesForJD(jdId, {
        skills: filters.skills ? filters.skills.split(',').map(s => s.trim()) : undefined,
        location: filters.location && filters.location !== 'all' ? filters.location : undefined,
        experience: filters.experience && filters.experience !== 'all' ? { min: 0, max: 10 } : undefined,
        availability: filters.availability && filters.availability !== 'all' ? filters.availability : undefined,
        compensationRange: filters.ctcRange && filters.ctcRange !== 'all' ? { min: 0, max: 50, currency: 'INR' } : undefined,
        activelyLooking: filters.activelyLooking,
        consentStatus: filters.consent ? 'yes' : undefined,
        matchScoreRange: { min: filters.minMatchScore, max: 100 }
      })
      setCandidates(data)
    } catch (error) {
      toast.error('Failed to load candidates')
      console.error('Error loading candidates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInterestCheck = async (candidateId: string, channel: 'email' | 'whatsapp') => {
    try {
      await MappingService.sendInterestCheck([candidateId], jdId, 'default-template', channel)
      toast.success(`Interest check sent via ${channel}`)
    } catch (error) {
      toast.error('Failed to send interest check')
    }
  }

  const handleSubmitForApproval = async () => {
    if (selectedCandidates.length === 0) {
      toast.error('Please select at least one candidate')
      return
    }

    try {
      const mappingRequests = selectedCandidates.map(candidateId => ({
        candidateId,
        jdId,
        requestedBy: 'current-user', // This would come from auth context
        comments: `Mapping request for ${selectedCandidates.length} candidate(s)`
      }))
      
      await MappingService.submitForApproval(mappingRequests)
      toast.success(`${selectedCandidates.length} candidate(s) submitted for approval`)
      setSelectedCandidates([])
    } catch (error) {
      toast.error('Failed to submit for approval')
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-500'
    if (score >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability.toLowerCase()) {
      case 'immediate': return 'bg-green-500'
      case '15 days': return 'bg-yellow-500'
      case '30 days': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Find Best Candidates for This JD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitForApproval} 
              disabled={selectedCandidates.length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit for Approval ({selectedCandidates.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Skills</label>
              <Input
                placeholder="React, Python, etc."
                value={filters.skills}
                onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any location</SelectItem>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="delhi">Delhi</SelectItem>
                  <SelectItem value="pune">Pune</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Experience</label>
              <Select value={filters.experience} onValueChange={(value) => setFilters(prev => ({ ...prev, experience: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any experience</SelectItem>
                  <SelectItem value="0-2">0-2 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="6-10">6-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Availability</label>
              <Select value={filters.availability} onValueChange={(value) => setFilters(prev => ({ ...prev, availability: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any availability</SelectItem>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="15 days">15 days</SelectItem>
                  <SelectItem value="30 days">30 days</SelectItem>
                  <SelectItem value="60 days">60+ days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="actively-looking"
                checked={filters.activelyLooking}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, activelyLooking: !!checked }))}
              />
              <label htmlFor="actively-looking" className="text-sm font-medium">
                Actively Looking Only
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent"
                checked={filters.consent}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, consent: !!checked }))}
              />
              <label htmlFor="consent" className="text-sm font-medium">
                Has Consent
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Matching Candidates ({candidates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading candidates...</div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No matching candidates found. Try adjusting your filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCandidates.length === candidates.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCandidates(candidates.map(candidate => candidate.id))
                        } else {
                          setSelectedCandidates([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Current Stage</TableHead>
                  <TableHead>Consent</TableHead>
                  <TableHead>Actively Looking</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCandidates.includes(candidate.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCandidates(prev => [...prev, candidate.id])
                          } else {
                            setSelectedCandidates(prev => prev.filter(id => id !== candidate.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-sm text-muted-foreground">{candidate.email}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {candidate.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getMatchScoreColor(candidate.matchScore)}`} />
                        <span className="font-medium">{candidate.matchScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{candidate.owner}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {candidate.existingApplicationsCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {candidate.highestCurrentStage}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {candidate.consent ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {candidate.activelyLooking ? (
                        <Badge className="bg-green-500">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {candidate.lastContactedAt || 'Never'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInterestCheck(candidate.id, 'email')}
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInterestCheck(candidate.id, 'whatsapp')}
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}