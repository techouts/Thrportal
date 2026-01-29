import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  ChevronsUpDown,
  Check,
  Download,
  Calendar as CalendarIcon,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { allocationService, ProjectOption } from "@/services/allocationService";
import { TimesheetService } from "@/services/timesheetService";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export function TimesheetReports() {
  const timesheetService = TimesheetService.getInstance();
  // Project selection state
  const [projectOpen, setProjectOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(
    null
  );

  // Period selection state
  const [periodMode, setPeriodMode] = useState<"month" | "range">("month");
  const [selectedMonth, setSelectedMonth] = useState<string>(""); // YYYY-MM format
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  // Date range popover states
  const [fromPopoverOpen, setFromPopoverOpen] = useState(false);
  const [toPopoverOpen, setToPopoverOpen] = useState(false);
  const [toCalendarMonth, setToCalendarMonth] = useState<Date | undefined>();

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  // Debounced project search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setProjectOptions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await allocationService.searchProjects(searchQuery);
        setProjectOptions(results);
      } catch (error) {
        console.error("Error searching projects:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Calculate date range based on mode
  const dateRange = useMemo(() => {
    if (periodMode === "month" && selectedMonth) {
      const monthDate = parseISO(`${selectedMonth}-01`);
      return {
        startDate: format(startOfMonth(monthDate), "yyyy-MM-dd"),
        endDate: format(endOfMonth(monthDate), "yyyy-MM-dd"),
      };
    }
    if (periodMode === "range" && fromDate && toDate) {
      return {
        startDate: format(fromDate, "yyyy-MM-dd"),
        endDate: format(toDate, "yyyy-MM-dd"),
      };
    }
    return null;
  }, [periodMode, selectedMonth, fromDate, toDate]);

  // Validation
  const canExport = selectedProject && dateRange !== null;
  const hasDateError =
    periodMode === "range" && fromDate && toDate && fromDate > toDate;

  // Handler for "From" date selection - auto-opens "To" picker
  const handleFromDateSelect = (date: Date | undefined) => {
    setFromDate(date);
    setFromPopoverOpen(false);
    if (date) {
      // Set the "To" calendar to show the same month as "From" date
      setToCalendarMonth(date);
      // Auto-open "To" popover after a small delay
      setTimeout(() => setToPopoverOpen(true), 100);
    }
  };

  const handleExport = async () => {
    if (!selectedProject || !dateRange) return;

    setShowExportConfirm(false);
    setIsExporting(true);
    try {
      const data = await timesheetService.getProjectTimesheetReport(
        selectedProject.id,
        dateRange.startDate,
        dateRange.endDate
      );

      if (data.length === 0) {
        toast.info(
          "No timesheet entries found for the selected project and period"
        );
        return;
      }

      // Prepare Excel data
      const excelData = data.map((row) => ({
        "Employee Name": row.employeeName,
        "Employee Code": row.employeeCode || "",
        Date: row.date,
        Task: row.taskName,
        Hours: row.hours,
        Comment: row.comment || "",
        Billable: row.isBillable ? "Yes" : "No",
        Status: row.status,
      }));

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheet Report");

      // Auto-size columns
      const colWidths = [
        { wch: 20 }, // Employee Name
        { wch: 15 }, // Employee Code
        { wch: 12 }, // Date
        { wch: 25 }, // Task
        { wch: 8 }, // Hours
        { wch: 40 }, // Comment
        { wch: 10 }, // Billable
        { wch: 12 }, // Status
      ];
      worksheet["!cols"] = colWidths;

      // Generate filename
      const projectName = selectedProject.name.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `Timesheet_Report_${projectName}_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, filename);
      toast.success(`Exported ${data.length} entries to ${filename}`);
    } catch (error) {
      console.error("Error exporting timesheet report:", error);
      toast.error("Failed to export timesheet report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Timesheet Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Selection */}
        <div className="space-y-2">
          <Label htmlFor="project">Project *</Label>
          <Popover open={projectOpen} onOpenChange={setProjectOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={projectOpen}
                className="w-full justify-between"
              >
                {selectedProject ? (
                  <span className="truncate">
                    {selectedProject.name} - {selectedProject.clientName}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Search and select a project...
                  </span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[400px] p-0 bg-popover z-50"
              align="start"
            >
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search projects..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  {isSearching ? (
                    <CommandEmpty>Searching...</CommandEmpty>
                  ) : searchQuery.length < 2 ? (
                    <CommandEmpty>
                      Type at least 2 characters to search
                    </CommandEmpty>
                  ) : projectOptions.length === 0 ? (
                    <CommandEmpty>No projects found</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {projectOptions.map((project) => (
                        <CommandItem
                          key={project.id}
                          value={project.id}
                          onSelect={() => {
                            setSelectedProject(project);
                            setProjectOpen(false);
                            setSearchQuery("");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedProject?.id === project.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{project.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {project.clientName} • {project.status}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Period Selection */}
        <div className="space-y-4">
          <Label>Period Selection</Label>
          <RadioGroup
            value={periodMode}
            onValueChange={(value) => setPeriodMode(value as "month" | "range")}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="month" id="period-month" />
              <Label htmlFor="period-month" className="cursor-pointer">
                Month & Year
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="range" id="period-range" />
              <Label htmlFor="period-range" className="cursor-pointer">
                Date Range
              </Label>
            </div>
          </RadioGroup>

          {periodMode === "month" ? (
            <div className="max-w-xs">
              <MonthYearPicker
                value={selectedMonth}
                onChange={setSelectedMonth}
                placeholder="Select month & year"
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <Label>From</Label>
                <Popover
                  open={fromPopoverOpen}
                  onOpenChange={setFromPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate
                        ? format(fromDate, "dd MMM yyyy")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-popover z-50"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={handleFromDateSelect}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>To</Label>
                <Popover open={toPopoverOpen} onOpenChange={setToPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !toDate && "text-muted-foreground",
                        hasDateError && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, "dd MMM yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-popover z-50"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={(date) => {
                        setToDate(date);
                        setToPopoverOpen(false);
                      }}
                      month={toCalendarMonth}
                      onMonthChange={setToCalendarMonth}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          {hasDateError && (
            <p className="text-sm text-destructive">
              To date must be after From date
            </p>
          )}
        </div>

        {/* Export Button */}
        <div className="pt-4">
          <Button
            onClick={() => setShowExportConfirm(true)}
            disabled={!canExport || hasDateError || isExporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          {!selectedProject && (
            <p className="text-sm text-muted-foreground mt-2">
              Select a project to generate report
            </p>
          )}
        </div>

        {/* Export Confirmation Dialog */}
        <AlertDialog
          open={showExportConfirm}
          onOpenChange={setShowExportConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Export</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  You are about to export timesheet data for:
                  <div className="mt-3 p-3 bg-muted rounded-md space-y-1">
                    <p>
                      <strong>Project:</strong> {selectedProject?.name}
                    </p>
                    <p>
                      <strong>Period:</strong>{" "}
                      {dateRange?.startDate &&
                        dateRange?.endDate &&
                        `${format(
                          parseISO(dateRange.startDate),
                          "dd MMM yyyy"
                        )} to ${format(
                          parseISO(dateRange.endDate),
                          "dd MMM yyyy"
                        )}`}
                    </p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleExport}>
                Confirm & Download
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
