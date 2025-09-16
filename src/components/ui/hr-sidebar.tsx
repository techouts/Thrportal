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
  Heart,
  Home,
  MessageSquare,
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
  Monitor,
  LogOut
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
import { useAuth } from "../../auth/AuthContext"
import { useVisible } from "../../hooks/useVisible"
import { MENU } from "../../menu/config"
import { Button } from "@/components/ui/button"

// Icon mapping for menu items
const getIconForSection = (sectionName: string) => {
  switch (sectionName) {
    case "Home": return Home
    case "Me": return Users
    case "My Team": return Users
    case "Hiring": return UserCheck
    case "Projects": return Briefcase
    case "Org": return Building2
    case "HR": return Heart
    case "Finance": return DollarSign
    case "IT": return Monitor
    case "Admin": return Settings
    default: return Home
  }
}

const getIconForRoute = (routeName: string) => {
  switch (routeName) {
    case "Dashboard": return BarChart3
    case "Profile": return Users
    case "Attendance": return Clock
    case "Leave": return Calendar
    case "Timesheet": return Clock
    case "Expenses": return DollarSign
    case "Finance": return DollarSign
    case "Learning": return BookOpen
    case "Recognition": return Star
    case "Performance": return Target
    case "IJP": return TrendingUp
    case "Helpdesk": return MessageSquare
    case "Job Requisitions": return FileText
    case "Assignment": return CheckSquare
    case "Applications": return FileText
    case "Employee Directory": return Users
    case "Org Structure": return Building2
    case "Policy Hub": return FileText
    case "Payroll": return DollarSign
    case "On/Offboarding": return UserCheck
    case "Reports": return BarChart3
    case "Tenant": return Building2
    case "Access": return Shield
    case "Integrations": return Settings
    case "Audit": return FileText
    case "Security": return Shield
    case "Profile Changes": return UserCheck
    default: return Home
  }
}

export function HRSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"
  const { user, signOut } = useAuth()
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initialExpanded: Record<string, boolean> = {}
    MENU.forEach((section) => {
      const hasActiveRoute = section.items?.some(item => 
        currentPath.startsWith(item.route)
      ) || false
      initialExpanded[section.label] = hasActiveRoute
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
        {MENU.map((section) => {
          const visible = useVisible(section.requiresAny)
          if (!visible) return null

          const SectionIcon = getIconForSection(section.label)
          const isExpanded = expandedSections[section.label]
          const hasActiveRoute = section.items?.some(item => 
            isRouteActive(item.route)
          ) || false

          return (
            <SidebarGroup key={section.label}>
              <Collapsible
                open={isExpanded}
                onOpenChange={() => toggleSection(section.label)}
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
                      {!collapsed && <span>{section.label}</span>}
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
                        {section.items?.map((item) => {
                          const itemVisible = useVisible(item.requiresAny)
                          if (!itemVisible) return null

                          const RouteIcon = getIconForRoute(item.label)
                          const isActive = isRouteActive(item.route)

                          return (
                            <SidebarMenuItem key={item.route}>
                              <SidebarMenuButton asChild>
                                <NavLink
                                  to={item.route}
                                  className={cn(
                                    "flex h-9 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent",
                                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                                  )}
                                >
                                  <RouteIcon className="h-3.5 w-3.5" />
                                  <span>{item.label}</span>
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
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex-1 text-sm">
                <div className="font-medium text-sidebar-foreground">{user?.display_name}</div>
                <div className="text-xs text-sidebar-foreground/70">{user?.role}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent">
              <Users className="h-4 w-4" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}