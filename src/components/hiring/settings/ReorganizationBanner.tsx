import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { X, Info, ExternalLink } from 'lucide-react'

interface ReorganizationBannerProps {
  onDismiss: () => void
}

export function ReorganizationBanner({ onDismiss }: ReorganizationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss()
    // Store dismissal in localStorage for 14 days
    const dismissalData = {
      timestamp: Date.now(),
      duration: 14 * 24 * 60 * 60 * 1000 // 14 days in milliseconds
    }
    localStorage.setItem('hiring-settings-reorganization-dismissed', JSON.stringify(dismissalData))
  }

  // Check if banner was previously dismissed and still within 14 days
  const checkDismissal = () => {
    const stored = localStorage.getItem('hiring-settings-reorganization-dismissed')
    if (stored) {
      const { timestamp, duration } = JSON.parse(stored)
      if (Date.now() - timestamp < duration) {
        return true
      } else {
        // Remove expired dismissal
        localStorage.removeItem('hiring-settings-reorganization-dismissed')
      }
    }
    return false
  }

  if (isDismissed || checkDismissal()) {
    return null
  }

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <span className="font-medium text-blue-900">We reorganized Hiring Settings</span>
          <span className="text-blue-700 ml-2">
            Settings are now organized into Performance, Workflow, Content, Compliance, and Defaults tabs.
          </span>
          <Button
            variant="link"
            className="p-0 h-auto text-blue-600 hover:text-blue-800 ml-2"
            onClick={() => window.open('/help/hiring-settings-reorganization', '_blank')}
          >
            Learn more
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 ml-4"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}