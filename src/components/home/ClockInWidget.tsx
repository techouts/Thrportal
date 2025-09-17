import React, { useState } from 'react'
import { Clock, MapPin, Wifi, Home } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ClockInWidgetProps {
  onClockIn: (mode: 'Web' | 'Remote' | 'WFH', note?: string) => void
  lastClockIn?: Date | null
}

export function ClockInWidget({ onClockIn, lastClockIn }: ClockInWidgetProps) {
  const [selectedMode, setSelectedMode] = useState<'Web' | 'Remote' | 'WFH'>('Web')
  
  const modes = [
    { id: 'Web' as const, label: 'Office', icon: MapPin, color: 'bg-green-100 text-green-700' },
    { id: 'Remote' as const, label: 'Remote', icon: Wifi, color: 'bg-blue-100 text-blue-700' },
    { id: 'WFH' as const, label: 'WFH', icon: Home, color: 'bg-purple-100 text-purple-700' }
  ]

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <Card className="h-full border-0 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Clock In
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{currentTime}</div>
          {lastClockIn && (
            <div className="text-xs text-muted-foreground">
              Last: {lastClockIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-1">
          {modes.map((mode) => {
            const Icon = mode.icon
            return (
              <Button
                key={mode.id}
                variant={selectedMode === mode.id ? 'default' : 'outline'}
                size="sm"
                className="flex flex-col gap-1 h-auto py-2"
                onClick={() => setSelectedMode(mode.id)}
              >
                <Icon className="h-3 w-3" />
                <span className="text-xs">{mode.label}</span>
              </Button>
            )
          })}
        </div>
        
        <Button 
          className="w-full" 
          size="sm"
          onClick={() => onClockIn(selectedMode)}
        >
          Clock In
        </Button>
      </CardContent>
    </Card>
  )
}