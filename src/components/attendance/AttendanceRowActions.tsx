import { MoreHorizontal, FileEdit, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface AttendanceRowActionsProps {
  onRegularize: () => void;
  onRequestLeave: () => void;
}

export function AttendanceRowActions({ onRegularize, onRequestLeave }: AttendanceRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onRegularize} className="cursor-pointer">
          <FileEdit className="mr-2 h-4 w-4" />
          Regularize Attendance
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onRequestLeave} className="cursor-pointer">
          <Calendar className="mr-2 h-4 w-4" />
          Request Leave
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
