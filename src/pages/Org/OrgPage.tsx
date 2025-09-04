import { PageHeader } from '@/components/shared/PageHeader'
import { moduleRegistry } from '@/lib/moduleRegistry'
import { EmployeeDirectory } from '@/components/org/EmployeeDirectory'
import { OrgStructure } from '@/components/org/OrgStructure'
import { PolicyHub } from '@/components/org/PolicyHub'

interface OrgPageProps {
  defaultTab: string
}

export default function OrgPage({ defaultTab }: OrgPageProps) {
  const moduleSpec = moduleRegistry.getModuleSpec(`/Org/${defaultTab}`) || 
    moduleRegistry.registerModuleSpec(`/Org/${defaultTab}`, {
      brdStatus: 'implemented',
      promptStatus: 'completed',
      description: `Organization - ${defaultTab}`
    })

  const renderContent = () => {
    switch (defaultTab) {
      case 'EmployeeDirectory':
        return <EmployeeDirectory />
      case 'OrgStructure':
        return <OrgStructure />
      case 'PolicyHub':
        return <PolicyHub />
      default:
        return <EmployeeDirectory />
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Organization - ${defaultTab}`}
        breadcrumbs={[
          { label: 'Org', href: '/Org/EmployeeDirectory' },
          { label: defaultTab, href: `/Org/${defaultTab}` }
        ]}
        moduleSpec={moduleSpec}
      />

      {renderContent()}
    </div>
  )
}