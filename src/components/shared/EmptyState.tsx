import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Users, 
  Calendar, 
  BarChart3, 
  Search,
  Table,
  Plus,
  RefreshCw 
} from 'lucide-react'

const icons = {
  file: FileText,
  users: Users,
  calendar: Calendar,
  chart: BarChart3,
  search: Search,
  table: Table,
  plus: Plus,
  refresh: RefreshCw
}

interface EmptyStateProps {
  icon?: keyof typeof icons
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  testId?: string
}

export function EmptyState({
  icon = 'file',
  title,
  description,
  action,
  testId = "empty-state"
}: EmptyStateProps) {
  const Icon = icons[icon]

  return (
    <div 
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      data-test-id={testId}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        {title}
      </h3>
      
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      
      {action && (
        <Button 
          onClick={action.onClick} 
          className="mt-6"
          data-test-id={`${testId}-action`}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}