import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Search, User, ArrowLeft, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { schedulingService } from '@/services/schedulingService'
import { supabase } from '@/integrations/supabase/client'
import type { InterviewSlot } from '@/types/scheduling'

interface AssignCandidateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slot: InterviewSlot
  onAssigned: () => void
}

interface Candidate {
  id: string
  name: string | null
  email: string
  phone: string | null
  pool_tag: string
  skills: string[] | null
  experience: number
  location: string
}

const INTERVIEW_LEVELS = [
  { value: 'screening', label: 'Screening Round' },
  { value: 'technical_1', label: 'Technical Round 1' },
  { value: 'technical_2', label: 'Technical Round 2' },
  { value: 'managerial', label: 'Managerial Round' },
  { value: 'hr', label: 'HR Round' }
]

const POOL_TAG_OPTIONS = [
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Engineer',
  'QA Engineer',
  'UI/UX Designer',
  'Project Manager',
  'Business Analyst'
]

export function AssignCandidateDialog({ open, onOpenChange, slot, onAssigned }: AssignCandidateDialogProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [searchName, setSearchName] = useState('')
  const [searchPoolTag, setSearchPoolTag] = useState('')
  const [searchSkills, setSearchSkills] = useState('')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [interviewLevel, setInterviewLevel] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setStep(1)
      setSearchName('')
      setSearchPoolTag('')
      setSearchSkills('')
      setCandidates([])
      setSelectedCandidate(null)
      setInterviewLevel('')
    }
  }, [open])

  const handleSearch = async () => {
    setIsSearching(true)
    try {
      let query = supabase
        .from('candidates')
        .select('id, name, email, phone, pool_tag, skills, experience, location')
        .limit(50)

      if (searchName.trim()) {
        query = query.ilike('name', `%${searchName.trim()}%`)
      }

      if (searchPoolTag) {
        query = query.eq('pool_tag', searchPoolTag)
      }

      if (searchSkills.trim()) {
        query = query.contains('skills', [searchSkills.trim()])
      }

      const { data, error } = await query

      if (error) throw error
      setCandidates(data || [])
    } catch (error) {
      console.error('Error searching candidates:', error)
      toast.error('Failed to search candidates')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
  }

  const handleNextStep = () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate')
      return
    }
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate')
      return
    }

    if (!interviewLevel) {
      toast.error('Please select interview level')
      return
    }

    setIsSubmitting(true)
    try {
      await schedulingService.assignCandidateToSlot({
        slot_id: slot.id,
        candidate_id: selectedCandidate.id,
        candidate_name: selectedCandidate.name || selectedCandidate.email,
        candidate_email: selectedCandidate.email,
        candidate_phone: selectedCandidate.phone || undefined,
        interview_level: interviewLevel
      })
      toast.success('Candidate assigned successfully')
      onAssigned()
      onOpenChange(false)
    } catch (error) {
      console.error('Error assigning candidate:', error)
      toast.error('Failed to assign candidate')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Assign Candidate - Select Candidate' : 'Assign Candidate - Interview Level'}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            {/* Search Filters */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Candidate Name</Label>
                <Input
                  placeholder="Search by name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Pool Tag</Label>
                <Select value={searchPoolTag} onValueChange={setSearchPoolTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pool tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    {POOL_TAG_OPTIONS.map((tag) => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Skills</Label>
                <Input
                  placeholder="Search by skill..."
                  value={searchSkills}
                  onChange={(e) => setSearchSkills(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleSearch} disabled={isSearching} className="w-full">
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Searching...' : 'Search Candidates'}
            </Button>

            {/* Candidates Table */}
            {candidates.length > 0 ? (
              <div className="border rounded-md max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Pool Tag</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Skills</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((candidate) => (
                      <TableRow 
                        key={candidate.id} 
                        className={`cursor-pointer ${selectedCandidate?.id === candidate.id ? 'bg-muted' : ''}`}
                        onClick={() => handleSelectCandidate(candidate)}
                      >
                        <TableCell>
                          <RadioGroup value={selectedCandidate?.id || ''}>
                            <RadioGroupItem 
                              value={candidate.id} 
                              checked={selectedCandidate?.id === candidate.id}
                            />
                          </RadioGroup>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {candidate.name || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{candidate.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{candidate.pool_tag}</Badge>
                        </TableCell>
                        <TableCell>{candidate.experience} yrs</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {candidate.skills?.slice(0, 3).map((skill, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {(candidate.skills?.length || 0) > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{(candidate.skills?.length || 0) - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {isSearching ? 'Searching...' : 'Search for candidates to assign'}
              </div>
            )}

            {selectedCandidate && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Selected:</strong> {selectedCandidate.name || selectedCandidate.email} 
                  ({selectedCandidate.pool_tag})
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected Candidate Summary */}
            <div className="p-4 bg-muted rounded-md">
              <h4 className="font-medium mb-2">Selected Candidate</h4>
              <p className="text-sm"><strong>Name:</strong> {selectedCandidate?.name || 'N/A'}</p>
              <p className="text-sm"><strong>Email:</strong> {selectedCandidate?.email}</p>
              <p className="text-sm"><strong>Pool Tag:</strong> {selectedCandidate?.pool_tag}</p>
            </div>

            {/* Interview Level Selection */}
            <div className="space-y-2">
              <Label>Interview Level <span className="text-destructive">*</span></Label>
              <Select value={interviewLevel} onValueChange={setInterviewLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select interview level" />
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          {step === 2 && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {step === 1 ? (
              <Button onClick={handleNextStep} disabled={!selectedCandidate}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting || !interviewLevel}>
                {isSubmitting ? 'Assigning...' : 'Assign Candidate'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
