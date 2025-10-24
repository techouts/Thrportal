import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { Mail, MoreVertical, Edit, ArrowUpDown } from "lucide-react";
import { JDService, type JDOverviewItem, type JDFilters } from "@/services/jdService";
import { format } from "date-fns";

export function DraftsJDTab() {
  const { toast } = useToast();
  const [jds, setJds] = useState<JDOverviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingJD, setEditingJD] = useState<JDOverviewItem | null>(null);
  const [editForm, setEditForm] = useState<Partial<JDOverviewItem>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  const [filters, setFilters] = useState<JDFilters>({
    status: 'all',
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    loadJDs();
  }, [filters]);

  const loadJDs = async () => {
    setIsLoading(true);
    try {
      const response = await JDService.getJDs(filters);
      if (response.success) {
        setJds(response.data);
        setPagination(response.pagination);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to load JDs",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load JDs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (column: 'created_at' | 'client_name') => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? jds.map(jd => jd.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => 
      checked ? [...prev, id] : prev.filter(i => i !== id)
    );
  };

  const handleEmail = (jd: JDOverviewItem) => {
    const salaryRange = `${jd.currency} ${jd.salary_band_min?.toLocaleString() || 'N/A'} - ${jd.salary_band_max?.toLocaleString() || 'N/A'}`;
    const subject = `Job Description: ${jd.project_name || 'Untitled'}`;
    const body = `Job Title: ${jd.project_name || 'Untitled'}
Client: ${jd.client_name || 'N/A'}
Openings: ${jd.headcount || 'N/A'}
Salary Range: ${salaryRange}
Status: ${jd.status}

View full details here:
${window.location.origin}/Hiring/JDs?id=${jd.id}`;

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleBulkEmail = () => {
    const selectedJDs = jds.filter(jd => selectedIds.includes(jd.id));
    const body = `Selected Job Descriptions:\n\n${selectedJDs.map((jd, idx) => {
      const salaryRange = `${jd.currency} ${jd.salary_band_min?.toLocaleString() || 'N/A'} - ${jd.salary_band_max?.toLocaleString() || 'N/A'}`;
      return `${idx + 1}. ${jd.project_name || 'Untitled'} - ${jd.client_name || 'N/A'} - ${jd.headcount || 'N/A'} openings - ${salaryRange}
   Link: ${window.location.origin}/Hiring/JDs?id=${jd.id}`;
    }).join('\n\n')}

View all JDs: ${window.location.origin}/Hiring/JDs`;

    window.location.href = `mailto:?subject=${encodeURIComponent('Selected Job Descriptions')}&body=${encodeURIComponent(body)}`;
  };

  const handleEdit = (jd: JDOverviewItem) => {
    setEditingJD(jd);
    setEditForm({
      project_name: jd.project_name,
      client_name: jd.client_name,
      headcount: jd.headcount,
      salary_band_min: jd.salary_band_min,
      salary_band_max: jd.salary_band_max,
      currency: jd.currency,
      cost_center: jd.cost_center,
      business_justification: jd.business_justification,
    });
  };

  const handleSave = async () => {
    if (!editingJD) return;
    
    setIsSaving(true);
    try {
      const response = await JDService.updateJD(editingJD.id, editForm);
      if (response.success) {
        toast({
          title: "Success",
          description: "JD updated successfully",
        });
        setEditingJD(null);
        loadJDs();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update JD",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update JD",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      Draft: "secondary",
      pending: "default",
      Active: "default",
      approved: "default",
      rejected: "destructive",
      Closed: "outline",
      'On Hold': "secondary",
      Cancelled: "destructive",
      'Target Date Expired': "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job descriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Job descriptions</CardTitle>
            <Select
              value={filters.status}
              onValueChange={(value: any) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All JDs</SelectItem>
                <SelectItem value="active">Active JDs</SelectItem>
                <SelectItem value="inactive">Inactive JDs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedIds.length > 0 && (
            <div className="bg-primary/10 p-4 rounded-lg flex justify-between items-center mb-4">
              <span className="text-sm font-medium">{selectedIds.length} JDs selected</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkEmail}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          {jds.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No job descriptions found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.length === jds.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>JD ID</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Positions</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => handleSort('created_at')}>
                        Created
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jds.map((jd) => (
                    <TableRow key={jd.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(jd.id)}
                          onCheckedChange={(checked) => handleSelectOne(jd.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{jd.jd_id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{jd.job_title || jd.project_name || 'Untitled'}</div>
                        {jd.short_summary && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-xs">{jd.short_summary}</div>
                        )}
                      </TableCell>
                      <TableCell>{jd.department || 'N/A'}</TableCell>
                      <TableCell>{jd.positions || jd.headcount || 'N/A'}</TableCell>
                      <TableCell>
                        {jd.experience_min && jd.experience_max
                          ? `${jd.experience_min}-${jd.experience_max} yrs`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {jd.priority ? (
                          <Badge variant={jd.priority === 'Critical' ? 'destructive' : jd.priority === 'High' ? 'default' : 'secondary'}>
                            {jd.priority}
                          </Badge>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>{getStatusBadge(jd.status)}</TableCell>
                      <TableCell>{format(new Date(jd.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(jd)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEmail(jd)}>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {((filters.page - 1) * filters.limit) + 1}-{Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total} JDs
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                        className={!pagination.hasPrev ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
                            isActive={filters.page === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                        className={!pagination.hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!editingJD} onOpenChange={(open) => !open && setEditingJD(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Job Description</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="project_name">Job Title</Label>
              <Input
                id="project_name"
                value={editForm.project_name || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, project_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="client_name">Client Name</Label>
              <Input
                id="client_name"
                value={editForm.client_name || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, client_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="headcount">Openings</Label>
              <Input
                id="headcount"
                type="number"
                value={editForm.headcount || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, headcount: parseInt(e.target.value) }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salary_min">Salary Min</Label>
                <Input
                  id="salary_min"
                  type="number"
                  value={editForm.salary_band_min || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, salary_band_min: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="salary_max">Salary Max</Label>
                <Input
                  id="salary_max"
                  type="number"
                  value={editForm.salary_band_max || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, salary_band_max: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={editForm.currency || 'USD'}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cost_center">Cost Center</Label>
              <Input
                id="cost_center"
                value={editForm.cost_center || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, cost_center: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="business_justification">Business Justification</Label>
              <Textarea
                id="business_justification"
                value={editForm.business_justification || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, business_justification: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setEditingJD(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}