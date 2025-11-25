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
  console.log('🚀 ProjectPage rendering with defaultTab:', defaultTab)
  
  const moduleSpec = moduleRegistry.getModuleSpec(`/Project/${defaultTab}`) || 
    moduleRegistry.registerModuleSpec(`/Project/${defaultTab}`, {
      brdStatus: 'draft',
      promptStatus: 'pending',
      description: `Project management - ${defaultTab}`
    })

  const renderContent = () => {
    console.log('🎯 Rendering content for tab:', defaultTab)
    
    try {
      switch (defaultTab) {
        case 'Dashboard':
          console.log('📊 Loading ProjectDashboard')
          return <ProjectDashboard />
        case 'Clients':
          console.log('🏢 Loading ProjectClients')
          return <ProjectClients />
        case 'Projects':
          console.log('📁 Loading ProjectProjects')
          return <ProjectProjects />
        case 'Assignments':
          console.log('👥 Loading ProjectAssignments')
          return <ProjectAssignments />
        case 'Tasks':
          console.log('✅ Loading ProjectTasks')
          return <ProjectTasks />
        case 'Bench':
          console.log('🪑 Loading ProjectBench')
          return <ProjectBench />
        default:
          console.log('📊 Loading default ProjectDashboard')
          return <ProjectDashboard />
      }
    } catch (error) {
      console.error('❌ Error rendering project content:', error)
      return <div className="p-4 text-destructive">Error loading project content: {error instanceof Error ? error.message : 'Unknown error'}</div>
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