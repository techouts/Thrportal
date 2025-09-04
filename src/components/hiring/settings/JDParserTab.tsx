import { useState } from 'react'
import { Plus, Edit, Save, Upload, Download, FileText, Settings, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DataTable } from '@/components/shared/DataTable'
import { useToast } from '@/hooks/use-toast'

interface JDTemplate {
  id: string
  name: string
  type: 'IT' | 'NON_IT' | 'ROLE_SPECIFIC'
  roleCategory: string
  fields: string[]
  createdAt: string
  isActive: boolean
}

interface ParsingRule {
  id: string
  field: string
  keywords: string[]
  weight: number
  isRequired: boolean
}

export function JDParserTab() {
  const [templates, setTemplates] = useState<JDTemplate[]>([
    {
      id: 'tpl-001',
      name: 'Software Engineer Template',
      type: 'IT',
      roleCategory: 'Engineering',
      fields: ['skills', 'experience', 'education', 'certifications'],
      createdAt: '2024-01-15',
      isActive: true
    },
    {
      id: 'tpl-002', 
      name: 'Marketing Manager Template',
      type: 'NON_IT',
      roleCategory: 'Marketing',
      fields: ['experience', 'education', 'portfolio'],
      createdAt: '2024-01-10',
      isActive: true
    }
  ])
  
  const [parsingRules, setParsingRules] = useState<ParsingRule[]>([
    { id: 'rule-001', field: 'Programming Skills', keywords: ['java', 'python', 'javascript', 'react'], weight: 0.8, isRequired: true },
    { id: 'rule-002', field: 'Experience Level', keywords: ['senior', 'lead', 'junior', 'years'], weight: 0.7, isRequired: true },
    { id: 'rule-003', field: 'Education', keywords: ['btech', 'mtech', 'mca', 'bca', 'computer science'], weight: 0.6, isRequired: false }
  ])

  const [aiThresholds, setAiThresholds] = useState({
    qualified: 60,
    highMatch: 80,
    perfectMatch: 95
  })

  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'IT' as any,
    roleCategory: '',
    fields: [] as string[]
  })

  const { toast } = useToast()

  const handleSaveThresholds = () => {
    toast({
      title: "AI Thresholds Updated",
      description: "Matching thresholds have been saved successfully"
    })
  }

  const handleCreateTemplate = () => {
    const template: JDTemplate = {
      id: `tpl-${Date.now()}`,
      name: newTemplate.name,
      type: newTemplate.type,
      roleCategory: newTemplate.roleCategory,
      fields: newTemplate.fields,
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true
    }
    
    setTemplates([...templates, template])
    setNewTemplate({ name: '', type: 'IT', roleCategory: '', fields: [] })
    setShowNewTemplate(false)
    
    toast({
      title: "Template Created",
      description: "JD template has been created successfully"
    })
  }

  const templateColumns = [
    {
      id: 'name',
      header: 'Template Name',
      accessor: 'name' as keyof JDTemplate
    },
    {
      id: 'type',
      header: 'Type',
      accessor: 'type' as keyof JDTemplate,
      cell: (item: JDTemplate) => (
        <Badge variant="outline">{item.type?.replace('_', ' ') || 'Unknown'}</Badge>
      )
    },
    {
      id: 'roleCategory',
      header: 'Role Category',
      accessor: 'roleCategory' as keyof JDTemplate
    },
    {
      id: 'fields',
      header: 'Parsed Fields',
      accessor: 'fields' as keyof JDTemplate,
      cell: (item: JDTemplate) => (
        <div className="flex flex-wrap gap-1">
          {item.fields?.map(field => (
            <Badge key={field} variant="secondary" className="text-xs">
              {field}
            </Badge>
          )) || <span className="text-muted-foreground text-sm">No fields</span>}
        </div>
      )
    },
    {
      id: 'isActive',
      header: 'Status',
      accessor: 'isActive' as keyof JDTemplate,
      cell: (item: JDTemplate) => (
        <Badge className={item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof JDTemplate,
      cell: (item: JDTemplate) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const ruleColumns = [
    {
      id: 'field',
      header: 'Field',
      accessor: 'field' as keyof ParsingRule
    },
    {
      id: 'keywords',
      header: 'Keywords',
      accessor: 'keywords' as keyof ParsingRule,
      cell: (item: ParsingRule) => (
        <div className="text-sm">
          {item.keywords?.slice(0, 3)?.join(', ') || 'No keywords'}
          {item.keywords && item.keywords.length > 3 && ` +${item.keywords.length - 3} more`}
        </div>
      )
    },
    {
      id: 'weight',
      header: 'Weight',
      accessor: 'weight' as keyof ParsingRule,
      cell: (item: ParsingRule) => (
        <div className="text-sm">{(item.weight * 100).toFixed(0)}%</div>
      )
    },
    {
      id: 'isRequired',
      header: 'Required',
      accessor: 'isRequired' as keyof ParsingRule,
      cell: (item: ParsingRule) => (
        <Badge className={item.isRequired ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>
          {item.isRequired ? 'Required' : 'Optional'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof ParsingRule,
      cell: (item: ParsingRule) => (
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* JD Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>JD Templates</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => setShowNewTemplate(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={templates}
            columns={templateColumns}
            loading={false}
            searchable={false}
          />
        </CardContent>
      </Card>

      {/* Parser Mappings */}
      <Card>
        <CardHeader>
          <CardTitle>Parser Mappings & Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={parsingRules}
            columns={ruleColumns}
            loading={false}
            searchable={false}
          />
        </CardContent>
      </Card>

      {/* AI Matching Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle>AI Matching Thresholds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label>Qualified Match (%)</Label>
              <div className="space-y-2">
                <Slider
                  value={[aiThresholds.qualified]}
                  onValueChange={(value) => setAiThresholds(prev => ({ ...prev, qualified: value[0] }))}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground">
                  {aiThresholds.qualified}% - Minimum match for qualification
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>High Match (%)</Label>
              <div className="space-y-2">
                <Slider
                  value={[aiThresholds.highMatch]}
                  onValueChange={(value) => setAiThresholds(prev => ({ ...prev, highMatch: value[0] }))}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground">
                  {aiThresholds.highMatch}% - High priority candidates
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Perfect Match (%)</Label>
              <div className="space-y-2">
                <Slider
                  value={[aiThresholds.perfectMatch]}
                  onValueChange={(value) => setAiThresholds(prev => ({ ...prev, perfectMatch: value[0] }))}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground">
                  {aiThresholds.perfectMatch}% - Perfect match candidates
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleSaveThresholds}>
            <Save className="mr-2 h-4 w-4" />
            Save Thresholds
          </Button>
        </CardContent>
      </Card>

      {/* Stopwords & Synonyms */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stopwords Dictionary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter stopwords (comma-separated)..."
              defaultValue="the, and, or, but, in, on, at, to, for, of, with, by, from, up, about, into, through, during"
              rows={4}
            />
            <Button size="sm">
              <Save className="mr-2 h-4 w-4" />
              Update Stopwords
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Synonyms Dictionary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter synonyms (word1=synonym1,synonym2|word2=synonym3,synonym4)..."
              defaultValue="javascript=js,node|python=py|react=reactjs"
              rows={4}
            />
            <Button size="sm">
              <Save className="mr-2 h-4 w-4" />
              Update Synonyms
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* New Template Modal */}
      <Dialog open={showNewTemplate} onOpenChange={setShowNewTemplate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create JD Template</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Senior Frontend Developer"
              />
            </div>

            <div className="space-y-2">
              <Label>Template Type</Label>
              <Select 
                value={newTemplate.type}
                onValueChange={(value) => setNewTemplate(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="NON_IT">Non-IT</SelectItem>
                  <SelectItem value="ROLE_SPECIFIC">Role Specific</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role Category</Label>
              <Input
                value={newTemplate.roleCategory}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, roleCategory: e.target.value }))}
                placeholder="e.g., Engineering, Marketing, Sales"
              />
            </div>

            <div className="space-y-2">
              <Label>Parsed Fields</Label>
              <div className="grid grid-cols-2 gap-2">
                {['skills', 'experience', 'education', 'certifications', 'portfolio', 'achievements'].map(field => (
                  <div key={field} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={field}
                      checked={newTemplate.fields.includes(field)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewTemplate(prev => ({ ...prev, fields: [...prev.fields, field] }))
                        } else {
                          setNewTemplate(prev => ({ ...prev, fields: prev.fields.filter(f => f !== field) }))
                        }
                      }}
                    />
                    <Label htmlFor={field} className="text-sm capitalize">{field}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewTemplate(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}