import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { X, Plus, Upload, Calendar as CalendarIcon, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { jobRequisitionsService } from '@/services/jobRequisitionsService'
import { useToast } from '@/hooks/use-toast'
import type { CreateJobRequisitionData } from '@/types/jobRequisitions'

interface CreateJDFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function CreateJDForm({ onSuccess, onCancel }: CreateJDFormProps) {
  const [activeTab, setActiveTab] = useState('manual')
  const [loading, setLoading] = useState(false)
  const [parseLoading, setParseLoding] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<CreateJobRequisitionData>({
    jobTitle: '',
    department: '',
    businessUnit: '',
    workLocation: {
      city: '',
      mode: 'Onsite'
    },
    jobType: 'Full-time',
    isInternal: false,
    clientName: '',
    shortSummary: '',
    responsibilities: [''],
    requiredSkills: {
      mustHave: [],
      goodToHave: []
    },
    experience: { min: 0, max: 0 },
    budget: { min: 0, max: 0, currency: 'INR', type: 'LPA' },
    positions: 1,
    priority: 'Normal',
    expectedDOJ: '',
    resumeDeadline: '',
    interviewRounds: [],
    additionalNotes: '',
    attachments: []
  })

  const [mustHaveSkill, setMustHaveSkill] = useState('')
  const [goodToHaveSkill, setGoodToHaveSkill] = useState('')
  const [responsibility, setResponsibility] = useState('')
  const [interviewRound, setInterviewRound] = useState('')
  const [expectedDOJ, setExpectedDOJ] = useState<Date>()
  const [resumeDeadline, setResumeDeadline] = useState<Date>()

  const addSkill = (type: 'mustHave' | 'goodToHave', skill: string) => {
    if (!skill.trim()) return
    
    setFormData(prev => ({
      ...prev,
      requiredSkills: {
        ...prev.requiredSkills,
        [type]: [...prev.requiredSkills[type], skill.trim()]
      }
    }))
    
    if (type === 'mustHave') setMustHaveSkill('')
    else setGoodToHaveSkill('')
  }

  const removeSkill = (type: 'mustHave' | 'goodToHave', index: number) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: {
        ...prev.requiredSkills,
        [type]: prev.requiredSkills[type].filter((_, i) => i !== index)
      }
    }))
  }

  const addResponsibility = () => {
    if (!responsibility.trim()) return
    
    setFormData(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities.filter(r => r), responsibility.trim()]
    }))
    setResponsibility('')
  }

  const removeResponsibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }))
  }

  const addInterviewRound = () => {
    if (!interviewRound.trim()) return
    
    setFormData(prev => ({
      ...prev,
      interviewRounds: [...prev.interviewRounds, interviewRound.trim()]
    }))
    setInterviewRound('')
  }

  const removeInterviewRound = (index: number) => {
    setFormData(prev => ({
      ...prev,
      interviewRounds: prev.interviewRounds.filter((_, i) => i !== index)
    }))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setParseLoding(true)
      const result = await jobRequisitionsService.parseJDFile(file)
      
      // Auto-fill form with parsed data
      setFormData(prev => ({
        ...prev,
        ...result.autoFilledFields
      }))

      toast({
        title: "JD Parsed Successfully",
        description: `${result.confidence}% of fields auto-filled`,
      })

      // Show suggestions if any
      if (result.suggestions.length > 0) {
        toast({
          title: "Suggestions",
          description: result.suggestions.join(', '),
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse JD file",
        variant: "destructive"
      })
    } finally {
      setParseLoding(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      const submitData = {
        ...formData,
        expectedDOJ: expectedDOJ?.toISOString() || '',
        resumeDeadline: resumeDeadline?.toISOString() || ''
      }

      await jobRequisitionsService.createJobRequisition(submitData)
      
      toast({
        title: "Success",
        description: "Job requisition created successfully"
      })
      
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create job requisition",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        <TabsTrigger value="smart">
          <Sparkles className="h-4 w-4 mr-2" />
          Smart Upload
        </TabsTrigger>
      </TabsList>

      <TabsContent value="smart" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Upload JD Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Upload your JD file</p>
                <p className="text-sm text-muted-foreground">Supports .docx and .pdf files</p>
                <Input
                  type="file"
                  accept=".docx,.pdf"
                  onChange={handleFileUpload}
                  disabled={parseLoading}
                  className="max-w-xs mx-auto"
                />
                {parseLoading && (
                  <p className="text-sm text-muted-foreground">Parsing document...</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="manual">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Basics */}
          <Card>
            <CardHeader>
              <CardTitle>Job Basics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="businessUnit">Business Unit *</Label>
                  <Select value={formData.businessUnit} onValueChange={(value) => setFormData(prev => ({ ...prev, businessUnit: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Digital">Digital</SelectItem>
                      <SelectItem value="Analytics">Analytics</SelectItem>
                      <SelectItem value="Cloud">Cloud</SelectItem>
                      <SelectItem value="AI/ML">AI/ML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="city">Work Location - City *</Label>
                  <Input
                    id="city"
                    value={formData.workLocation.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      workLocation: { ...prev.workLocation, city: e.target.value }
                    }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Work Mode *</Label>
                <RadioGroup
                  value={formData.workLocation.mode}
                  onValueChange={(value: any) => setFormData(prev => ({
                    ...prev,
                    workLocation: { ...prev.workLocation, mode: value }
                  }))}
                  className="flex flex-row gap-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Onsite" id="onsite" />
                    <Label htmlFor="onsite">Onsite</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Remote" id="remote" />
                    <Label htmlFor="remote">Remote</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Hybrid" id="hybrid" />
                    <Label htmlFor="hybrid">Hybrid</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Job Type *</Label>
                  <Select value={formData.jobType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, jobType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="C2H">C2H</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isInternal}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isInternal: checked }))}
                  />
                  <Label>Internal Position</Label>
                </div>
              </div>

              {!formData.isInternal && (
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="shortSummary">Short Summary *</Label>
                <Textarea
                  id="shortSummary"
                  value={formData.shortSummary}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortSummary: e.target.value }))}
                  required
                />
              </div>

              {/* Responsibilities */}
              <div>
                <Label>Responsibilities *</Label>
                <div className="space-y-2">
                  {formData.responsibilities.filter(r => r).map((resp, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1 p-2 bg-muted rounded text-sm">{resp}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeResponsibility(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add responsibility..."
                      value={responsibility}
                      onChange={(e) => setResponsibility(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                    />
                    <Button type="button" onClick={addResponsibility}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Must-Have Skills *</Label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {formData.requiredSkills.mustHave.map((skill, index) => (
                        <Badge key={index} variant="default" className="gap-1">
                          {skill}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeSkill('mustHave', index)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add must-have skill..."
                        value={mustHaveSkill}
                        onChange={(e) => setMustHaveSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('mustHave', mustHaveSkill))}
                      />
                      <Button type="button" onClick={() => addSkill('mustHave', mustHaveSkill)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Good-to-Have Skills</Label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {formData.requiredSkills.goodToHave.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {skill}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeSkill('goodToHave', index)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add good-to-have skill..."
                        value={goodToHaveSkill}
                        onChange={(e) => setGoodToHaveSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('goodToHave', goodToHaveSkill))}
                      />
                      <Button type="button" onClick={() => addSkill('goodToHave', goodToHaveSkill)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience & Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Experience (Years) *</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={formData.experience.min || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        experience: { ...prev.experience, min: parseInt(e.target.value) || 0 }
                      }))}
                    />
                    <span>to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={formData.experience.max || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        experience: { ...prev.experience, max: parseInt(e.target.value) || 0 }
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Budget (INR) *</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={formData.budget.min || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          budget: { ...prev.budget, min: parseInt(e.target.value) || 0 }
                        }))}
                      />
                      <span>to</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={formData.budget.max || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          budget: { ...prev.budget, max: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <Select
                      value={formData.budget.type}
                      onValueChange={(value: any) => setFormData(prev => ({
                        ...prev,
                        budget: { ...prev.budget, type: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LPA">LPA</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Other Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="positions">Number of Positions *</Label>
                  <Input
                    id="positions"
                    type="number"
                    min="1"
                    value={formData.positions}
                    onChange={(e) => setFormData(prev => ({ ...prev, positions: parseInt(e.target.value) || 1 }))}
                    required
                  />
                </div>

                <div>
                  <Label>Priority *</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Expected DOJ *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !expectedDOJ && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expectedDOJ ? format(expectedDOJ, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={expectedDOJ}
                        onSelect={setExpectedDOJ}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label>Resume Submission Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !resumeDeadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {resumeDeadline ? format(resumeDeadline, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={resumeDeadline}
                      onSelect={setResumeDeadline}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Interview Rounds */}
              <div>
                <Label>Interview Rounds</Label>
                <div className="space-y-2">
                  {formData.interviewRounds.map((round, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1 p-2 bg-muted rounded text-sm">{round}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInterviewRound(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add interview round..."
                      value={interviewRound}
                      onChange={(e) => setInterviewRound(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterviewRound())}
                    />
                    <Button type="button" onClick={addInterviewRound}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Job Requisition'}
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  )
}
