import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, MapPin, Monitor, User, Phone, Mail, MoreHorizontal, Search, ChevronLeft, ChevronRight } from 'lucide-react'
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
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [candidateSearch, setCandidateSearch] = useState<string>('')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, candidateSearch])

  // Filter slots based on status and candidate search
  const filteredSlots = useMemo(() => {
    return slots.filter(slot => {
      // Status filter
      if (statusFilter !== 'all' && slot.status !== statusFilter) return false
      
      // Candidate search
      if (candidateSearch) {
        const searchTerm = candidateSearch.toLowerCase()
        const candidateName = slot.assignment?.candidate_name?.toLowerCase() || ''
        const candidateEmail = slot.assignment?.candidate_email?.toLowerCase() || ''
        if (!candidateName.includes(searchTerm) && !candidateEmail.includes(searchTerm)) {
          return false
        }
      }
      
      return true
    })
  }, [slots, statusFilter, candidateSearch])

  // Pagination calculations
  const totalPages = Math.ceil(filteredSlots.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedSlots = filteredSlots.slice(startIndex, endIndex)

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Interview Slots ({filteredSlots.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-64 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by candidate name or email"
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Table */}
          {filteredSlots.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">No interview slots found</div>
            </div>
          ) : (
            <>
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
                    {paginatedSlots.map((slot) => (
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredSlots.length)} of {filteredSlots.length} slots
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="hidden sm:flex items-center gap-1">
                      {getPageNumbers().map((page, index) => (
                        typeof page === 'number' ? (
                          <Button
                            key={index}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-9"
                          >
                            {page}
                          </Button>
                        ) : (
                          <span key={index} className="px-2 text-muted-foreground">...</span>
                        )
                      ))}
                    </div>
                    <span className="sm:hidden text-sm text-muted-foreground px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
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