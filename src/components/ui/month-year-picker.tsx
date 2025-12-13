import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

interface MonthYearPickerProps {
  value?: string // Format: YYYY-MM
  onChange: (value: string) => void
  fromYear?: number
  toYear?: number
  placeholder?: string
  className?: string
}

export function MonthYearPicker({
  value,
  onChange,
  fromYear = 1980,
  toYear = new Date().getFullYear() + 5,
  placeholder = 'Select month & year',
  className
}: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false)

  const currentYear = value ? value.split('-')[0] : ''
  const currentMonth = value ? value.split('-')[1] : ''

  const years = React.useMemo(() => {
    const result = []
    for (let year = toYear; year >= fromYear; year--) {
      result.push(year.toString())
    }
    return result
  }, [fromYear, toYear])

  const handleMonthChange = (month: string) => {
    const year = currentYear || new Date().getFullYear().toString()
    onChange(`${year}-${month}`)
  }

  const handleYearChange = (year: string) => {
    const month = currentMonth || '01'
    onChange(`${year}-${month}`)
  }

  const formatDisplay = (val: string) => {
    if (!val) return null
    const [year, month] = val.split('-')
    const monthName = MONTHS.find(m => m.value === month)?.label || ''
    return `${monthName} ${year}`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? formatDisplay(value) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 pointer-events-auto" align="start">
        <div className="flex gap-2">
          <Select value={currentMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={currentYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}
