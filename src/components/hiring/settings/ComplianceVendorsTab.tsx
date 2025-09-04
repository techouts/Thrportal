import { useState } from 'react'
import { Plus, Edit, Save, Shield, Upload, Download, FileText, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { DataTable } from '@/components/shared/DataTable'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface BGVVendor {
  id: string
  name: string
  type: 'PREFERRED' | 'APPROVED' | 'BLACKLISTED'
  services: string[]
  location: string
  isActive: boolean
  contactEmail: string
  contactPhone: string
  rating: number
}

interface ConsentTemplate {
  id: string
  name: string
  type: 'BASIC' | 'DETAILED' | 'CUSTOM'
  language: string
  content: string
  isDefault: boolean
  lastUpdated: string
}

interface ComplianceSettings {
  gdprEnabled: boolean
  dpdpEnabled: boolean
  dataRetentionMonths: number
  autoPurgeEnabled: boolean
  consentRequired: boolean
  rightToErasure: boolean
}

export function ComplianceVendorsTab() {
  const [vendors, setVendors] = useState<BGVVendor[]>([
    {
      id: 'vendor-001',
      name: 'SecureVerify India',
      type: 'PREFERRED',
      services: ['Education', 'Employment', 'Criminal', 'Address'],
      location: 'Pan India',
      isActive: true,
      contactEmail: 'info@secureverify.in',
      contactPhone: '+91-80-12345678',
      rating: 4.5
    },
    {
      id: 'vendor-002',
      name: 'TrustCheck Solutions',
      type: 'APPROVED',
      services: ['Education', 'Employment', 'Court Records'],
      location: 'South India',
      isActive: true,
      contactEmail: 'support@trustcheck.com',
      contactPhone: '+91-44-87654321',
      rating: 4.2
    }
  ])

  const [consentTemplates, setConsentTemplates] = useState<ConsentTemplate[]>([
    {
      id: 'consent-001',
      name: 'Standard BGV Consent',
      type: 'BASIC',
      language: 'English',
      content: 'I hereby consent to background verification checks being conducted for employment purposes...',
      isDefault: true,
      lastUpdated: '2024-01-15'
    },
    {
      id: 'consent-002',
      name: 'Detailed GDPR Consent',
      type: 'DETAILED',
      language: 'English',
      content: 'I provide explicit consent for the processing of my personal data for background verification purposes...',
      isDefault: false,
      lastUpdated: '2024-01-10'
    }
  ])

  const [compliance, setCompliance] = useState<ComplianceSettings>({
    gdprEnabled: true,
    dpdpEnabled: true,
    dataRetentionMonths: 3,
    autoPurgeEnabled: true,
    consentRequired: true,
    rightToErasure: true
  })

  const [showNewVendor, setShowNewVendor] = useState(false)
  const [showNewConsent, setShowNewConsent] = useState(false)
  const { toast } = useToast()

  const handleSaveCompliance = () => {
    toast({
      title: "Compliance Settings Saved",
      description: "Data protection and compliance settings have been updated"
    })
  }

  const vendorColumns = [
    {
      id: 'name',
      header: 'Vendor Name',
      accessor: 'name' as keyof BGVVendor
    },
    {
      id: 'type',
      header: 'Type',
      accessor: 'type' as keyof BGVVendor,
      cell: (item: BGVVendor) => (
        <Badge 
          variant="outline"
          className={
            item.type === 'PREFERRED' ? 'border-green-200 text-green-700' :
            item.type === 'APPROVED' ? 'border-blue-200 text-blue-700' :
            'border-red-200 text-red-700'
          }
        >
          {item.type}
        </Badge>
      )
    },
    {
      id: 'services',
      header: 'Services',
      accessor: 'services' as keyof BGVVendor,
      cell: (item: BGVVendor) => (
        <div className="flex flex-wrap gap-1">
          {item.services.slice(0, 2).map(service => (
            <Badge key={service} variant="secondary" className="text-xs">
              {service}
            </Badge>
          ))}
          {item.services.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{item.services.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    {
      id: 'location',
      header: 'Coverage',
      accessor: 'location' as keyof BGVVendor
    },
    {
      id: 'rating',
      header: 'Rating',
      accessor: 'rating' as keyof BGVVendor,
      cell: (item: BGVVendor) => (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{item.rating}</span>
          <span className="text-yellow-500">★</span>
        </div>
      )
    },
    {
      id: 'isActive',
      header: 'Status',
      accessor: 'isActive' as keyof BGVVendor,
      cell: (item: BGVVendor) => (
        <Badge className={item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof BGVVendor,
      cell: (item: BGVVendor) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const consentColumns = [
    {
      id: 'name',
      header: 'Template Name',
      accessor: 'name' as keyof ConsentTemplate
    },
    {
      id: 'type',
      header: 'Type',
      accessor: 'type' as keyof ConsentTemplate,
      cell: (item: ConsentTemplate) => (
        <Badge variant="outline">{item.type}</Badge>
      )
    },
    {
      id: 'language',
      header: 'Language',
      accessor: 'language' as keyof ConsentTemplate
    },
    {
      id: 'isDefault',
      header: 'Default',
      accessor: 'isDefault' as keyof ConsentTemplate,
      cell: (item: ConsentTemplate) => (
        <Badge className={item.isDefault ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
          {item.isDefault ? 'Default' : 'Custom'}
        </Badge>
      )
    },
    {
      id: 'lastUpdated',
      header: 'Last Updated',
      accessor: 'lastUpdated' as keyof ConsentTemplate,
      cell: (item: ConsentTemplate) => (
        <div className="text-sm">
          {new Date(item.lastUpdated).toLocaleDateString()}
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof ConsentTemplate,
      cell: (item: ConsentTemplate) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* BGV Vendors */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>BGV Vendor Management</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button onClick={() => setShowNewVendor(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Vendor
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={vendors}
            columns={vendorColumns}
            loading={false}
            searchable={false}
          />
        </CardContent>
      </Card>

      {/* Consent Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Digital Consent Templates</CardTitle>
            <Button onClick={() => setShowNewConsent(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={consentTemplates}
            columns={consentColumns}
            loading={false}
            searchable={false}
          />
        </CardContent>
      </Card>

      {/* Compliance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Protection & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">GDPR Compliance</h3>
                  <p className="text-sm text-muted-foreground">Enable EU General Data Protection Regulation</p>
                </div>
                <Switch 
                  checked={compliance.gdprEnabled}
                  onCheckedChange={(checked) => setCompliance(prev => ({ ...prev, gdprEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">DPDP Compliance</h3>
                  <p className="text-sm text-muted-foreground">Enable India Digital Personal Data Protection</p>
                </div>
                <Switch 
                  checked={compliance.dpdpEnabled}
                  onCheckedChange={(checked) => setCompliance(prev => ({ ...prev, dpdpEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Digital Consent Required</h3>
                  <p className="text-sm text-muted-foreground">Mandate digital consent for all BGV processes</p>
                </div>
                <Switch 
                  checked={compliance.consentRequired}
                  onCheckedChange={(checked) => setCompliance(prev => ({ ...prev, consentRequired: checked }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Auto Data Purge</h3>
                  <p className="text-sm text-muted-foreground">Automatically delete data after retention period</p>
                </div>
                <Switch 
                  checked={compliance.autoPurgeEnabled}
                  onCheckedChange={(checked) => setCompliance(prev => ({ ...prev, autoPurgeEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Right to Erasure</h3>
                  <p className="text-sm text-muted-foreground">Allow candidates to request data deletion</p>
                </div>
                <Switch 
                  checked={compliance.rightToErasure}
                  onCheckedChange={(checked) => setCompliance(prev => ({ ...prev, rightToErasure: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Data Retention Period (Months)</Label>
                <Select 
                  value={compliance.dataRetentionMonths.toString()}
                  onValueChange={(value) => setCompliance(prev => ({ ...prev, dataRetentionMonths: parseInt(value) }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button onClick={handleSaveCompliance}>
            <Save className="mr-2 h-4 w-4" />
            Save Compliance Settings
          </Button>
        </CardContent>
      </Card>

      {/* Vendor Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">API Integration Framework</h3>
                <p className="text-sm text-muted-foreground">
                  Currently set to manual mode. Future API integrations will be configured here.
                </p>
              </div>
              <Badge variant="outline" className="border-orange-200 text-orange-700">
                Coming Soon
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border rounded">
              <h4 className="font-medium text-sm">Webhook Configuration</h4>
              <p className="text-xs text-muted-foreground mt-1">Setup webhooks for status updates</p>
              <Button variant="outline" size="sm" className="mt-2" disabled>
                Configure
              </Button>
            </div>
            <div className="p-3 border rounded">
              <h4 className="font-medium text-sm">API Rate Limits</h4>
              <p className="text-xs text-muted-foreground mt-1">Manage API call quotas and limits</p>
              <Button variant="outline" size="sm" className="mt-2" disabled>
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Vendor Modal */}
      <Dialog open={showNewVendor} onOpenChange={setShowNewVendor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add BGV Vendor</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vendor Name</Label>
                <Input placeholder="e.g., SecureVerify India" />
              </div>
              <div className="space-y-2">
                <Label>Vendor Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREFERRED">Preferred</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="BLACKLISTED">Blacklisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Services Offered</Label>
              <div className="grid grid-cols-3 gap-2">
                {['Education', 'Employment', 'Criminal', 'Address', 'Court Records', 'Credit Check', 'References', 'Drug Test'].map(service => (
                  <div key={service} className="flex items-center space-x-2">
                    <input type="checkbox" id={service} />
                    <Label htmlFor={service} className="text-sm">{service}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input type="email" placeholder="info@vendor.com" />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input placeholder="+91-80-12345678" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Coverage Area</Label>
              <Input placeholder="e.g., Pan India, South India, Mumbai" />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewVendor(false)}>
                Cancel
              </Button>
              <Button>
                Add Vendor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Consent Template Modal */}
      <Dialog open={showNewConsent} onOpenChange={setShowNewConsent}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Consent Template</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input placeholder="e.g., Executive Level BGV Consent" />
              </div>
              <div className="space-y-2">
                <Label>Template Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASIC">Basic</SelectItem>
                    <SelectItem value="DETAILED">Detailed</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="tamil">Tamil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Consent Content</Label>
              <Textarea
                placeholder="Enter the consent form content..."
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Include all necessary legal clauses and data protection terms
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="default" />
              <Label htmlFor="default" className="text-sm">Set as default template</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewConsent(false)}>
                Cancel
              </Button>
              <Button>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}