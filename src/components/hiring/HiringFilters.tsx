import { useState } from 'react'
import { Filter, Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import type { HiringFilters } from '@/types/hiring'

interface HiringFiltersProps {
  filters: HiringFilters
  onFiltersChange: (filters: HiringFilters) => void
  onExport: (type: 'csv' | 'excel' | 'pdf') => void
  onRefresh: () => void
  loading?: boolean
}

export function HiringFilters({ 
  filters, 
  onFiltersChange, 
  onExport, 
  onRefresh, 
  loading = false 
}: HiringFiltersProps) {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  const handleFilterChange = (key: keyof HiringFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    })
  }

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range)
    if (range.from && range.to) {
      onFiltersChange({
        ...filters,
        dateRange: {
          start: range.from.toISOString(),
          end: range.to.toISOString()
        }
      })
    } else {
      const { dateRange: _, ...filtersWithoutDate } = filters
      onFiltersChange(filtersWithoutDate)
    }
  }

  const clearFilters = () => {
    onFiltersChange({})
    setDateRange({})
  }

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="h-4 w-4" />
          Filters:
        </div>
        
        <Select value={filters.client || ''} onValueChange={(value) => handleFilterChange('client', value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            <SelectItem value="TechCorp Inc">TechCorp Inc</SelectItem>
            <SelectItem value="DataSoft">DataSoft</SelectItem>
            <SelectItem value="CloudWorks">CloudWorks</SelectItem>
            <SelectItem value="InnovateLab">InnovateLab</SelectItem>
            <SelectItem value="ScaleTech">ScaleTech</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.recruiter || ''} onValueChange={(value) => handleFilterChange('recruiter', value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Recruiter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Recruiters</SelectItem>
            <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
            <SelectItem value="Mike Chen">Mike Chen</SelectItem>
            <SelectItem value="Emily Davis">Emily Davis</SelectItem>
            <SelectItem value="David Wilson">David Wilson</SelectItem>
            <SelectItem value="Lisa Anderson">Lisa Anderson</SelectItem>
          </SelectContent>
        </Select>

        <Input 
          placeholder="JD ID" 
          value={filters.jdId || ''} 
          onChange={(e) => handleFilterChange('jdId', e.target.value)}
          className="w-[120px]"
        />

        <Select value={filters.skill || ''} onValueChange={(value) => handleFilterChange('skill', value)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select Skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Skills</SelectItem>
            <SelectItem value="React Developer">React Developer</SelectItem>
            <SelectItem value="Java Backend">Java Backend</SelectItem>
            <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
            <SelectItem value="Data Scientist">Data Scientist</SelectItem>
            <SelectItem value="Product Manager">Product Manager</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="interviewed">Interviewed</SelectItem>
            <SelectItem value="offered">Offered</SelectItem>
            <SelectItem value="joined">Joined</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start">
              {dateRange.from ? (
                dateRange.to ? (
                  `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                ) : (
                  format(dateRange.from, 'MMM dd, yyyy')
                )
              ) : (
                'Select Date Range'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('excel')}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('pdf')}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  )
}