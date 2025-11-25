import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Download, 
  Calendar as CalendarIcon, 
  Save, 
  Play, 
  Copy, 
  Trash2,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Filter,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/auth/AuthContext';
import { useVisible } from '@/hooks/useVisible';

export interface ReportField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  source: string; // table or data source
  aggregation?: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct';
  format?: string;
  requiresPermission?: string[];
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any;
  label?: string;
}

export interface ReportConfig {
  id: string;
  name: string;
  description?: string;
  category: string;
  fields: string[];
  filters: ReportFilter[];
  groupBy?: string[];
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  chartType?: 'table' | 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: 'pdf' | 'csv' | 'xlsx';
  };
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  tags: string[];
}

interface ReportBuilderProps {
  reportConfig?: ReportConfig;
  onSave?: (config: ReportConfig) => void;
  onCancel?: () => void;
  className?: string;
}

export function ReportBuilder({ 
  reportConfig, 
  onSave, 
  onCancel, 
  className = "" 
}: ReportBuilderProps) {
  const { can } = useAuth();
  const [config, setConfig] = useState<Partial<ReportConfig>>(reportConfig || {
    name: '',
    description: '',
    category: 'projects',
    fields: [],
    filters: [],
    groupBy: [],
    orderBy: [],
    chartType: 'table',
    schedule: {
      enabled: false,
      frequency: 'weekly',
      recipients: [],
      format: 'pdf'
    },
    isPublic: false,
    tags: []
  });

  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Permission checks
  const canScheduleReports = useVisible(['reports.schedule', 'reports.*', 'admin.*']);
  const canCreatePublicReports = useVisible(['reports.public.create', 'reports.*', 'admin.*']);
  const canExportReports = useVisible(['reports.export', 'reports.*']);

  // Available fields based on category and permissions
  const availableFields: Record<string, ReportField[]> = {
    projects: [
      { id: 'project_name', label: 'Project Name', type: 'text', source: 'projects' },
      { id: 'client_name', label: 'Client Name', type: 'text', source: 'projects' },
      { id: 'status', label: 'Status', type: 'select', source: 'projects' },
      { id: 'priority', label: 'Priority', type: 'select', source: 'projects' },
      { id: 'start_date', label: 'Start Date', type: 'date', source: 'projects' },
      { id: 'end_date', label: 'End Date', type: 'date', source: 'projects' },
      { id: 'ft_target', label: 'FT Target', type: 'number', source: 'projects', aggregation: 'sum' },
      { id: 'contract_target', label: 'Contract Target', type: 'number', source: 'projects', aggregation: 'sum' },
      { 
        id: 'budget', 
        label: 'Budget', 
        type: 'number', 
        source: 'projects', 
        aggregation: 'sum',
        requiresPermission: ['projects.financials', 'finance.reports.read']
      },
      { 
        id: 'revenue', 
        label: 'Revenue', 
        type: 'number', 
        source: 'projects', 
        aggregation: 'sum',
        requiresPermission: ['projects.financials', 'finance.reports.read']
      }
    ],
    crm: [
      { id: 'client_name', label: 'Client Name', type: 'text', source: 'crm_clients' },
      { id: 'industry', label: 'Industry', type: 'text', source: 'crm_clients' },
      { id: 'health_score', label: 'Health Score', type: 'number', source: 'crm_clients' },
      { id: 'interaction_count', label: 'Interactions', type: 'number', source: 'crm_interactions', aggregation: 'count' },
      { id: 'last_interaction', label: 'Last Interaction', type: 'date', source: 'crm_interactions' },
      { id: 'opportunity_count', label: 'Opportunities', type: 'number', source: 'crm_opportunities', aggregation: 'count' }
    ],
    hiring: [
      { id: 'jd_title', label: 'Job Title', type: 'text', source: 'jds' },
      { id: 'candidate_count', label: 'Candidates', type: 'number', source: 'applications', aggregation: 'count' },
      { id: 'hire_count', label: 'Hires', type: 'number', source: 'applications', aggregation: 'count' },
      { id: 'closure_rate', label: 'Closure Rate', type: 'number', source: 'calculated' },
      { 
        id: 'cost_per_hire', 
        label: 'Cost per Hire', 
        type: 'number', 
        source: 'calculated',
        requiresPermission: ['hiring.financials', 'finance.reports.read']
      }
    ],
    finance: [
      { 
        id: 'total_revenue', 
        label: 'Total Revenue', 
        type: 'number', 
        source: 'financials', 
        aggregation: 'sum',
        requiresPermission: ['finance.reports.read', 'finance.*']
      },
      { 
        id: 'total_cost', 
        label: 'Total Cost', 
        type: 'number', 
        source: 'financials', 
        aggregation: 'sum',
        requiresPermission: ['finance.reports.read', 'finance.*']
      },
      { 
        id: 'profit_margin', 
        label: 'Profit Margin', 
        type: 'number', 
        source: 'calculated',
        requiresPermission: ['finance.reports.read', 'finance.*']
      }
    ]
  };

  const currentFields = availableFields[config.category || 'projects']?.filter(field => {
    if (!field.requiresPermission) return true;
    return field.requiresPermission.some(permission => can(permission));
  }) || [];

  const handleFieldToggle = (fieldId: string) => {
    const currentFields = config.fields || [];
    const newFields = currentFields.includes(fieldId)
      ? currentFields.filter(f => f !== fieldId)
      : [...currentFields, fieldId];
    
    setConfig(prev => ({ ...prev, fields: newFields }));
  };

  const handleFilterAdd = () => {
    const newFilter: ReportFilter = {
      field: currentFields[0]?.id || '',
      operator: 'equals',
      value: ''
    };
    setConfig(prev => ({
      ...prev,
      filters: [...(prev.filters || []), newFilter]
    }));
  };

  const handleFilterUpdate = (index: number, filter: ReportFilter) => {
    const newFilters = [...(config.filters || [])];
    newFilters[index] = filter;
    setConfig(prev => ({ ...prev, filters: newFilters }));
  };

  const handleFilterRemove = (index: number) => {
    const newFilters = (config.filters || []).filter((_, i) => i !== index);
    setConfig(prev => ({ ...prev, filters: newFilters }));
  };

  const generatePreview = async () => {
    setIsGenerating(true);
    // Simulate API call for report preview
    setTimeout(() => {
      const mockData = generateMockData();
      setPreviewData(mockData);
      setIsGenerating(false);
    }, 1000);
  };

  const generateMockData = () => {
    // Generate mock data based on selected fields
    const data = [];
    for (let i = 0; i < 10; i++) {
      const row: any = {};
      (config.fields || []).forEach(fieldId => {
        const field = currentFields.find(f => f.id === fieldId);
        if (field) {
          switch (field.type) {
            case 'text':
              row[fieldId] = `Sample ${field.label} ${i + 1}`;
              break;
            case 'number':
              row[fieldId] = Math.floor(Math.random() * 100) + 1;
              break;
            case 'date':
              row[fieldId] = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
              break;
            case 'boolean':
              row[fieldId] = Math.random() > 0.5;
              break;
            default:
              row[fieldId] = `Value ${i + 1}`;
          }
        }
      });
      data.push(row);
    }
    return data;
  };

  const handleSave = () => {
    const reportConfig: ReportConfig = {
      ...config,
      id: config.id || `report_${Date.now()}`,
      createdAt: config.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: config.tags || []
    } as ReportConfig;

    onSave?.(reportConfig);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Report Builder</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fields" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="fields">Fields & Data</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="fields" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label>Report Name</Label>
                    <Input
                      value={config.name || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter report name"
                    />
                  </div>
                  
                  <div>
                    <Label>Category</Label>
                    <Select 
                      value={config.category || 'projects'} 
                      onValueChange={(value) => setConfig(prev => ({ ...prev, category: value, fields: [] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="projects">Projects</SelectItem>
                        <SelectItem value="crm">CRM</SelectItem>
                        <SelectItem value="hiring">Hiring</SelectItem>
                        {can('finance.reports.read') && (
                          <SelectItem value="finance">Finance</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={config.description || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this report shows"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Available Fields</Label>
                  <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                    {currentFields.map(field => (
                      <div key={field.id} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          checked={(config.fields || []).includes(field.id)}
                          onCheckedChange={() => handleFieldToggle(field.id)}
                        />
                        <Label className="text-sm flex-1">{field.label}</Label>
                        {field.aggregation && (
                          <Badge variant="outline" className="text-xs">
                            {field.aggregation}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Report Filters</Label>
                <Button variant="outline" size="sm" onClick={handleFilterAdd}>
                  <Filter className="h-4 w-4 mr-2" />
                  Add Filter
                </Button>
              </div>

              {(config.filters || []).map((filter, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Field</Label>
                        <Select
                          value={filter.field}
                          onValueChange={(value) => handleFilterUpdate(index, { ...filter, field: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currentFields.map(field => (
                              <SelectItem key={field.id} value={field.id}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Operator</Label>
                        <Select
                          value={filter.operator}
                          onValueChange={(value: any) => handleFilterUpdate(index, { ...filter, operator: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="not_equals">Not Equals</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="greater_than">Greater Than</SelectItem>
                            <SelectItem value="less_than">Less Than</SelectItem>
                            <SelectItem value="between">Between</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Value</Label>
                        <Input
                          value={filter.value}
                          onChange={(e) => handleFilterUpdate(index, { ...filter, value: e.target.value })}
                          placeholder="Filter value"
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFilterRemove(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="visualization" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Chart Type</Label>
                    <Select
                      value={config.chartType || 'table'}
                      onValueChange={(value: any) => setConfig(prev => ({ ...prev, chartType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="table">Table</SelectItem>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <Button onClick={generatePreview} disabled={isGenerating}>
                      <Play className="h-4 w-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'Generate Preview'}
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <Label className="text-sm text-muted-foreground">Report Preview</Label>
                  {previewData.length > 0 ? (
                    <div className="mt-2 max-h-64 overflow-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            {(config.fields || []).map(fieldId => {
                              const field = currentFields.find(f => f.id === fieldId);
                              return (
                                <th key={fieldId} className="text-left p-2">
                                  {field?.label}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.slice(0, 5).map((row, index) => (
                            <tr key={index} className="border-b">
                              {(config.fields || []).map(fieldId => (
                                <td key={fieldId} className="p-2">
                                  {row[fieldId]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-muted-foreground text-center py-8">
                      Generate preview to see report data
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.isPublic || false}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isPublic: checked }))}
                      disabled={!canCreatePublicReports}
                    />
                    <Label>Make report public</Label>
                  </div>

                  {canScheduleReports && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={config.schedule?.enabled || false}
                          onCheckedChange={(checked) => 
                            setConfig(prev => ({ 
                              ...prev, 
                              schedule: { ...prev.schedule, enabled: checked } 
                            }))
                          }
                        />
                        <Label>Schedule automatic delivery</Label>
                      </div>

                      {config.schedule?.enabled && (
                        <>
                          <div>
                            <Label>Frequency</Label>
                            <Select
                              value={config.schedule?.frequency || 'weekly'}
                              onValueChange={(value: any) => 
                                setConfig(prev => ({ 
                                  ...prev, 
                                  schedule: { ...prev.schedule, frequency: value } 
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Export Format</Label>
                            <Select
                              value={config.schedule?.format || 'pdf'}
                              onValueChange={(value: any) => 
                                setConfig(prev => ({ 
                                  ...prev, 
                                  schedule: { ...prev.schedule, format: value } 
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="csv">CSV</SelectItem>
                                <SelectItem value="xlsx">Excel</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      value={(config.tags || []).join(', ')}
                      onChange={(e) => 
                        setConfig(prev => ({ 
                          ...prev, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                        }))
                      }
                      placeholder="e.g., monthly, projects, management"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-6 border-t">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!config.name || !config.fields?.length}>
              <Save className="h-4 w-4 mr-2" />
              Save Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}