import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Download, Eye, Calendar, Filter, FileText, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { DataTable } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { TimesheetService } from '@/services/timesheetService'
import type { 
  ClientExportProfile, 
  ExportFilters, 
  ExportPreview, 
  ExportRun 
} from '@/types/timesheet'

interface ClientExportsProps {
  employeeId: string
}

export function ClientExports({ employeeId }: ClientExportsProps) {
  const [profiles, setProfiles] = useState<ClientExportProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string>('')
  const [periodStart, setPeriodStart] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [periodEnd, setPeriodEnd] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [filters, setFilters] = useState<ExportFilters>({
    billableOnly: false,
    excludeCategories: []
  })
  const [preview, setPreview] = useState<ExportPreview | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [exportLogs, setExportLogs] = useState<ExportRun[]>([])
  const [loading, setLoading] = useState(false)

  const timesheetService = TimesheetService.getInstance()

  useEffect(() => {
    loadProfiles()
    loadExportLogs()
  }, [employeeId])

  const loadProfiles = async () => {
    try {
      const data = await timesheetService.getActiveExportProfiles()
      setProfiles(data)
      if (data.length > 0) {
        setSelectedProfile(data[0].id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load export profiles",
        variant: "destructive"
      })
    }
  }

  const loadExportLogs = async () => {
    try {
      const data = await timesheetService.getExportLogs(employeeId, 10)
      setExportLogs(data)
    } catch (error) {
      console.error('Failed to load export logs:', error)
    }
  }

  const handlePreview = async () => {
    if (!selectedProfile) {
      toast({
        title: "Error",
        description: "Please select an export profile",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      const data = await timesheetService.previewExport(
        selectedProfile, 
        periodStart, 
        periodEnd, 
        filters
      )
      setPreview(data)
      setShowPreview(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate preview",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!selectedProfile) return

    try {
      setLoading(true)
      const result = await timesheetService.runExport(
        selectedProfile, 
        periodStart, 
        periodEnd, 
        filters
      )
      
      toast({
        title: "Export Complete",
        description: `${result.rows} rows exported to ${result.fileRef}`
      })
      
      loadExportLogs() // Refresh logs
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedProfileData = profiles.find(p => p.id === selectedProfile)

  const logColumns = [
    {
      id: 'at',
      header: 'Date',
      accessor: (log: ExportRun) => format(new Date(log.at), 'MMM d, yyyy HH:mm')
    },
    {
      id: 'profileName',
      header: 'Profile',
      accessor: (log: ExportRun) => log.profileName
    },
    {
      id: 'rows',
      header: 'Rows',
      accessor: (log: ExportRun) => log.rows.toString()
    },
    {
      id: 'fileRef',
      header: 'File',
      accessor: (log: ExportRun) => (
        <Button variant="link" size="sm" className="h-auto p-0">
          {log.fileRef}
        </Button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Client Profile</Label>
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger>
                  <SelectValue placeholder="Select profile" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProfileData && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedProfileData.format}
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Period Start</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Period End</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Filters</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={filters.billableOnly || false}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, billableOnly: checked }))
                    }
                  />
                  <span className="text-sm">Billable only</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handlePreview} 
              disabled={loading || !selectedProfile}
              data-testid="export-preview"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button 
              onClick={handleDownload} 
              disabled={loading || !selectedProfile}
              data-testid="export-download"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Exports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={exportLogs}
            columns={logColumns}
            emptyMessage="No exports found"
          />
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Export Preview</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-4">
              {preview.warnings && preview.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-amber-600">Warnings</h4>
                  {preview.warnings.map((warning, index) => (
                    <div key={index} className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                      {warning}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        {preview.headers.map((header, index) => (
                          <th key={index} className="text-left p-3 font-medium">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.slice(0, 10).map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="p-3 text-sm">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {preview.rows.length > 10 && (
                <div className="text-sm text-muted-foreground text-center">
                  Showing first 10 rows of {preview.rows.length} total rows
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}