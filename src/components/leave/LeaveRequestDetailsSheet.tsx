import { format } from 'date-fns';
import { X, Calendar, Clock, User } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: string;
  requested_by: string | null;
  reason: string | null;
  rejection_reason: string | null;
  approved_at: string | null;
  created_at: string;
}

interface LeaveRequestDetailsSheetProps {
  request: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LEAVE_TYPE_LABELS: Record<string, string> = {
  CL: 'Casual Leave',
  ML: 'Maternity Leave',
  PL_PATERNITY: 'Paternity Leave',
  COMP_OFF: 'Comp Offs',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export function LeaveRequestDetailsSheet({ 
  request, 
  open, 
  onOpenChange 
}: LeaveRequestDetailsSheetProps) {
  if (!request) return null;

  const startDate = new Date(request.start_date);
  const endDate = new Date(request.end_date);
  const createdDate = new Date(request.created_at);
  const isSingleDay = request.start_date === request.end_date;

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg font-semibold">Leave Request Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Requester Card */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(request.requested_by)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{request.requested_by || 'Unknown'}</p>
              <p className="text-sm text-muted-foreground">
                Requested on {format(createdDate, 'dd MMM yyyy, hh:mm a')}
              </p>
            </div>
          </div>

          {/* Date Display Card */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium uppercase">
              {format(startDate, 'MMMM')}
            </div>
            <div className="p-4 text-center">
              <div className="text-4xl font-bold">
                {isSingleDay 
                  ? format(startDate, 'd')
                  : `${format(startDate, 'd')} - ${format(endDate, 'd')}`
                }
              </div>
              <div className="text-muted-foreground mt-1">
                {isSingleDay
                  ? format(startDate, 'EEEE')
                  : `${format(startDate, 'EEE')} - ${format(endDate, 'EEE')}`
                }
              </div>
              <div className="mt-3 flex items-center justify-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{request.total_days} {request.total_days === 1 ? 'Day' : 'Days'} Leave</span>
              </div>
            </div>
          </div>

          {/* Leave Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Leave Type</span>
              <span className="font-medium">
                {LEAVE_TYPE_LABELS[request.leave_type] || request.leave_type}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className={STATUS_COLORS[request.status] || ''}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </Badge>
            </div>
            {request.reason && (
              <>
                <Separator />
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Leave Note</span>
                  <p className="text-sm">{request.reason}</p>
                </div>
              </>
            )}
            {request.rejection_reason && (
              <>
                <Separator />
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">
                    {request.status === 'cancelled' ? 'Cancellation Reason' : 'Rejection Reason'}
                  </span>
                  <p className="text-sm text-destructive">{request.rejection_reason}</p>
                </div>
              </>
            )}
          </div>

          {/* Activity Timeline */}
          <div>
            <h4 className="font-medium mb-3">Activity</h4>
            <div className="space-y-3">
              {/* Request Submitted */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  {(request.approved_at || request.status !== 'pending') && (
                    <div className="w-px h-full bg-border min-h-[20px]" />
                  )}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-medium">Request Submitted</p>
                  <p className="text-xs text-muted-foreground">
                    {format(createdDate, 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              </div>

              {/* Status Update */}
              {request.status !== 'pending' && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      request.status === 'approved' 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : request.status === 'rejected'
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : 'bg-gray-100 dark:bg-gray-900/30'
                    }`}>
                      <User className={`h-4 w-4 ${
                        request.status === 'approved' 
                          ? 'text-green-600' 
                          : request.status === 'rejected'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {request.status === 'approved' && 'Request Approved'}
                      {request.status === 'rejected' && 'Request Rejected'}
                      {request.status === 'cancelled' && 'Request Cancelled'}
                    </p>
                    {request.approved_at && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(request.approved_at), 'dd MMM yyyy, hh:mm a')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
