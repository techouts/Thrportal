import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Clock, MapPin, Monitor, User, Phone, Mail, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AssignCandidateDialog } from './AssignCandidateDialog'
import { UpdateSlotStatusDialog } from './UpdateSlotStatusDialog'
import { schedulingService } from '@/services/schedulingService'
import type { InterviewSlot } from '@/types/scheduling'

interface SlotsListProps {
  slots: InterviewSlot[]
  loading: boolean
  onSlotUpdated: () => void
}

export function SlotsList({ slots, loading, onSlotUpdated }: SlotsListProps) {
  const [selectedSlot, setSelectedSlot] = useState<InterviewSlot | null>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)

  // Auto-expire slots on mount
  useEffect(() => {
    const expireSlots = async () => {
      try {
        await schedulingService.autoExpireSlots()
        onSlotUpdated()
      } catch (error) {
        console.error('Error auto-expiring slots:', error)
      }
    }
    expireSlots()
  }, [])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      available: 'default',
      booked: 'secondary',
      expired: 'outline',
      cancelled: 'destructive'
    }

    const labels: Record<string, string> = {
      available: 'Available',
      booked: 'Booked',
      expired: 'Expired',
      cancelled: 'Cancelled'
    }

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    )
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleAssignCandidate = (slot: InterviewSlot) => {
    setSelectedSlot(slot)
    setShowAssignDialog(true)
  }

  const handleChangeStatus = (slot: InterviewSlot) => {
    setSelectedSlot(slot)
    setShowStatusDialog(true)
  }

  const handleDialogClose = () => {
    setSelectedSlot(null)
    setShowAssignDialog(false)
    setShowStatusDialog(false)
    onSlotUpdated()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading slots...</div>
        </CardContent>
      </Card>
    )
  }

  if (slots.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">No interview slots found</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Interview Slots ({slots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Client & Project</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Panel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot) => (
                  <TableRow key={slot.id}>
                    {/* Date & Time */}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{formatDate(slot.date)}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(slot.from_time)} - {formatTime(slot.to_time)}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Client & Project */}
                    <TableCell>
                      <div>
                        <div className="font-medium">{slot.client_name || 'Unknown Client'}</div>
                        <div className="text-sm text-muted-foreground">
                          {slot.project_name || 'Unknown Project'}
                        </div>
                      </div>
                    </TableCell>

                    {/* Mode */}
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {slot.mode === 'virtual' ? (
                          <Monitor className="h-4 w-4 text-blue-500" />
                        ) : (
                          <MapPin className="h-4 w-4 text-green-500" />
                        )}
                        <span className="capitalize">{slot.mode}</span>
                      </div>
                    </TableCell>

                    {/* Panel */}
                    <TableCell>
                      <div className="text-sm">
                        {slot.panel_text || slot.assignment?.panel_text || '-'}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {getStatusBadge(slot.status)}
                    </TableCell>

                    {/* Candidate */}
                    <TableCell>
                      {slot.assignment ? (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {slot.assignment.candidate_name}
                            </span>
                          </div>
                          {slot.assignment.candidate_email && (
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {slot.assignment.candidate_email}
                              </span>
                            </div>
                          )}
                          {slot.assignment.candidate_phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {slot.assignment.candidate_phone}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Unassigned</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {slot.status === 'available' && (
                            <DropdownMenuItem onClick={() => handleAssignCandidate(slot)}>
                              Assign Candidate
                            </DropdownMenuItem>
                          )}
                          {slot.status === 'booked' && (
                            <DropdownMenuItem onClick={() => handleAssignCandidate(slot)}>
                              Change Candidate
                            </DropdownMenuItem>
                          )}
                          {(slot.status === 'available' || slot.status === 'booked') && (
                            <DropdownMenuItem onClick={() => handleChangeStatus(slot)}>
                              Change Status
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedSlot && (
        <>
          <AssignCandidateDialog
            open={showAssignDialog}
            onOpenChange={setShowAssignDialog}
            slot={selectedSlot}
            onAssigned={handleDialogClose}
          />
          <UpdateSlotStatusDialog
            open={showStatusDialog}
            onOpenChange={setShowStatusDialog}
            slot={selectedSlot}
            onUpdated={handleDialogClose}
          />
        </>
      )}
    </>
  )
}
