import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { 
  Calculator, 
  Calendar, 
  CreditCard, 
  Settings, 
  User, 
  Search,
  FileText,
  Users,
  BarChart3,
  Building2,
  Heart,
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
  Target,
  Lightbulb,
  MessageSquare,
  CheckSquare,
  UserCheck,
  Briefcase,
  FolderOpen,
  Star,
  Gift,
  Home
} from 'lucide-react'

interface CommandAction {
  id: string
  title: string
  description?: string
  icon: React.ElementType
  shortcut?: string[]
  section: string
  action: () => void
  keywords?: string[]
  badge?: string
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  // Register keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onOpenChange])

  const actions: CommandAction[] = [
    // Navigation
    {
      id: 'home-dashboard',
      title: 'Home Dashboard',
      description: 'View company announcements and updates',
      icon: Home,
      section: 'Navigation',
      action: () => navigate('/Home'),
      keywords: ['home', 'announcements', 'news']
    },
    {
      id: 'my-dashboard',
      title: 'My Dashboard',
      description: 'Personal dashboard and overview',
      icon: BarChart3,
      section: 'Navigation',
      action: () => navigate('/Me/Dashboard'),
      keywords: ['personal', 'overview']
    },
    {
      id: 'my-profile',
      title: 'My Profile',
      description: 'View and edit personal information',
      icon: User,
      section: 'Navigation',
      action: () => navigate('/Me/Profile'),
      keywords: ['personal', 'information', 'details']
    },
    {
      id: 'attendance',
      title: 'My Attendance',
      description: 'Clock in/out and view attendance logs',
      icon: Clock,
      section: 'Navigation',
      action: () => navigate('/Me/Attendance'),
      keywords: ['clock', 'time', 'hours']
    },
    {
      id: 'leave',
      title: 'Leave Management',
      description: 'Apply for leave and check balance',
      icon: Calendar,
      section: 'Navigation',
      action: () => navigate('/Me/Leave'),
      keywords: ['vacation', 'time off', 'holiday']
    },
    {
      id: 'expenses',
      title: 'My Expenses',
      description: 'Submit and track expense claims',
      icon: DollarSign,
      section: 'Navigation',
      action: () => navigate('/Me/Expenses'),
      keywords: ['receipts', 'claims', 'reimbursement']
    },
    {
      id: 'performance',
      title: 'Performance',
      description: 'Goals, reviews, and feedback',
      icon: Target,
      section: 'Navigation',
      action: () => navigate('/Me/Performance'),
      keywords: ['goals', 'review', 'feedback', 'appraisal']
    },

    // Team Management (Manager)
    {
      id: 'team-dashboard',
      title: 'Team Dashboard',
      description: 'Manage your team',
      icon: Users,
      section: 'Team Management',
      action: () => navigate('/MyTeam/Dashboard'),
      keywords: ['team', 'manage', 'reports'],
      badge: 'Manager'
    },
    {
      id: 'team-leave',
      title: 'Team Leave Approvals',
      description: 'Approve team leave requests',
      icon: Calendar,
      section: 'Team Management',
      action: () => navigate('/MyTeam/Leave'),
      keywords: ['approve', 'team', 'leave'],
      badge: 'Manager'
    },

    // HR Functions
    {
      id: 'employee-directory',
      title: 'Employee Directory',
      description: 'Search and view employee information',
      icon: Users,
      section: 'Organization',
      action: () => navigate('/Org/EmployeeDirectory'),
      keywords: ['employees', 'directory', 'contacts']
    },
    {
      id: 'org-structure',
      title: 'Organization Structure',
      description: 'View company hierarchy',
      icon: Building2,
      section: 'Organization',
      action: () => navigate('/Org/OrgStructure'),
      keywords: ['hierarchy', 'structure', 'org chart']
    },

    // Hiring
    {
      id: 'hiring-dashboard',
      title: 'Hiring Dashboard',
      description: 'Manage recruitment process',
      icon: UserCheck,
      section: 'Hiring',
      action: () => navigate('/Hiring/Dashboard'),
      keywords: ['recruitment', 'jobs', 'candidates'],
      badge: 'Recruiter'
    },
    {
      id: 'jds',
      title: 'Job Descriptions',
      description: 'Create and manage job descriptions',
      icon: FileText,
      section: 'Hiring',
      action: () => navigate('/Hiring/JDs'),
      keywords: ['jobs', 'openings', 'positions', 'jds'],
      badge: 'Recruiter'
    },

    // Projects
    {
      id: 'project-dashboard',
      title: 'Project Dashboard',
      description: 'Overview of all projects',
      icon: Briefcase,
      section: 'Projects',
      action: () => navigate('/Project/Dashboard'),
      keywords: ['projects', 'tasks', 'assignments']
    },

    // Reports
    {
      id: 'my-reports',
      title: 'My Reports',
      description: 'View personal reports',
      icon: BarChart3,
      section: 'Reports',
      action: () => navigate('/Reports/Mine'),
      keywords: ['analytics', 'data', 'insights']
    },
    {
      id: 'report-builder',
      title: 'Report Builder',
      description: 'Create custom reports',
      icon: BarChart3,
      section: 'Reports',
      action: () => navigate('/Reports/Builder'),
      keywords: ['create', 'custom', 'analytics']
    },

    // Quick Actions
    {
      id: 'quick-clockin',
      title: 'Quick Clock In',
      description: 'Clock in for today',
      icon: Clock,
      section: 'Quick Actions',
      action: () => {
        // TODO: Implement quick clock in
        alert('Clock in functionality would be implemented here')
      },
      keywords: ['clock', 'time', 'start', 'work']
    },
    {
      id: 'apply-leave',
      title: 'Apply for Leave',
      description: 'Quick leave application',
      icon: Calendar,
      section: 'Quick Actions',
      action: () => navigate('/Me/Leave'),
      keywords: ['apply', 'leave', 'vacation', 'time off']
    },
    {
      id: 'submit-expense',
      title: 'Submit Expense',
      description: 'Quick expense submission',
      icon: DollarSign,
      section: 'Quick Actions',
      action: () => navigate('/Me/Expenses'),
      keywords: ['expense', 'receipt', 'claim']
    }
  ]

  const filteredActions = actions.filter(action => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      action.title.toLowerCase().includes(searchLower) ||
      action.description?.toLowerCase().includes(searchLower) ||
      action.keywords?.some(keyword => keyword.includes(searchLower))
    )
  })

  const groupedActions = filteredActions.reduce((groups, action) => {
    const section = action.section
    if (!groups[section]) {
      groups[section] = []
    }
    groups[section].push(action)
    return groups
  }, {} as Record<string, CommandAction[]>)

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={searchTerm}
        onValueChange={setSearchTerm}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {Object.entries(groupedActions).map(([section, sectionActions], index) => (
          <div key={section}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={section}>
              {sectionActions.map((action) => {
                const Icon = action.icon
                return (
                  <CommandItem
                    key={action.id}
                    onSelect={() => {
                      action.action()
                      onOpenChange(false)
                    }}
                    className="flex items-center gap-2 px-2 py-3"
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{action.title}</span>
                        {action.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      {action.description && (
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      )}
                    </div>
                    {action.shortcut && (
                      <div className="flex gap-1">
                        {action.shortcut.map((key) => (
                          <kbd
                            key={key}
                            className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </div>
        ))}
        
        <CommandSeparator />
        <CommandGroup heading="Tips">
          <CommandItem disabled>
            <Search className="h-4 w-4 mr-2" />
            <span className="text-muted-foreground">
              Use Ctrl+K (Cmd+K) to open this palette anytime
            </span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}