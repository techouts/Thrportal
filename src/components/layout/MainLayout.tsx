import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { HRSidebar } from "@/components/ui/hr-sidebar"
import { Button } from "@/components/ui/button"
import { Bell, Search, User } from "lucide-react"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <HRSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-4 lg:px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden" />
                <div className="hidden lg:flex items-center gap-2">
                  <SidebarTrigger />
                  <div className="h-6 w-px bg-border" />
                  <h1 className="text-lg font-semibold text-foreground">HR Management System</h1>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="hidden md:flex relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search employees, documents..."
                    className="pl-10 pr-4 py-2 w-64 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full" />
                </Button>

                {/* User Menu */}
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="container max-w-7xl mx-auto p-4 lg:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}