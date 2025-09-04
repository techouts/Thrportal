import { useState, useEffect } from 'react'
import { Upload, CheckCircle, AlertTriangle, FileText, Download, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BgvService } from '@/services/bgvService'
import { BgvCase, BgvFilters } from '@/types/bgv'
import { useToast } from '@/hooks/use-toast'

export function OutcomesTab() {
  const [cases, setCases] = useState<BgvCase[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState<BgvCase | null>(null)
  const [outcome, setOutcome] = useState<string>('')
  const [notes, setNotes] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadCases()
  }, [])

  const loadCases = async () => {
    try {
      setLoading(true)
      // Filter for cases needing outcome closure
      const filters: BgvFilters = { status: 'IN_PROGRESS' }
      const data = await BgvService.getBgvCases(filters)
      setCases(data.filter(c => c.status === 'IN_PROGRESS' || c.status === 'REVIEW'))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load BGV cases",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getOutcomeColor = (outcome: string) => {
    const colors = {
      'GREEN': 'bg-green-100 text-green-700 border-green-200',
      'AMBER': 'bg-amber-100 text-amber-700 border-amber-200',
      'RED': 'bg-red-100 text-red-700 border-red-200',
      'INCONCLUSIVE': 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[outcome as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const handleUploadReport = (caseId: string) => {
    toast({
      title: "Report Uploaded",
      description: "Final BGV report uploaded successfully"
    })
    loadCases()
  }

  const handleMarkOutcome = async () => {
    if (!selectedCase || !outcome) return

    try {
      await BgvService.updateBgvCase(selectedCase.id, {
        overallOutcome: outcome as any,
        status: 'COMPLETED'
      })

      if (outcome === 'GREEN') {
        // Emit BGV.Cleared event for integration
        toast({
          title: "BGV Cleared",
          description: "Candidate cleared for Offer/Onboarding process"
        })
      }

      toast({
        title: "Outcome Recorded",
        description: `BGV outcome marked as ${outcome}`
      })
      
      setSelectedCase(null)
      setOutcome('')
      setNotes('')
      loadCases()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update outcome",
        variant: "destructive"
      })
    }
  }

  const handlePushToOffer = (bgvCase: BgvCase) => {
    if (bgvCase.overallOutcome !== 'GREEN') {
      toast({
        title: "Cannot Proceed",
        description: "Only Green outcomes can proceed to Offer/Onboarding",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Integration Triggered",
      description: "Candidate pushed to Offer/Onboarding workflow"
    })
  }

  const getCompletionPercentage = (bgvCase: BgvCase) => {
    // Mock completion calculation based on package
    const packageChecks = {
      'IND_BASIC': 4,
      'IND_STANDARD': 7,
      'IND_EXTENDED': 8
    }
    const totalChecks = packageChecks[bgvCase.packageCode as keyof typeof packageChecks] || 4
    const completedChecks = Math.floor(Math.random() * totalChecks) + 1 // Mock completed
    return Math.round((completedChecks / totalChecks) * 100)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">BGV Outcomes</h2>
        <div className="text-sm text-muted-foreground">
          {cases.length} cases needing closure
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{cases.length}</div>
            <p className="text-sm text-muted-foreground">Pending Closure</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {cases.filter(c => c.overallOutcome === 'GREEN').length}
            </div>
            <p className="text-sm text-muted-foreground">Green Outcomes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              {cases.filter(c => c.overallOutcome === 'AMBER').length}
            </div>
            <p className="text-sm text-muted-foreground">Amber Outcomes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {cases.filter(c => c.overallOutcome === 'RED').length}
            </div>
            <p className="text-sm text-muted-foreground">Red Outcomes</p>
          </CardContent>
        </Card>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map(bgvCase => {
          const completion = getCompletionPercentage(bgvCase)
          const hasOutcome = !!bgvCase.overallOutcome
          
          return (
            <Card key={bgvCase.id} className={hasOutcome ? getOutcomeColor(bgvCase.overallOutcome!) : 'border-2 border-dashed'}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{bgvCase.candidateName}</CardTitle>
                  {hasOutcome && (
                    <Badge className={getOutcomeColor(bgvCase.overallOutcome!)}>
                      {bgvCase.overallOutcome}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {bgvCase.jdId} • {bgvCase.client}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Completion</span>
                    <span>{completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completion}%` }}
                    ></div>
                  </div>
                </div>

                {/* Package & Vendor Info */}
                <div className="text-sm space-y-1">
                  <div><strong>Package:</strong> {bgvCase.packageCode}</div>
                  <div><strong>Vendor:</strong> {bgvCase.vendorIds.join(', ')}</div>
                  <div><strong>Created:</strong> {new Date(bgvCase.createdAt).toLocaleDateString()}</div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleUploadReport(bgvCase.id)}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Final Report
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedCase(bgvCase)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Outcome
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Set BGV Outcome - {bgvCase.candidateName}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg bg-muted/50">
                          <div className="text-sm space-y-1">
                            <div><strong>JD:</strong> {bgvCase.jdId}</div>
                            <div><strong>Client:</strong> {bgvCase.client}</div>
                            <div><strong>Package:</strong> {bgvCase.packageCode}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Overall Outcome</label>
                          <Select value={outcome} onValueChange={setOutcome}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select outcome" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GREEN">Green - Clear</SelectItem>
                              <SelectItem value="AMBER">Amber - Discrepancy</SelectItem>
                              <SelectItem value="RED">Red - Adverse</SelectItem>
                              <SelectItem value="INCONCLUSIVE">Inconclusive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Notes</label>
                          <Textarea
                            placeholder="Add outcome notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                          />
                        </div>

                        {outcome === 'GREEN' && (
                          <div className="p-3 bg-green-50 rounded-lg text-green-700 text-sm">
                            <CheckCircle className="inline h-4 w-4 mr-2" />
                            Green outcome will auto-enable Offer/Onboarding for this candidate
                          </div>
                        )}

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setSelectedCase(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleMarkOutcome} disabled={!outcome}>
                            Set Outcome
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {hasOutcome && bgvCase.overallOutcome === 'GREEN' && (
                    <Button 
                      variant="default"
                      size="sm" 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handlePushToOffer(bgvCase)}
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Push to Offer/Onboarding
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {cases.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">No Cases Pending Closure</h3>
            <p className="text-sm text-muted-foreground">
              All BGV cases have been processed or are still in progress
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}