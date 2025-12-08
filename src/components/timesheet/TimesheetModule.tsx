import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TimesheetFill } from './TimesheetFill'
import { TimesheetHistory } from './TimesheetHistory'
import { ClientExports } from './ClientExports'

interface TimesheetModuleProps {
  employeeId: string
  defaultTab?: string
}

export function TimesheetModule({ employeeId, defaultTab = 'Fill' }: TimesheetModuleProps) {
  return (
    <Tabs defaultValue={defaultTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="Fill">All TimeSheets</TabsTrigger>
        <TabsTrigger value="History">Past Due Timesheets</TabsTrigger>
        <TabsTrigger value="Client Exports">Client Exports</TabsTrigger>
      </TabsList>
      
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