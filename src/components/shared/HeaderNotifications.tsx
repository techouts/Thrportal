import { useState, useEffect, useCallback } from "react"
import { Bell, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { getNotificationService, Notification } from "@/services/notifications"
import { supabase } from "@/integrations/supabase/client"

export function HeaderNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const notificationService = getNotificationService()

  // Get current user on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getUser()
  }, [])

  const loadNotifications = useCallback(async () => {
    if (!userId) return

    try {
      const { data, success } = await notificationService.getAll({ limit: 50 })
      if (success) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.read).length)
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
      setUnreadCount(0)
    }
  }, [userId, notificationService])

  useEffect(() => {
    if (userId) {
      loadNotifications()
    }
  }, [userId, loadNotifications])

  const handleMarkAsRead = async (notificationId: string) => {
    const { success } = await notificationService.markAsRead(notificationId)
    if (success) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!userId) return
    
    const { success } = await notificationService.markAllAsRead(userId)
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center font-medium">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>Your recent updates and alerts</SheetDescription>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`p-4 cursor-pointer transition-colors ${!notification.read ? 'bg-muted/50' : ''}`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${notification.read ? 'bg-muted' : 'bg-primary'}`} />
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.body}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
