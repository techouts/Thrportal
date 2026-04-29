import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Check } from 'lucide-react'
import { toast } from 'sonner'
import { ApplicationsService } from '@/services/applicationsService'

interface CandidateSearchResult {
  id: string
  name: string
  email: string
  pool_tag: string
  skills: string[]
}

interface JDSearchResult {
  id: string
  job_title: string
  client_name: string
  account_name: string
  project_name: string
}

interface CreateApplicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export const CreateApplicationDialog: React.FC<CreateApplicationDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'candidate' | 'jd'>('candidate')
  
  // Candidate search state
  const [candidateFilters, setCandidateFilters] = useState({
    candidateId: '',
    name: '',
    poolTag: '',
    skills: ''
  })
  const [candidateResults, setCandidateResults] = useState<CandidateSearchResult[]>([])
  const [poolTags, setPoolTags] = useState<string[]>([])
  const [candidateSearched, setCandidateSearched] = useState(false)
  const [candidateSearching, setCandidateSearching] = useState(false)
  
  // JD search state
  const [jdFilters, setJdFilters] = useState({
    jdId: '',
    jobTitle: '',
    clientName: '',
    accountName: '',
    projectName: ''
  })
  const [jdResults, setJdResults] = useState<JDSearchResult[]>([])
  const [jdSearched, setJdSearched] = useState(false)
  const [jdSearching, setJdSearching] = useState(false)
  
  // Selection state (single selection)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const [selectedJDId, setSelectedJDId] = useState<string | null>(null)
  
  // Creating state
  const [creating, setCreating] = useState(false)

  // Load pool tags on dialog open
  useEffect(() => {
    if (open) {
      loadPoolTags()
    }
  }, [open])

  const loadPoolTags = async () => {
    try {
      const tags = await ApplicationsService.getDistinctPoolTags()
      setPoolTags(tags)
    } catch (error) {
      console.error('Failed to load pool tags:', error)
    }
  }

  const handleCandidateSearch = async () => {
    const hasFilters = Object.values(candidateFilters).some(v => v.trim())
    if (!hasFilters) {
      toast.error('Please enter at least one search criteria')
      return
    }
    
    try {
      setCandidateSearching(true)
      const results = await ApplicationsService.searchCandidatesForApplication({
        candidateId: candidateFilters.candidateId || undefined,
        name: candidateFilters.name || undefined,
        poolTag: candidateFilters.poolTag || undefined,
        skills: candidateFilters.skills ? candidateFilters.skills.split(',').map(s => s.trim()).filter(Boolean) : undefined
      })
      setCandidateResults(results)
      setCandidateSearched(true)
      if (results.length === 0) {
        toast.info('No candidates found matching the criteria')
      }
    } catch (error) {
      toast.error('Failed to search candidates')
    } finally {
      setCandidateSearching(false)
    }
  }

  const handleJDSearch = async () => {
    const hasFilters = Object.values(jdFilters).some(v => v.trim())
    if (!hasFilters) {
      toast.error('Please enter at least one search criteria')
      return
    }
    
    try {
      setJdSearching(true)
      const results = await ApplicationsService.searchJDsForApplication({
        jdId: jdFilters.jdId || undefined,
        jobTitle: jdFilters.jobTitle || undefined,
        clientName: jdFilters.clientName || undefined,
        accountName: jdFilters.accountName || undefined,
        projectName: jdFilters.projectName || undefined
      })
      setJdResults(results)
      setJdSearched(true)
      if (results.length === 0) {
        toast.info('No job descriptions found matching the criteria')
      }
    } catch (error) {
      toast.error('Failed to search job descriptions')
    } finally {
      setJdSearching(false)
    }
  }

  const handleCreateApplication = async () => {
    if (!selectedCandidateId || !selectedJDId) {
      toast.error('Please select both candidate and JD')
      return
    }

    try {
      setCreating(true)
      
      // Check for duplicates
      const isDuplicate = await ApplicationsService.checkDuplicateApplication(selectedCandidateId, selectedJDId)
      if (isDuplicate) {
        toast.error('Application already exists for this candidate and JD')
        return
      }

      // Create application
      await ApplicationsService.createApplication(selectedCandidateId, selectedJDId)
      
      toast.success('Application created successfully')
      resetDialogState()
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      const message = error?.message || 'Failed to create application'
      toast.error(message)
    } finally {
      setCreating(false)
    }
  }

  const resetDialogState = () => {
    setActiveTab('candidate')
    setCandidateFilters({ candidateId: '', name: '', poolTag: '', skills: '' })
    setJdFilters({ jdId: '', jobTitle: '', clientName: '', accountName: '', projectName: '' })
    setCandidateResults([])
    setJdResults([])
    setSelectedCandidateId(null)
    setSelectedJDId(null)
    setCandidateSearched(false)
    setJdSearched(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetDialogState()
    }
    onOpenChange(newOpen)
  }

  const selectedCandidate = candidateResults.find(c => c.id === selectedCandidateId)
  const selectedJD = jdResults.find(j => j.id === selectedJDId)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Application</DialogTitle>
          <DialogDescription>Search and select a candidate and job description</DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'candidate' | 'jd')} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="candidate" className="flex items-center gap-2">
              1. Candidate Selection
              {selectedCandidateId && <Check className="h-4 w-4 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger value="jd" disabled={!selectedCandidateId} className="flex items-center gap-2">
              2. Job Description
              {selectedJDId && <Check className="h-4 w-4 text-green-600" />}
            </TabsTrigger>
          </TabsList>
          
          {/* Candidate Selection Tab */}
          <TabsContent value="candidate" className="flex-1 overflow-auto space-y-4 mt-4">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Candidate ID</Label>
                <Input 
                  placeholder="Enter ID" 
                  value={candidateFilters.candidateId}
                  onChange={(e) => setCandidateFilters(f => ({ ...f, candidateId: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs">Name</Label>
                <Input 
                  placeholder="Enter name" 
                  value={candidateFilters.name}
                  onChange={(e) => setCandidateFilters(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs">Pool Tag</Label>
                <Select 
                  value={candidateFilters.poolTag} 
                  onValueChange={(v) => setCandidateFilters(f => ({ ...f, poolTag: v === 'all' ? '' : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pool tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {poolTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Skills (comma-separated)</Label>
                <Input 
                  placeholder="React, Node.js" 
                  value={candidateFilters.skills}
                  onChange={(e) => setCandidateFilters(f => ({ ...f, skills: e.target.value }))}
                />
              </div>
            </div>
            
            <Button onClick={handleCandidateSearch} disabled={candidateSearching}>
              <Search className="h-4 w-4 mr-2" />
              {candidateSearching ? 'Searching...' : 'Search'}
            </Button>
            
            {candidateSearched && (
              <div className="border rounded-md overflow-auto max-h-[280px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Pool Tag</TableHead>
                      <TableHead>Skills</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidateResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No candidates found
                        </TableCell>
                      </TableRow>
                    ) : (
                      candidateResults.map(candidate => (
                        <TableRow 
                          key={candidate.id} 
                          className={selectedCandidateId === candidate.id ? 'bg-muted' : ''}
                        >
                          <TableCell>
                            <Checkbox 
                              checked={selectedCandidateId === candidate.id}
                              onCheckedChange={() => setSelectedCandidateId(
                                selectedCandidateId === candidate.id ? null : candidate.id
                              )}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-xs">{candidate.id.slice(0, 8)}...</TableCell>
                          <TableCell className="font-medium">{candidate.name}</TableCell>
                          <TableCell className="text-sm">{candidate.email}</TableCell>
                          <TableCell>{candidate.pool_tag}</TableCell>
                          <TableCell className="text-xs max-w-[150px] truncate">
                            {candidate.skills?.slice(0, 3).join(', ')}
                            {candidate.skills?.length > 3 && '...'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            
            <div className="flex justify-end pt-2">
              <Button 
                onClick={() => setActiveTab('jd')} 
                disabled={!selectedCandidateId}
              >
                Next
              </Button>
            </div>
          </TabsContent>
          
          {/* JD Selection Tab */}
          <TabsContent value="jd" className="flex-1 overflow-auto space-y-4 mt-4">
            {selectedCandidate && (
              <div className="bg-muted p-3 rounded-md text-sm">
                <span className="font-medium">Selected Candidate:</span> {selectedCandidate.name} ({selectedCandidate.email})
              </div>
            )}
            
            <div className="grid grid-cols-5 gap-3">
              <div>
                <Label className="text-xs">JD ID</Label>
                <Input 
                  placeholder="Enter ID" 
                  value={jdFilters.jdId}
                  onChange={(e) => setJdFilters(f => ({ ...f, jdId: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs">Job Title</Label>
                <Input 
                  placeholder="Enter job title" 
                  value={jdFilters.jobTitle}
                  onChange={(e) => setJdFilters(f => ({ ...f, jobTitle: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs">Client Name</Label>
                <Input 
                  placeholder="Enter client" 
                  value={jdFilters.clientName}
                  onChange={(e) => setJdFilters(f => ({ ...f, clientName: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs">Account Name</Label>
                <Input 
                  placeholder="Enter account" 
                  value={jdFilters.accountName}
                  onChange={(e) => setJdFilters(f => ({ ...f, accountName: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs">Project Name</Label>
                <Input 
                  placeholder="Enter project" 
                  value={jdFilters.projectName}
                  onChange={(e) => setJdFilters(f => ({ ...f, projectName: e.target.value }))}
                />
              </div>
            </div>
            
            <Button onClick={handleJDSearch} disabled={jdSearching}>
              <Search className="h-4 w-4 mr-2" />
              {jdSearching ? 'Searching...' : 'Search'}
            </Button>
            
            {jdSearched && (
              <div className="border rounded-md overflow-auto max-h-[250px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Project</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jdResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No job descriptions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      jdResults.map(jd => (
                        <TableRow 
                          key={jd.id} 
                          className={selectedJDId === jd.id ? 'bg-muted' : ''}
                        >
                          <TableCell>
                            <Checkbox 
                              checked={selectedJDId === jd.id}
                              onCheckedChange={() => setSelectedJDId(
                                selectedJDId === jd.id ? null : jd.id
                              )}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-xs">{jd.id.slice(0, 8)}...</TableCell>
                          <TableCell className="font-medium">{jd.job_title}</TableCell>
                          <TableCell>{jd.client_name || '-'}</TableCell>
                          <TableCell>{jd.account_name || '-'}</TableCell>
                          <TableCell>{jd.project_name || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setActiveTab('candidate')}>
                Back
              </Button>
              <Button 
                onClick={handleCreateApplication} 
                disabled={!selectedCandidateId || !selectedJDId || creating}
              >
                {creating ? 'Creating...' : 'Create Application'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
