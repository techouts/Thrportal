import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Zap, AlertTriangle, Building, Users, MapPin, Mail, MessageSquare, Send, Eye, Star } from 'lucide-react'
import { MappingService } from '@/services/mappingService'
import { MappingResult, ConflictFlag } from '@/types/applications'
import { toast } from 'sonner'

export const MappingSmartMapperTab: React.FC = () => {
  const [mappingResults, setMappingResults] = useState<MappingResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPairs, setSelectedPairs] = useState<string[]>([])
  const [filters, setFilters] = useState({
    onlyActivelyLooking: true,
    onlyAtRiskJDs: false,
    minMatchScore: 70,
    client: '',
    conflictType: ''
  })

  useEffect(() => {
    loadSmartMatches()
  }, [filters])

  const loadSmartMatches = async () => {
    try {
      setLoading(true)
      const data = await MappingService.getSmartMatches({
        activelyLooking: filters.onlyActivelyLooking,
        // atRiskJDs: filters.onlyAtRiskJDs, // Not in MappingFilters type
        matchScoreRange: { min: filters.minMatchScore, max: 100 },
        client: filters.client || undefined
      })
      setMappingResults(data)
    } catch (error) {
      toast.error('Failed to load smart matches')
      console.error('Error loading smart matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkInterestCheck = async (channel: 'email' | 'whatsapp') => {
    if (selectedPairs.length === 0) {
      toast.error('Please select at least one candidate-JD pair')
      return
    }

    try {
      const candidateIds = selectedPairs.map(pairId => {
        const result = mappingResults.find(r => `${r.candidateId}-${r.jdId}` === pairId)
        return result?.candidateId || ''
      }).filter(Boolean)

      const jdIds = selectedPairs.map(pairId => {
        const result = mappingResults.find(r => `${r.candidateId}-${r.jdId}` === pairId)
        return result?.jdId || ''
      }).filter(Boolean)

      await MappingService.bulkInterestCheck(candidateIds, jdIds, 'default-template', channel)
      toast.success(`Bulk interest check sent via ${channel} to ${selectedPairs.length} pair(s)`)
    } catch (error) {
      toast.error('Failed to send bulk interest check')
    }
  }

  const handleBulkSubmitForApproval = async () => {
    if (selectedPairs.length === 0) {
      toast.error('Please select at least one candidate-JD pair')
      return
    }

    try {
      const candidateJDPairs = selectedPairs.map(pairId => {
        const result = mappingResults.find(r => `${r.candidateId}-${r.jdId}` === pairId)
        return {
          candidateId: result?.candidateId || '',
          jdId: result?.jdId || ''
        }
      }).filter(pair => pair.candidateId && pair.jdId)

      await MappingService.bulkSubmitForApproval(candidateJDPairs)
      toast.success(`${selectedPairs.length} pair(s) submitted for approval`)
      setSelectedPairs([])
    } catch (error) {
      toast.error('Failed to submit for approval')
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-500'
    if (score >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getConflictIcon = (conflict: ConflictFlag) => {
    switch (conflict.type) {
      case 'deep-stage':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'compensation':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'consent':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return null
    }
  }

  const getNextBestAction = (result: MappingResult) => {
    if (result.conflicts.some(c => c.type === 'deep-stage')) {
      return 'Manager Approval Required'
    }
    if (result.matchScore.total < 70) {
      return 'Check Interest First'
    }
    if (result.matchScore.total >= 80) {
      return 'Submit for Approval'
    }
    return 'Interest Check'
  }

  const pairId = (candidateId: string, jdId: string) => `${candidateId}-${jdId}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Smart Mapper - Two-Way Matching
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={() => handleBulkInterestCheck('email')}
              disabled={selectedPairs.length === 0}
              variant="outline"
            >
              <Mail className="h-4 w-4 mr-2" />
              Bulk Email ({selectedPairs.length})
            </Button>
            <Button 
              onClick={() => handleBulkInterestCheck('whatsapp')}
              disabled={selectedPairs.length === 0}
              variant="outline"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Bulk WhatsApp ({selectedPairs.length})
            </Button>
            <Button 
              onClick={handleBulkSubmitForApproval}
              disabled={selectedPairs.length === 0}
              className="ml-auto"
            >
              <Send className="h-4 w-4 mr-2" />
              Bulk Submit for Approval ({selectedPairs.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Min Match Score</label>
              <Select 
                value={filters.minMatchScore.toString()} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, minMatchScore: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="60">60%</SelectItem>
                  <SelectItem value="70">70%</SelectItem>
                  <SelectItem value="80">80%</SelectItem>
                  <SelectItem value="90">90%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Client</label>
              <Select value={filters.client} onValueChange={(value) => setFilters(prev => ({ ...prev, client: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All clients</SelectItem>
                  <SelectItem value="TechCorp">TechCorp</SelectItem>
                  <SelectItem value="InnovateCo">InnovateCo</SelectItem>
                  <SelectItem value="DataSystems">DataSystems</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Conflict Type</label>
              <Select value={filters.conflictType} onValueChange={(value) => setFilters(prev => ({ ...prev, conflictType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All conflicts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All conflicts</SelectItem>
                  <SelectItem value="deep-stage">Deep Stage</SelectItem>
                  <SelectItem value="band-mismatch">Band Mismatch</SelectItem>
                  <SelectItem value="consent-pending">Consent Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="actively-looking"
                checked={filters.onlyActivelyLooking}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, onlyActivelyLooking: !!checked }))}
              />
              <label htmlFor="actively-looking" className="text-sm font-medium">
                Actively Looking Only
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="at-risk-jds"
                checked={filters.onlyAtRiskJDs}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, onlyAtRiskJDs: !!checked }))}
              />
              <label htmlFor="at-risk-jds" className="text-sm font-medium">
                At-Risk JDs Only
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Matches ({mappingResults.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Analyzing smart matches...</div>
          ) : mappingResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No smart matches found. Try adjusting your filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedPairs.length === mappingResults.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPairs(mappingResults.map(result => pairId(result.candidateId, result.jdId)))
                        } else {
                          setSelectedPairs([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>JD</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Conflict Flags</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Next Best Action</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappingResults.map((result) => {
                  const currentPairId = pairId(result.candidateId, result.jdId)
                  return (
                    <TableRow key={currentPairId}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPairs.includes(currentPairId)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPairs(prev => [...prev, currentPairId])
                            } else {
                              setSelectedPairs(prev => prev.filter(id => id !== currentPairId))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">JD {result.jdId}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Location TBD
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Client TBD
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">Candidate {result.candidateId}</div>
                          <div className="text-sm text-muted-foreground">ID: {result.candidateId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getMatchScoreColor(result.matchScore.total)}`} />
                          <span className="font-medium">{result.matchScore.total}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {result.conflicts.map((conflict, index) => (
                            <div key={index}>
                              {getConflictIcon(conflict)}
                            </div>
                          ))}
                          {result.conflicts.length === 0 && (
                            <span className="text-green-500 text-sm">✓ Clear</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>Owner TBD</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getNextBestAction(result)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // This would open the candidate profile
                              toast.info('Opening candidate profile...')
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}