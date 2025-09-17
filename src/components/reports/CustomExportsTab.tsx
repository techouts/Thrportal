import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileSpreadsheet, BarChart3, Save, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function CustomExportsTab() {
  const { toast } = useToast();
  const [reportName, setReportName] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    client: '',
    account: '',
    project: '',
    employee: '',
    skill: '',
    dateFrom: null as Date | null,
    dateTo: null as Date | null
  });
  const [selectedMetrics, setSelectedMetrics] = useState({
    financials: false,
    utilization: false,
    benchShadow: false,
    resourceBurn: false,
    delivery: false
  });
  const [includeShadow, setIncludeShadow] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  const savedReports = [
    { id: '1', name: 'Monthly Utilization Report', filters: 'All Clients, This Month', metrics: 'Utilization, Resource Burn', lastRun: '2024-07-15', format: 'Excel' },
    { id: '2', name: 'Project Financials Q2', filters: 'Tech Corp, Q2 2024', metrics: 'Financials, Delivery', lastRun: '2024-07-10', format: 'CSV' },
    { id: '3', name: 'Bench Analysis Weekly', filters: 'All Employees, This Week', metrics: 'Bench & Shadow', lastRun: '2024-07-16', format: 'Excel' }
  ];

  const metricsOptions = [
    { key: 'financials', label: 'Financials', description: 'Revenue, costs, margins, profitability' },
    { key: 'utilization', label: 'Utilization', description: 'Core/effective utilization, role distribution' },
    { key: 'benchShadow', label: 'Bench & Shadow', description: 'Bench costs, shadow allocations, conversions' },
    { key: 'resourceBurn', label: 'Resource Burn', description: 'Hours tracking, timesheet compliance' },
    { key: 'delivery', label: 'Delivery', description: 'Task completion, slippage, Gantt variance' }
  ];

  const handleMetricChange = (metric: string, checked: boolean) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metric]: checked
    }));
  };

  const handleFilterChange = (filter: string, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };

  const handleGenerateReport = () => {
    const selectedMetricsList = Object.entries(selectedMetrics)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => key);

    if (selectedMetricsList.length === 0) {
      toast({
        title: "No Metrics Selected",
        description: "Please select at least one metric category.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Report Generated",
      description: `Generating ${exportFormat.toUpperCase()} report with ${selectedMetricsList.length} metric categories.`,
    });
  };

  const handleSaveReport = () => {
    if (!reportName.trim()) {
      toast({
        title: "Report Name Required",
        description: "Please enter a name for this report configuration.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Report Saved",
      description: `Report configuration "${reportName}" has been saved.`,
    });
    setReportName('');
  };

  const handleDeleteReport = (reportId: string) => {
    toast({
      title: "Report Deleted",
      description: "Saved report configuration has been removed.",
    });
  };

  const getSelectedFiltersCount = () => {
    return Object.values(selectedFilters).filter(value => value !== '' && value !== null).length;
  };

  const getSelectedMetricsCount = () => {
    return Object.values(selectedMetrics).filter(selected => selected).length;
  };

  return (
    <div className="space-y-6">
      {/* Report Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Build Custom Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Name */}
          <div>
            <Label htmlFor="report-name">Report Name (for saving)</Label>
            <Input
              id="report-name"
              placeholder="Enter report name..."
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Filters Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Filters</h3>
              <Badge variant="outline">{getSelectedFiltersCount()} applied</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Select value={selectedFilters.client} onValueChange={(value) => handleFilterChange('client', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Clients</SelectItem>
                  <SelectItem value="tech-corp">Tech Corp</SelectItem>
                  <SelectItem value="startup-inc">Startup Inc</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedFilters.account} onValueChange={(value) => handleFilterChange('account', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Accounts</SelectItem>
                  <SelectItem value="acc-1">Account 1</SelectItem>
                  <SelectItem value="acc-2">Account 2</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedFilters.project} onValueChange={(value) => handleFilterChange('project', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Projects</SelectItem>
                  <SelectItem value="ecommerce">E-commerce Platform</SelectItem>
                  <SelectItem value="mobile">Mobile App</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedFilters.employee} onValueChange={(value) => handleFilterChange('employee', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Employees</SelectItem>
                  <SelectItem value="sarah-c">Sarah Chen</SelectItem>
                  <SelectItem value="mike-j">Mike Johnson</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedFilters.skill} onValueChange={(value) => handleFilterChange('skill', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Skills</SelectItem>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="nodejs">Node.js</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {selectedFilters.dateFrom ? format(selectedFilters.dateFrom, "MMM dd") : "From Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedFilters.dateFrom}
                      onSelect={(date) => handleFilterChange('dateFrom', date)}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {selectedFilters.dateTo ? format(selectedFilters.dateTo, "MMM dd") : "To Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedFilters.dateTo}
                      onSelect={(date) => handleFilterChange('dateTo', date)}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Metrics Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Choose Metrics</h3>
              <Badge variant="outline">{getSelectedMetricsCount()} selected</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {metricsOptions.map((metric) => (
                <div key={metric.key} className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Checkbox
                    id={metric.key}
                    checked={selectedMetrics[metric.key as keyof typeof selectedMetrics]}
                    onCheckedChange={(checked) => handleMetricChange(metric.key, checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={metric.key} className="font-medium cursor-pointer">
                      {metric.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {metric.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h3 className="text-lg font-medium mb-4">Export Options</h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-shadow"
                  checked={includeShadow}
                  onCheckedChange={setIncludeShadow}
                />
                <Label htmlFor="include-shadow">Include Shadow allocations</Label>
              </div>

              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleGenerateReport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Generate & Export
            </Button>
            <Button variant="outline" onClick={handleSaveReport} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Configuration
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>

          {/* Export Header Note */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Export Header:</strong> Shadow Included: {includeShadow ? 'Yes' : 'No'} | 
              Generated: {format(new Date(), 'PPP')} | 
              Format: {exportFormat.toUpperCase()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Saved Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Report Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {savedReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{report.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Filters: {report.filters}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Metrics: {report.metrics}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-medium">Format</div>
                  <Badge variant="outline">{report.format}</Badge>
                </div>

                <div className="text-center">
                  <div className="text-sm font-medium">Last Run</div>
                  <div className="text-sm">{report.lastRun}</div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    Run
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <FileSpreadsheet className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDeleteReport(report.id)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}