/**
 * HRMS Home Page - Dashboard Layout Implementation
 * 
 * FEATURES:
 * - Compact dashboard-style layout that fits in viewport
 * - Widget-based design for better information density
 * - No scrolling required - all content visible at once
 * - Responsive grid layout optimized for desktop and mobile
 * - Enhanced interactivity with modals and hover states
 */

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Bell, Calendar, Clock, MapPin, Zap } from 'lucide-react'

// Widget Components
import { ClockInWidget } from '@/components/home/ClockInWidget'
import { MetricsWidget } from '@/components/home/MetricsWidget'
import { QuickRecognitionWidget } from '@/components/home/QuickRecognitionWidget'
import { PersonalSummaryWidget } from '@/components/home/PersonalSummaryWidget'
import { OrgPulseWidget } from '@/components/home/OrgPulseWidget'
import { TeamStatusWidget } from '@/components/home/TeamStatusWidget'
import { CelebrationsWidget } from '@/components/home/CelebrationsWidget'
import { RecognitionsWidget } from '@/components/home/RecognitionsWidget'
import { ApprovalsWidget } from '@/components/home/ApprovalsWidget'

// Shared Components
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { QuickSignIn } from '@/components/shared/QuickSignIn'
import { HiringFeatureStatus } from '@/components/shared/HiringFeatureStatus'

// Services and Context
import { homeService } from '@/services/homeService'
import { useAuth } from '@/auth/AuthContext'
import { moduleRegistry } from '@/lib/moduleRegistry'

export default function HomePage() {
  const { toast } = useToast()
  const { user: currentUser } = useAuth()
  const userRole = currentUser?.role || 'Employee'
  const isManager = userRole === 'Manager' || userRole === 'HR' || userRole === 'MANAGER' || userRole === 'HR_MANAGER'
  
  // State management
  const [lastClockIn, setLastClockIn] = useState<Date | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Register module spec
  const moduleSpec = moduleRegistry.getModuleSpec('/Home') || 
    moduleRegistry.registerModuleSpec('/Home', {
      brdStatus: 'implemented',
      promptStatus: 'completed',
      description: 'HRMS Home dashboard with widget-based layout'
    })

  // Vote on poll handler
  const handleVoteOnPoll = useCallback(async (pollId: string, optionId: string) => {
    try {
      await homeService.voteOnPoll(pollId, optionId)
      toast({
        title: "Vote recorded",
        description: "You can change your vote until the poll closes.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive"
      })
    }
  }, [toast])

  // Clock in handler with debounce protection
  const handleClockIn = useCallback(async (mode: 'Web' | 'Remote' | 'WFH', note?: string) => {
    const now = new Date()
    if (lastClockIn && (now.getTime() - lastClockIn.getTime()) < 2 * 60 * 1000) {
      toast({
        title: "Already clocked in",
        description: "You've recently clocked in. Please wait before trying again.",
        variant: "destructive"
      })
      return
    }

    try {
      const event = await homeService.clockIn(mode, note)
      setLastClockIn(now)
      toast({
        title: "Clock-in saved",
        description: `${event.timestamp.split('T')[1].slice(0,5)} • ${mode}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clock in. Please try again.",
        variant: "destructive"
      })
    }
  }, [lastClockIn, toast])

  // Data loading
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const notificationsData = await homeService.getNotifications(true)
        setUnreadCount(notificationsData.length)
      } catch (error) {
        console.error('Failed to load home data:', error)
      }
    }
    
    loadData()
  }, [])

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Home"
        description="Your personalized HRMS dashboard"
        breadcrumbs={[
          { label: 'Home', href: '/Home' }
        ]}
        moduleSpec={moduleSpec}
      />

      {/* Quick Actions Bar - Fixed Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border"
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-8">
            <Calendar className="h-3 w-3" />
            Apply Leave
          </Button>
          <Button variant="outline" size="sm" className="gap-2 h-8">
            <Clock className="h-3 w-3" />
            Log Time
          </Button>
          <Button variant="outline" size="sm" className="gap-2 h-8">
            <Zap className="h-3 w-3" />
            IT Ticket
          </Button>
          <Button variant="outline" size="sm" className="gap-2 h-8">
            <MapPin className="h-3 w-3" />
            Book Room
          </Button>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 relative h-8">
              <Bell className="h-3 w-3" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>Your recent updates and alerts</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${notification.read ? 'bg-muted' : 'bg-primary'}`} />
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.body}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </motion.div>

      {/* Dashboard Grid Layout - No Scrolling */}
      <div className="space-y-4">
        {/* Hero Row - Most Important Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <ClockInWidget onClockIn={handleClockIn} lastClockIn={lastClockIn} />
          <MetricsWidget />
          <QuickRecognitionWidget />
          <PersonalSummaryWidget />
        </motion.div>

        {/* Main Content Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <OrgPulseWidget onVote={handleVoteOnPoll} />
          {isManager && <TeamStatusWidget isManager={isManager} />}
          <CelebrationsWidget />
          <RecognitionsWidget />
          {isManager && <ApprovalsWidget isManager={isManager} />}
          
          {/* Fill remaining space with useful info for non-managers */}
          {!isManager && (
            <Card className="border-0 shadow-card">
              <CardContent className="p-4 text-center space-y-2">
                <div className="text-2xl">🎯</div>
                <h4 className="font-medium text-sm">Quick Goals</h4>
                <p className="text-xs text-muted-foreground">Track your progress</p>
                <Button variant="outline" size="sm" className="w-full">
                  View Goals
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Footer Info - Compact */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <QuickSignIn />
        <HiringFeatureStatus />
      </motion.div>
    </div>
  )
}