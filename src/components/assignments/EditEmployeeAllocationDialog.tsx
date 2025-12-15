import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { EmployeeAllocation } from "@/services/allocationService";

interface EditEmployeeAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allocation: EmployeeAllocation | null;
  onSuccess: () => void;
}

export function EditEmployeeAllocationDialog({
  open,
  onOpenChange,
  allocation,
  onSuccess,
}: EditEmployeeAllocationDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<string>("ACTIVE");
  const [allocationPct, setAllocationPct] = useState<number>(100);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Reset form when allocation changes
  useEffect(() => {
    if (allocation) {
      setType(allocation.type || "ACTIVE");
      setAllocationPct(allocation.allocationPct);
      setStartDate(allocation.startDate ? new Date(allocation.startDate) : undefined);
      setEndDate(allocation.endDate ? new Date(allocation.endDate) : undefined);
    }
  }, [allocation]);

  const handleSave = async () => {
    if (!allocation || !startDate || !endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (endDate <= startDate) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("allocations")
        .update({
          type,
          allocation_pct: allocationPct,
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          updated_at: new Date().toISOString(),
        })
        .eq("id", allocation.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Allocation updated successfully.",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating allocation:", error);
      toast({
        title: "Error",
        description: "Failed to update allocation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!allocation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Allocation</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Project Name - Read Only */}
          <div className="grid gap-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={allocation.projectName}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Client Name - Read Only */}
          <div className="grid gap-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={allocation.clientName}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Type */}
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SHADOW">Shadow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Allocation Percentage */}
          <div className="grid gap-2">
            <div className="flex justify-between">
              <Label>Allocation Percentage</Label>
              <span className="text-sm font-medium">{allocationPct}%</span>
            </div>
            <Slider
              value={[allocationPct]}
              onValueChange={(value) => setAllocationPct(value[0])}
              max={150}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Drag the slider to adjust (0-150%)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
