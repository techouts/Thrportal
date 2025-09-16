import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { PerformanceSettings } from '@/components/hiring/settings/PerformanceSettings'
import { WorkflowSettings } from '@/components/hiring/settings/WorkflowSettings'
import { ContentSettings } from '@/components/hiring/settings/ContentSettings'
import { ComplianceSettings } from '@/components/hiring/settings/ComplianceSettings'
import { DefaultsSettings } from '@/components/hiring/settings/DefaultsSettings'
import { QuickLinksPanel } from '@/components/hiring/settings/QuickLinksPanel'
import { SettingsSearch } from '@/components/hiring/settings/SettingsSearch'
import { ReorganizationBanner } from '@/components/hiring/settings/ReorganizationBanner'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { useAuth } from '@/auth/AuthContext'

export default function HiringSettingsPage() {
  const { topTab = 'performance', subTab } = useParams<{ topTab?: string; subTab?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { can } = useAuth()
  
  const [activeTopTab, setActiveTopTab] = useState(topTab || 'performance')
  const [searchQuery, setSearchQuery] = useState('')
  const [showReorganizationBanner, setShowReorganizationBanner] = useState(false)

  // Check if this is a redirected route
  useEffect(() => {
    const redirectParam = new URLSearchParams(location.search).get('redirected')
    if (redirectParam === 'true') {
      setShowReorganizationBanner(true)
    }
  }, [location])

  // Update URL when tabs change
  const handleTopTabChange = (value: string) => {
    setActiveTopTab(value)
    if (subTab) {
      navigate(`/Hiring/Settings/${value}/${subTab}`)
    } else {
      navigate(`/Hiring/Settings/${value}`)
    }
  }

  // Store last opened tab in localStorage
  useEffect(() => {
    localStorage.setItem('hiring-settings-last-tab', activeTopTab)
    if (subTab) {
      localStorage.setItem(`hiring-settings-last-subtab-${activeTopTab}`, subTab)
    }
  }, [activeTopTab, subTab])

  // Load last opened tab on mount
  useEffect(() => {
    if (!topTab) {
      const lastTab = localStorage.getItem('hiring-settings-last-tab')
      if (lastTab) {
        const lastSubTab = localStorage.getItem(`hiring-settings-last-subtab-${lastTab}`)
        navigate(lastSubTab ? `/Hiring/Settings/${lastTab}/${lastSubTab}` : `/Hiring/Settings/${lastTab}`)
      }
    }
  }, [])

  const topTabs = [
    { 
      id: 'performance', 
      label: 'Performance', 
      description: 'Targets, metrics, and performance tracking',
      requiresAny: ['hiring.settings.*']
    },
    { 
      id: 'workflow', 
      label: 'Workflow', 
      description: 'Approvals, SLA, feedback, and pipeline controls',
      requiresAny: ['hiring.settings.*']
    },
    { 
      id: 'content', 
      label: 'Content', 
      description: 'Templates, parsers, and content management',
      requiresAny: ['hiring.settings.*']
    },
    { 
      id: 'compliance', 
      label: 'Compliance', 
      description: 'Vendors, audit, and compliance configuration',
      requiresAny: ['hiring.settings.*']
    },
    { 
      id: 'defaults', 
      label: 'Defaults', 
      description: 'Global defaults and notification settings',
      requiresAny: ['hiring.settings.*']
    }
  ]

  const visibleTabs = topTabs.filter(tab => 
    !tab.requiresAny || tab.requiresAny.some(perm => can(perm))
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hiring Settings"
        description="Configure hiring workflows, SLAs, templates, and system defaults"
      />

      {showReorganizationBanner && (
        <ReorganizationBanner onDismiss={() => setShowReorganizationBanner(false)} />
      )}

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/Hiring">Hiring</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/Hiring/Settings">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          {activeTopTab && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{visibleTabs.find(t => t.id === activeTopTab)?.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
          {subTab && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">{subTab}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Search and Quick Links */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <SettingsSearch 
            query={searchQuery} 
            onQueryChange={setSearchQuery}
            onNavigate={(topTab, subTab) => navigate(`/Hiring/Settings/${topTab}/${subTab}`)}
          />
        </div>
        <div className="lg:w-80">
          <QuickLinksPanel />
        </div>
      </div>

      <Tabs value={activeTopTab} onValueChange={handleTopTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {visibleTabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceSettings activeSubTab={subTab} />
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <WorkflowSettings activeSubTab={subTab} />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentSettings activeSubTab={subTab} />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <ComplianceSettings activeSubTab={subTab} />
        </TabsContent>

        <TabsContent value="defaults" className="space-y-6">
          <DefaultsSettings activeSubTab={subTab} />
        </TabsContent>
      </Tabs>
    </div>
  )
}