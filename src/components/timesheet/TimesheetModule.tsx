import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useIsMobile } from '@/hooks/use-mobile'
import { TimesheetFill } from './TimesheetFill'
import { TimesheetHistory } from './TimesheetHistory'
import { ClientExports } from './ClientExports'

interface TimesheetModuleProps {
  employeeId: string
  defaultTab?: string
}

const tabOptions = [
  { value: 'Fill', label: 'All Timesheets' },
  { value: 'History', label: 'Past Due' },
  { value: 'Client Exports', label: 'Client Exports' }
]

export function TimesheetModule({ employeeId, defaultTab = 'Fill' }: TimesheetModuleProps) {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      {/* Mobile: Dropdown, Desktop: Tabs */}
      {isMobile ? (
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            {tabOptions.map(tab => (
              <SelectItem key={tab.value} value={tab.value}>{tab.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="Fill">All TimeSheets</TabsTrigger>
          <TabsTrigger value="History">Past Due Timesheets</TabsTrigger>
          <TabsTrigger value="Client Exports">Client Exports</TabsTrigger>
        </TabsList>
      )}
      
      <TabsContent value="Fill" className="space-y-6">
        <TimesheetFill employeeId={employeeId} />
      </TabsContent>
      
      <TabsContent value="History" className="space-y-6">
        <TimesheetHistory employeeId={employeeId} />
      </TabsContent>
      
      <TabsContent value="Client Exports" className="space-y-6">
        <ClientExports employeeId={employeeId} />
      </TabsContent>
    </Tabs>
  )
}