import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertTriangle, MapPin, DollarSign, Building, Users, Clock, Mail, MessageSquare, Star, Send } from 'lucide-react'
import { MappingService } from '@/services/mappingService'
import { MappingJD, MatchScore, ConflictFlag } from '@/types/applications'
import { toast } from 'sonner'

interface MappingJDTabProps {
  candidateId: string
}

export const MappingJDTab: React.FC<MappingJDTabProps> = ({ candidateId }) => {
  const [jds, setJds] = useState<MappingJD[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJDs, setSelectedJDs] = useState<string[]>([])
  const [filters, setFilters] = useState({
    skills: '',
    location: '',
    seniority: '',
    compensationBand: '',
    client: '',
    workType: '',
    minMatchScore: 65
  })

  useEffect(() => {
    loadJDs()
  }, [candidateId, filters])

  const loadJDs = async () => {
    try {
      setLoading(true)
      const data = await MappingService.getJDsForCandidate(candidateId, {
        skills: filters.skills ? filters.skills.split(',').map(s => s.trim()) : undefined,
        location: filters.location && filters.location !== 'all' ? filters.location : undefined,
        seniority: filters.seniority && filters.seniority !== 'all' ? filters.seniority : undefined,
        compensationRange: filters.compensationBand && filters.compensationBand !== 'all' ? { min: 5, max: 50, currency: 'LPA' } : undefined,
        client: filters.client && filters.client !== 'all' ? filters.client : undefined,
        workType: filters.workType && filters.workType !== 'all' ? filters.workType : undefined,
        matchScoreRange: { min: filters.minMatchScore, max: 100 }
      })
      setJds(data)
    } catch (error) {
      toast.error('Failed to load JDs')
      console.error('Error loading JDs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInterestCheck = async (jdId: string, channel: 'email' | 'whatsapp') => {
    try {
      await MappingService.sendInterestCheck([candidateId], jdId, 'default-template', channel)
      toast.success(`Interest check sent via ${channel}`)
    } catch (error) {
      toast.error('Failed to send interest check')
    }
  }

  const handleMarkActivelyLooking = async () => {
    try {
      // This would typically call an API to mark the candidate as actively looking
      toast.success('Candidate marked as actively looking (60-day expiry)')
    } catch (error) {
      toast.error('Failed to update candidate status')
    }
  }

  const handleSubmitForApproval = async () => {
    if (selectedJDs.length === 0) {
      toast.error('Please select at least one JD')
      return
    }

    try {
      const mappingRequests = selectedJDs.map(jdId => ({
        candidateId,
        jdId,
        requestedBy: 'current-user', // This would come from auth context
        comments: `Mapping request for ${selectedJDs.length} JD(s)`
      }))
      
      await MappingService.submitForApproval(mappingRequests)
      toast.success(`${selectedJDs.length} JD(s) submitted for approval`)
      setSelectedJDs([])
    } catch (error) {
      toast.error('Failed to submit for approval')
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-500'
    if (score >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getSLABadgeColor = (slaHealth: string) => {
    switch (slaHealth) {
      case 'On-time': return 'bg-green-500'
      case 'Amber': return 'bg-yellow-500'
      case 'Red': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Find Best JDs for This Candidate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button onClick={handleMarkActivelyLooking} variant="outline">
              <Star className="h-4 w-4 mr-2" />
              Mark Actively Looking
            </Button>
            <Button 
              onClick={handleSubmitForApproval} 
              disabled={selectedJDs.length === 0}
              className="ml-auto"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit for Approval ({selectedJDs.length})
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <label className="text-sm font-medium mb-2 block">Seniority</label>
              <Select value={filters.seniority} onValueChange={(value) => setFilters(prev => ({ ...prev, seniority: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any level</SelectItem>
                  <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                  <SelectItem value="mid">Mid (3-5 years)</SelectItem>
                  <SelectItem value="senior">Senior (6+ years)</SelectItem>
                  <SelectItem value="lead">Lead/Principal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Work Type</label>
              <Select value={filters.workType} onValueChange={(value) => setFilters(prev => ({ ...prev, workType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any type</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Matching JDs ({jds.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading JDs...</div>
          ) : jds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No matching JDs found. Try adjusting your filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedJDs.length === jds.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedJDs(jds.map(jd => jd.id))
                        } else {
                          setSelectedJDs([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>JD</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Headcount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jds.map((jd) => (
                  <TableRow key={jd.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedJDs.includes(jd.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedJDs(prev => [...prev, jd.id])
                          } else {
                            setSelectedJDs(prev => prev.filter(id => id !== jd.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{jd.title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {jd.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {jd.client}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getMatchScoreColor(jd.matchScore)}`} />
                        <span className="font-medium">{jd.matchScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {jd.headcountLeft}/{jd.headcountLeft + 5}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={jd.status === 'Published' ? 'default' : 'secondary'}>
                        {jd.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSLABadgeColor(jd.slaHealth)}>
                        {jd.slaHealth}
                      </Badge>
                    </TableCell>
                    <TableCell>{jd.primaryRecruiter}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInterestCheck(jd.id, 'email')}
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInterestCheck(jd.id, 'whatsapp')}
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