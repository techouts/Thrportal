import { PageHeader } from '@/components/shared/PageHeader'
import { moduleRegistry } from '@/lib/moduleRegistry'
import { ProjectDashboard } from '@/components/projects/ProjectDashboard'
import { ProjectClients } from '@/components/projects/ProjectClients'
import { ProjectProjects } from '@/components/projects/ProjectProjects'
import { ProjectAssignments } from '@/components/projects/ProjectAssignments'
import { ProjectTasks } from '@/components/projects/ProjectTasks'
import { ProjectBench } from '@/components/projects/ProjectBench'

interface ProjectPageProps {
  defaultTab: string
}

export default function ProjectPage({ defaultTab }: ProjectPageProps) {
  const moduleSpec = moduleRegistry.getModuleSpec(`/Project/${defaultTab}`) || 
    moduleRegistry.registerModuleSpec(`/Project/${defaultTab}`, {
      brdStatus: 'draft',
      promptStatus: 'pending',
      description: `Project management - ${defaultTab}`
    })

  const renderContent = () => {
    switch (defaultTab) {
      case 'Dashboard':
        return <ProjectDashboard />
      case 'Clients':
        return <ProjectClients />
      case 'Projects':
        return <ProjectProjects />
      case 'Assignments':
        return <ProjectAssignments />
      case 'Tasks':
        return <ProjectTasks />
      case 'Bench':
        return <ProjectBench />
      default:
        return <ProjectDashboard />
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Projects - ${defaultTab}`}
        breadcrumbs={[
          { label: 'Projects', href: '/Project/Dashboard' },
          { label: defaultTab, href: `/Project/${defaultTab}` }
        ]}
        moduleSpec={moduleSpec}
      />

      {renderContent()}
    </div>
  )
}