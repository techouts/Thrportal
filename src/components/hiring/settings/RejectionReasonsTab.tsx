import { useState } from 'react'
import { Plus, Edit, Save, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface RejectionCategory {
  id: string
  name: string
  type: 'CANDIDATE_DRIVEN' | 'CLIENT_DRIVEN'
  parentId?: string
  reasons: RejectionReason[]
  isExpanded?: boolean
}

interface RejectionReason {
  id: string
  name: string
  description?: string
  isActive: boolean
  usageCount: number
}

export function RejectionReasonsTab() {
  const [categories, setCategories] = useState<RejectionCategory[]>([
    {
      id: 'cat-001',
      name: 'Candidate-Driven Rejections',
      type: 'CANDIDATE_DRIVEN',
      isExpanded: true,
      reasons: [
        { id: 'reason-001', name: 'Salary Expectation Mismatch', description: 'Candidate expectations exceed budget', isActive: true, usageCount: 45 },
        { id: 'reason-002', name: 'Location Preference', description: 'Candidate prefers different location', isActive: true, usageCount: 32 },
        { id: 'reason-003', name: 'Notice Period', description: 'Extended notice period not acceptable', isActive: true, usageCount: 28 },
        { id: 'reason-004', name: 'Counter Offer Accepted', description: 'Current employer provided counter offer', isActive: true, usageCount: 23 }
      ]
    },
    {
      id: 'cat-002',
      name: 'Client-Driven Rejections',
      type: 'CLIENT_DRIVEN',
      isExpanded: true,
      reasons: [
        { id: 'reason-101', name: 'Technical Skills Gap', description: 'Lacks required technical competencies', isActive: true, usageCount: 67 },
        { id: 'reason-102', name: 'Experience Level', description: 'Insufficient experience for the role', isActive: true, usageCount: 54 },
        { id: 'reason-103', name: 'Communication Skills', description: 'Poor verbal/written communication', isActive: true, usageCount: 41 },
        { id: 'reason-104', name: 'Cultural Fit', description: 'Not aligned with company culture', isActive: true, usageCount: 38 },
        { id: 'reason-105', name: 'Background Verification', description: 'Issues found during BGV process', isActive: true, usageCount: 15 }
      ]
    },
    {
      id: 'cat-003',
      name: 'Process-Related Rejections',
      type: 'CLIENT_DRIVEN',
      isExpanded: false,
      reasons: [
        { id: 'reason-201', name: 'No Show for Interview', description: 'Candidate did not attend scheduled interview', isActive: true, usageCount: 29 },
        { id: 'reason-202', name: 'Position Closed', description: 'Client decided to close the position', isActive: true, usageCount: 12 },
        { id: 'reason-203', name: 'Internal Candidate Selected', description: 'Client chose internal candidate', isActive: true, usageCount: 8 }
      ]
    }
  ])

  const [showNewCategory, setShowNewCategory] = useState(false)
  const [showNewReason, setShowNewReason] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'CANDIDATE_DRIVEN' as any,
    parentId: ''
  })
  const [newReason, setNewReason] = useState({
    name: '',
    description: '',
    categoryId: ''
  })

  const { toast } = useToast()

  const handleCreateCategory = () => {
    const category: RejectionCategory = {
      id: `cat-${Date.now()}`,
      name: newCategory.name,
      type: newCategory.type,
      parentId: newCategory.parentId || undefined,
      reasons: [],
      isExpanded: true
    }
    
    setCategories([...categories, category])
    setNewCategory({ name: '', type: 'CANDIDATE_DRIVEN', parentId: '' })
    setShowNewCategory(false)
    
    toast({
      title: "Category Created",
      description: "Rejection category has been created successfully"
    })
  }

  const handleCreateReason = () => {
    if (!newReason.categoryId) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive"
      })
      return
    }

    const reason: RejectionReason = {
      id: `reason-${Date.now()}`,
      name: newReason.name,
      description: newReason.description,
      isActive: true,
      usageCount: 0
    }

    setCategories(prev => prev.map(cat => 
      cat.id === newReason.categoryId 
        ? { ...cat, reasons: [...cat.reasons, reason] }
        : cat
    ))

    setNewReason({ name: '', description: '', categoryId: '' })
    setShowNewReason(false)
    
    toast({
      title: "Rejection Reason Created",
      description: "New rejection reason has been added successfully"
    })
  }

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, isExpanded: !cat.isExpanded }
        : cat
    ))
  }

  const toggleReasonStatus = (categoryId: string, reasonId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? {
            ...cat,
            reasons: cat.reasons.map(reason => 
              reason.id === reasonId 
                ? { ...reason, isActive: !reason.isActive }
                : reason
            )
          }
        : cat
    ))
  }

  const getTotalReasons = () => categories.reduce((total, cat) => total + cat.reasons.length, 0)
  const getActiveReasons = () => categories.reduce((total, cat) => 
    total + cat.reasons.filter(r => r.isActive).length, 0
  )
  const getTotalUsage = () => categories.reduce((total, cat) => 
    total + cat.reasons.reduce((catTotal, reason) => catTotal + reason.usageCount, 0), 0
  )

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-sm text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{getTotalReasons()}</div>
            <p className="text-sm text-muted-foreground">Total Reasons</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{getActiveReasons()}</div>
            <p className="text-sm text-muted-foreground">Active Reasons</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{getTotalUsage()}</div>
            <p className="text-sm text-muted-foreground">Total Usage</p>
          </CardContent>
        </Card>
      </div>

      {/* Rejection Categories */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rejection Reasons Hierarchy</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNewReason(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Reason
              </Button>
              <Button onClick={() => setShowNewCategory(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Category
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map(category => (
              <div key={category.id} className="border rounded-lg">
                <Collapsible 
                  open={category.isExpanded} 
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        {category.isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {category.reasons.length} reasons • {category.reasons.filter(r => r.isActive).length} active
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline"
                          className={category.type === 'CANDIDATE_DRIVEN' ? 'border-blue-200 text-blue-700' : 'border-orange-200 text-orange-700'}
                        >
                          {category.type?.replace('_', ' ') || 'Unknown Type'}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-2">
                      {category.reasons.map(reason => (
                        <div 
                          key={reason.id} 
                          className="flex items-center justify-between p-3 ml-6 border rounded bg-muted/20"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{reason.name}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {reason.usageCount} uses
                              </Badge>
                            </div>
                            {reason.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {reason.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={reason.isActive}
                              onCheckedChange={() => toggleReasonStatus(category.id, reason.id)}
                            />
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {category.reasons.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No rejection reasons in this category
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-medium">Most Used Rejection Reasons (Last 30 Days)</h3>
            <div className="space-y-2">
              {categories
                .flatMap(cat => cat.reasons)
                .sort((a, b) => b.usageCount - a.usageCount)
                .slice(0, 5)
                .map(reason => (
                  <div key={reason.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{reason.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(reason.usageCount / Math.max(...categories.flatMap(c => c.reasons).map(r => r.usageCount)) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8">{reason.usageCount}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Category Modal */}
      <Dialog open={showNewCategory} onOpenChange={setShowNewCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Rejection Category</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Technical Rejections"
              />
            </div>

            <div className="space-y-2">
              <Label>Category Type</Label>
              <Select 
                value={newCategory.type}
                onValueChange={(value) => setNewCategory(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CANDIDATE_DRIVEN">Candidate-Driven</SelectItem>
                  <SelectItem value="CLIENT_DRIVEN">Client-Driven</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Parent Category (Optional)</Label>
              <Select 
                value={newCategory.parentId}
                onValueChange={(value) => setNewCategory(prev => ({ ...prev, parentId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (Top-level category)" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewCategory(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCategory}>
                Create Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Reason Modal */}
      <Dialog open={showNewReason} onOpenChange={setShowNewReason}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Rejection Reason</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason Name</Label>
              <Input
                value={newReason.name}
                onChange={(e) => setNewReason(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Insufficient JavaScript Experience"
              />
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input
                value={newReason.description}
                onChange={(e) => setNewReason(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about this rejection reason"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={newReason.categoryId}
                onValueChange={(value) => setNewReason(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewReason(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReason}>
                Create Reason
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}