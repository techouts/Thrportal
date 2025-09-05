import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  CheckSquare,
  Clock,
  DollarSign,
  FileText,
  FolderOpen,
  Gift,
  Heart,
  Home,
  Lightbulb,
  MessageSquare,
  PlusCircle,
  Settings,
  Shield,
  Star,
  Target,
  TrendingUp,
  Users,
  UserCheck,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Headphones,
  Monitor
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const navigationSections = {
  "Home": {
    icon: Home,
    routes: [
      { name: "Dashboard", path: "/Home", icon: BarChart3 }
    ]
  },
  "Me": {
    icon: Users,
    routes: [
      { name: "Dashboard", path: "/Me/Dashboard", icon: BarChart3 },
      { name: "Profile", path: "/Me/Profile", icon: Users },
      { name: "Attendance", path: "/Me/Attendance", icon: Clock },
      { name: "Leave", path: "/Me/Leave", icon: Calendar },
      { name: "Timesheet", path: "/Me/Timesheet", icon: Clock },
      { name: "Expenses", path: "/Me/Expenses", icon: DollarSign },
      { name: "Finance", path: "/Me/Finance", icon: DollarSign },
      { name: "Learning", path: "/Me/Learning", icon: BookOpen },
      { name: "Recognition", path: "/Me/Recognition", icon: Star },
      { name: "Performance", path: "/Me/Performance", icon: Target },
      { name: "IJP", path: "/Me/IJP", icon: TrendingUp },
      { name: "Referrals", path: "/Me/Referrals", icon: Users },
      { name: "Helpdesk", path: "/Me/Helpdesk", icon: MessageSquare }
    ]
  },
  "MyTeam": {
    icon: Users,
    routes: [
      { name: "Dashboard", path: "/MyTeam/Dashboard", icon: BarChart3 },
      { name: "Leave", path: "/MyTeam/Leave", icon: Calendar },
      { name: "Attendance", path: "/MyTeam/Attendance", icon: Clock },
      { name: "Timesheet", path: "/MyTeam/Timesheet", icon: Clock },
      { name: "Expenses", path: "/MyTeam/Expenses", icon: DollarSign },
      { name: "Learning", path: "/MyTeam/Learning", icon: BookOpen },
      { name: "Recognition", path: "/MyTeam/Recognition", icon: Star },
      { name: "Performance", path: "/MyTeam/Performance", icon: Target },
      { name: "IJP", path: "/MyTeam/IJP", icon: TrendingUp },
      { name: "ProfileChanges", path: "/MyTeam/ProfileChanges", icon: UserCheck }
    ]
  },
  "Hiring": {
    icon: UserCheck,
    routes: [
      { name: "Dashboard", path: "/Hiring/Dashboard", icon: BarChart3 },
      { name: "JobRequisitions", path: "/Hiring/JobRequisitions", icon: FileText },
      { name: "Assignment", path: "/Hiring/Assignment", icon: CheckSquare },
      { name: "Applications", path: "/Hiring/Applications", icon: FileText },
      { name: "Pipeline", path: "/Hiring/Pipeline", icon: TrendingUp },
      { name: "FollowUp", path: "/Hiring/FollowUp", icon: MessageSquare },
      { name: "BGV", path: "/Hiring/BGV", icon: Shield },
      { name: "Settings", path: "/Hiring/Settings", icon: Settings }
    ]
  },
  "Projects": {
    icon: Briefcase,
    routes: [
      { name: "Dashboard", path: "/Project/Dashboard", icon: BarChart3 },
      { name: "Clients", path: "/Project/Clients", icon: Building2 },
      { name: "Projects", path: "/Project/Projects", icon: FolderOpen },
      { name: "Assignments", path: "/Project/Assignments", icon: CheckSquare },
      { name: "Tasks", path: "/Project/Tasks", icon: CheckSquare },
      { name: "Bench", path: "/Project/Bench", icon: Users }
    ]
  },
  "Org": {
    icon: Building2,
    routes: [
      { name: "EmployeeDirectory", path: "/Org/EmployeeDirectory", icon: Users },
      { name: "OrgStructure", path: "/Org/OrgStructure", icon: Building2 },
      { name: "PolicyHub", path: "/Org/PolicyHub", icon: FileText }
    ]
  },
  "HR": {
    icon: Heart,
    routes: [
      { name: "Performance", path: "/HR/Performance", icon: Target },
      { name: "Leave", path: "/HR/Leave", icon: Calendar },
      { name: "Attendance", path: "/HR/Attendance", icon: Clock },
      { name: "Expenses", path: "/HR/Expenses", icon: DollarSign },
      { name: "Payroll", path: "/HR/Payroll", icon: DollarSign },
      { name: "Learning", path: "/HR/Learning", icon: BookOpen },
      { name: "Recognition", path: "/HR/Recognition", icon: Star },
      { name: "Helpdesk", path: "/HR/Helpdesk", icon: Headphones },
      { name: "Timesheet", path: "/HR/Timesheet", icon: Clock },
      { name: "IJP", path: "/HR/IJP", icon: TrendingUp },
      { name: "Hiring", path: "/HR/Hiring", icon: UserCheck },
      { name: "Succession", path: "/HR/Succession", icon: TrendingUp },
      { name: "OnOffboarding", path: "/HR/OnOffboarding", icon: UserCheck },
      { name: "Reports", path: "/HR/Reports", icon: BarChart3 }
    ]
  },
  "Finance": {
    icon: DollarSign,
    routes: [
      { name: "Payroll", path: "/Finance/Payroll", icon: DollarSign }
    ]
  },
  "IT": {
    icon: Monitor,
    routes: [
      { name: "Helpdesk", path: "/IT/Helpdesk", icon: Headphones }
    ]
  },
  "Admin": {
    icon: Settings,
    routes: [
      { name: "Tenant", path: "/Admin/Tenant", icon: Building2 },
      { name: "Access", path: "/Admin/Access", icon: Shield },
      { name: "Payroll", path: "/Admin/Payroll", icon: DollarSign },
      { name: "Integrations", path: "/Admin/Integrations", icon: Settings },
      { name: "Audit", path: "/Admin/Audit", icon: FileText },
      { name: "Security", path: "/Admin/Security", icon: Shield }
    ]
  }
}

export function HRSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initialExpanded: Record<string, boolean> = {}
    Object.entries(navigationSections).forEach(([sectionName, section]) => {
      const hasActiveRoute = section.routes.some(route => 
        currentPath.startsWith(route.path)
      )
      initialExpanded[sectionName] = hasActiveRoute
    })
    return initialExpanded
  })

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }))
  }

  const isRouteActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/')

  return (
    <Sidebar
      className={cn(
        "sidebar-nav transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Heart className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold text-sidebar-foreground">T-HR</h2>
              <p className="text-xs text-sidebar-foreground/70">Management Suite</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {Object.entries(navigationSections).map(([sectionName, section]) => {
          const SectionIcon = section.icon
          const isExpanded = expandedSections[sectionName]
          const hasActiveRoute = section.routes.some(route => 
            isRouteActive(route.path)
          )

          return (
            <SidebarGroup key={sectionName}>
              <Collapsible
                open={isExpanded}
                onOpenChange={() => toggleSection(sectionName)}
              >
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel
                    className={cn(
                      "group flex h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent cursor-pointer",
                      hasActiveRoute && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <SectionIcon className="h-4 w-4" />
                      {!collapsed && <span>{sectionName}</span>}
                    </div>
                    {!collapsed && (
                      <div className="transition-transform duration-200">
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </div>
                    )}
                  </SidebarGroupLabel>
                </CollapsibleTrigger>

                {!collapsed && (
                  <CollapsibleContent className="mt-1">
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {section.routes.map((route) => {
                          const RouteIcon = route.icon
                          const isActive = isRouteActive(route.path)

                          return (
                            <SidebarMenuItem key={route.name}>
                              <SidebarMenuButton asChild>
                                <NavLink
                                  to={route.path}
                                  className={cn(
                                    "flex h-9 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent",
                                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                                  )}
                                >
                                  <RouteIcon className="h-3.5 w-3.5" />
                                  <span>{route.name}</span>
                                </NavLink>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          )
                        })}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                )}
              </Collapsible>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent">
              <Users className="h-4 w-4" />
            </div>
            <div className="flex-1 text-sm">
              <div className="font-medium text-sidebar-foreground">John Doe</div>
              <div className="text-xs text-sidebar-foreground/70">HR Manager</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent">
              <Users className="h-4 w-4" />
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}