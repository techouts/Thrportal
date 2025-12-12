import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter, HelpCircle, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  onFilterClick?: () => void
  helpUrl?: string
  owner?: string
  brdStatus?: 'draft' | 'review' | 'approved' | 'implemented'
  promptStatus?: 'pending' | 'processing' | 'completed' | 'failed'
  moduleSpec?: any
  icon?: any
  actions?: React.ReactNode
}

const statusColors = {
  brd: {
    draft: 'bg-slate-100 text-slate-700',
    review: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    implemented: 'bg-blue-100 text-blue-700'
  },
  prompt: {
    pending: 'bg-slate-100 text-slate-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700'
  }
}

export function PageHeader({
  title,
  breadcrumbs = [],
  onFilterClick,
  helpUrl,
  owner,
  brdStatus,
  promptStatus,
  actions
}: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-background px-6 py-4">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-2">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="h-3 w-3 mx-1" />}
              {crumb.href ? (
                <Link 
                  to={crumb.href} 
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          
          {/* Meta Panel */}
          <div className="flex items-center gap-2 text-xs">
            {owner && (
              <Badge variant="outline" className="font-normal">
                Owner: {owner}
              </Badge>
            )}
            {brdStatus && (
              <Badge 
                variant="outline" 
                className={`font-normal ${statusColors.brd[brdStatus]}`}
              >
                BRD: {brdStatus}
              </Badge>
            )}
            {promptStatus && (
              <Badge 
                variant="outline"
                className={`font-normal ${statusColors.prompt[promptStatus]}`}
              >
                Prompt: {promptStatus}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onFilterClick && (
            <Button variant="outline" size="sm" onClick={onFilterClick}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          )}
          
          {helpUrl && (
            <Button variant="ghost" size="sm" asChild>
              <a href={helpUrl} target="_blank" rel="noopener noreferrer">
                <HelpCircle className="h-4 w-4" />
              </a>
            </Button>
          )}
          
          {actions}
        </div>
      </div>
    </div>
  )
}