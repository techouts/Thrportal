import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TimePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TimePicker({ 
  value, 
  onChange, 
  placeholder = "Select time",
  disabled = false,
  className 
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // Parse current value
  const [selectedHour, selectedMinute] = React.useMemo(() => {
    if (!value) return [null, null]
    const [h, m] = value.split(':')
    return [parseInt(h, 10), parseInt(m, 10)]
  }, [value])

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5) // 5-minute intervals

  const handleTimeSelect = (hour: number, minute: number) => {
    const formattedHour = hour.toString().padStart(2, '0')
    const formattedMinute = minute.toString().padStart(2, '0')
    onChange(`${formattedHour}:${formattedMinute}`)
    setOpen(false)
  }

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return null
    const [h, m] = timeStr.split(':')
    const hour = parseInt(h, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${m} ${ampm}`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? formatDisplayTime(value) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[200px] p-0" 
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <div className="flex border rounded-md bg-popover">
          {/* Hours Column */}
          <div className="flex-1 border-r">
            <div className="px-2 py-2 text-xs font-medium text-muted-foreground border-b text-center bg-muted/50">
              Hour
            </div>
            <ScrollArea className="h-[200px]">
              <div className="p-1">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full h-8 justify-center font-normal text-sm",
                      selectedHour === hour && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                    )}
                    onClick={() => handleTimeSelect(hour, selectedMinute ?? 0)}
                  >
                    {hour.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Minutes Column */}
          <div className="flex-1">
            <div className="px-2 py-2 text-xs font-medium text-muted-foreground border-b text-center bg-muted/50">
              Min
            </div>
            <ScrollArea className="h-[200px]">
              <div className="p-1">
                {minutes.map((minute) => (
                  <Button
                    key={minute}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full h-8 justify-center font-normal text-sm",
                      selectedMinute === minute && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                    )}
                    onClick={() => handleTimeSelect(selectedHour ?? 9, minute)}
                  >
                    {minute.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
