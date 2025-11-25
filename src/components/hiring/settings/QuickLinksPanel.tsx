import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { TrendingUp, CheckSquare, FileText, DollarSign, Clock, GitBranch, Shield, Settings } from 'lucide-react'

export function QuickLinksPanel() {
  const quickLinks = [
    {
      label: 'Targets',
      description: 'Recruiter & team targets',
      href: '/Hiring/Settings/performance/targets',
      icon: TrendingUp,
      category: 'Performance'
    },
    {
      label: 'Approvals',
      description: 'JD & offer approvals',
      href: '/Hiring/Settings/workflow/approvals',
      icon: CheckSquare,
      category: 'Workflow'
    },
    {
      label: 'Parser',
      description: 'JD & CV parsing',
      href: '/Hiring/Settings/content/parser',
      icon: FileText,
      category: 'Content'
    },
    {
      label: 'Offers',
      description: 'Offer matrix & bands',
      href: '/Hiring/Settings/content/offers',
      icon: DollarSign,
      category: 'Content'
    },
    {
      label: 'SLA',
      description: 'Timer configuration',
      href: '/Hiring/Settings/workflow/sla',
      icon: Clock,
      category: 'Workflow'
    },
    {
      label: 'Pipeline',
      description: 'Board controls & limits',
      href: '/Hiring/Settings/workflow/pipeline',
      icon: GitBranch,
      category: 'Workflow'
    },
    {
      label: 'Vendors',
      description: 'BGV & compliance',
      href: '/Hiring/Settings/compliance/vendors',
      icon: Shield,
      category: 'Compliance'
    },
    {
      label: 'Global',
      description: 'Default settings',
      href: '/Hiring/Settings/defaults/global',
      icon: Settings,
      category: 'Defaults'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickLinks.map((link) => (
          <div key={link.href} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <Link to={link.href} className="flex items-center gap-3 flex-1">
              <link.icon className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{link.label}</div>
                <div className="text-xs text-muted-foreground truncate">{link.description}</div>
              </div>
            </Link>
            <Badge variant="outline" className="text-xs">
              {link.category}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}