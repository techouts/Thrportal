import { useState, useEffect } from 'react'
import { Plus, Save, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { DataTable } from '@/components/shared/DataTable'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BgvService } from '@/services/bgvService'
import { BgvSettings, BgvPackage } from '@/types/bgv'
import { useToast } from '@/hooks/use-toast'

export function SettingsTab() {
  const [settings, setSettings] = useState<BgvSettings[]>([])
  const [packages, setPackages] = useState<BgvPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewSetting, setShowNewSetting] = useState(false)
  const [newSetting, setNewSetting] = useState({
    client: '',
    project: '',
    allowedVendors: [] as string[],
    selectionMode: 'SINGLE_ONLY' as any,
    defaultPackage: '',
    slaProfileId: ''
  })
  const [retentionSettings, setRetentionSettings] = useState({
    autoPurgeEnabled: true,
    autoPurgeDays: 90,
    digitalConsentRequired: true
  })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [settingsData, packagesData] = await Promise.all([
        BgvService.getSettings(),
        BgvService.getPackages()
      ])
      setSettings(settingsData)
      setPackages(packagesData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSetting = async () => {
    if (!newSetting.client || !newSetting.project || newSetting.allowedVendors.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      await BgvService.updateSettings(newSetting)
      toast({
        title: "Settings Saved",
        description: "Client/Project BGV settings updated successfully"
      })
      
      setNewSetting({
        client: '',
        project: '',
        allowedVendors: [],
        selectionMode: 'SINGLE_ONLY',
        defaultPackage: '',
        slaProfileId: ''
      })
      setShowNewSetting(false)
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      })
    }
  }

  const handleSaveRetentionSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Retention and consent settings updated successfully"
    })
  }

  const settingsColumns = [
    {
      id: 'client',
      header: 'Client',
      accessor: 'client' as keyof BgvSettings
    },
    {
      id: 'project',
      header: 'Project',
      accessor: 'project' as keyof BgvSettings
    },
    {
      id: 'allowedVendors',
      header: 'Allowed Vendors',
      accessor: 'allowedVendors' as keyof BgvSettings,
      cell: (item: BgvSettings) => (
        <div className="flex flex-wrap gap-1">
          {item.allowedVendors.map(vendor => (
            <Badge key={vendor} variant="secondary" className="text-xs">
              {vendor}
            </Badge>
          ))}
        </div>
      )
    },
    {
      id: 'selectionMode',
      header: 'Selection Mode',
      accessor: 'selectionMode' as keyof BgvSettings,
      cell: (item: BgvSettings) => (
        <Badge variant="outline" className="text-xs">
          {item.selectionMode.replace('_', ' ')}
        </Badge>
      )
    },
    {
      id: 'defaultPackage',
      header: 'Default Package',
      accessor: 'defaultPackage' as keyof BgvSettings,
      cell: (item: BgvSettings) => (
        <div className="text-sm">{item.defaultPackage || 'Not set'}</div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof BgvSettings,
      cell: (item: BgvSettings) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">BGV Settings</h2>
      </div>

      {/* Client/Project Vendor Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Client/Project ↔ Vendor Preferences</CardTitle>
            <Button onClick={() => setShowNewSetting(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Setting
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={settings}
            columns={settingsColumns}
            loading={loading}
            searchable={false}
          />
        </CardContent>
      </Card>

      {/* India BGV Packages */}
      <Card>
        <CardHeader>
          <CardTitle>India BGV Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {packages.map(pkg => (
              <div key={pkg.code} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{pkg.name}</h3>
                  <Badge variant="outline">{pkg.code}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong className="text-sm">Included Checks:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pkg.checks.map(check => (
                        <Badge key={check} variant="secondary" className="text-xs">
                          {check.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong className="text-sm">Default SLA (Business Days):</strong>
                    <div className="text-sm mt-1 space-y-1">
                      <div>ID/KYC: {pkg.defaultSla.idKycDays}d • Address: {pkg.defaultSla.addressDays}d</div>
                      <div>Education: {pkg.defaultSla.educationDays}d • Employment: {pkg.defaultSla.employmentDays}d</div>
                      {pkg.defaultSla.criminalDays > 0 && <div>Criminal: {pkg.defaultSla.criminalDays}d • Court: {pkg.defaultSla.courtDays}d</div>}
                      {pkg.defaultSla.uanEpfoDays > 0 && <div>UAN/EPFO: {pkg.defaultSla.uanEpfoDays}d</div>}
                      {pkg.defaultSla.referencesDays > 0 && <div>References: {pkg.defaultSla.referencesDays}d</div>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Consent & Retention Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Consent & Retention Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Digital Consent Required</h3>
                <p className="text-sm text-muted-foreground">
                  Require candidates to provide digital consent before BGV initiation
                </p>
              </div>
              <Switch 
                checked={retentionSettings.digitalConsentRequired}
                onCheckedChange={(checked) => setRetentionSettings(prev => ({ ...prev, digitalConsentRequired: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-Purge Data</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically purge PII and documents after specified period
                </p>
              </div>
              <Switch 
                checked={retentionSettings.autoPurgeEnabled}
                onCheckedChange={(checked) => setRetentionSettings(prev => ({ ...prev, autoPurgeEnabled: checked }))}
              />
            </div>

            {retentionSettings.autoPurgeEnabled && (
              <div className="pl-4 border-l-2 border-gray-200">
                <label className="text-sm font-medium">Auto-purge after (days)</label>
                <Input
                  type="number"
                  value={retentionSettings.autoPurgeDays}
                  onChange={(e) => setRetentionSettings(prev => ({ ...prev, autoPurgeDays: parseInt(e.target.value) }))}
                  className="w-32 mt-1"
                  min="30"
                  max="365"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Default: 90 days from outcome OR last update (whichever is later)
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <Button onClick={handleSaveRetentionSettings}>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* New Setting Modal */}
      <Dialog open={showNewSetting} onOpenChange={setShowNewSetting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Client/Project Setting</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <Select 
                  value={newSetting.client}
                  onValueChange={(value) => setNewSetting(prev => ({ ...prev, client: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TechCorp">TechCorp</SelectItem>
                    <SelectItem value="FinanceMax">FinanceMax</SelectItem>
                    <SelectItem value="RetailPlus">RetailPlus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Input
                  value={newSetting.project}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, project: e.target.value }))}
                  placeholder="Project name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Allowed Vendors</label>
              <div className="grid grid-cols-3 gap-2">
                {['vendor-001', 'vendor-002', 'vendor-003', 'vendor-004', 'vendor-005'].map(vendorId => (
                  <div key={vendorId} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={vendorId}
                      checked={newSetting.allowedVendors.includes(vendorId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewSetting(prev => ({ ...prev, allowedVendors: [...prev.allowedVendors, vendorId] }))
                        } else {
                          setNewSetting(prev => ({ ...prev, allowedVendors: prev.allowedVendors.filter(id => id !== vendorId) }))
                        }
                      }}
                    />
                    <label htmlFor={vendorId} className="text-sm">Vendor {vendorId.split('-')[1]}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Selection Mode</label>
              <Select 
                value={newSetting.selectionMode}
                onValueChange={(value) => setNewSetting(prev => ({ ...prev, selectionMode: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE_ONLY">Single Vendor Only</SelectItem>
                  <SelectItem value="MULTIPLE_ALLOWED">Multiple Vendors Allowed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Default Package</label>
              <Select 
                value={newSetting.defaultPackage}
                onValueChange={(value) => setNewSetting(prev => ({ ...prev, defaultPackage: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IND_BASIC">India Basic</SelectItem>
                  <SelectItem value="IND_STANDARD">India Standard</SelectItem>
                  <SelectItem value="IND_EXTENDED">India Extended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewSetting(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSetting}>
                Save Setting
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}