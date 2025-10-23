import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, AlertTriangle, CheckCircle, Globe, Users, Building } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { JDApproval, ApprovalStatus } from '@/types/approvals';
import { approvalsService } from '@/services/approvalsService';
import { toast } from '@/hooks/use-toast';

interface PublishingTabProps {
  jdId: string;
}

export function PublishingTab({ jdId }: PublishingTabProps) {
  const [approval, setApproval] = useState<JDApproval | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  const [publishingData, setPublishingData] = useState({
    channels: {
      internal: false,
      external: false,
      vendor: false
    },
    visibility: 'public',
    start_date: undefined as Date | undefined,
    close_date: undefined as Date | undefined,
    primary_recruiter: '',
    collaborators: [] as string[]
  });

  useEffect(() => {
    loadApprovalStatus();
  }, [jdId]);

  const loadApprovalStatus = async () => {
    try {
      setLoading(true);
      const approvalData = await approvalsService.getJDApproval(jdId);
      setApproval(approvalData);
    } catch (error) {
      console.error('Error loading approval status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      draft: { color: 'secondary', label: 'Draft' },
      Draft: { color: 'secondary', label: 'Draft' },
      submitted: { color: 'warning', label: 'Submitted' },
      Active: { color: 'default', label: 'Active' },
      approved: { color: 'default', label: 'Approved' },
      rejected: { color: 'destructive', label: 'Rejected' },
      on_hold: { color: 'secondary', label: 'On Hold' },
      'On Hold': { color: 'secondary', label: 'On Hold' },
      changes_requested: { color: 'warning', label: 'Changes Requested' },
      Closed: { color: 'default', label: 'Closed' },
      Cancelled: { color: 'destructive', label: 'Cancelled' },
      'Target Date Expired': { color: 'warning', label: 'Target Date Expired' }
    };

    const config = statusConfig[status] || { color: 'secondary', label: status };
    return (
      <Badge variant={config.color as any}>
        {config.label}
      </Badge>
    );
  };

  const isApproved = approval?.status === 'approved';
  const canPublish = isApproved || showOverrideDialog;

  const handlePublish = async () => {
    try {
      setPublishing(true);
      
      // In a real implementation, this would call a publishing service
      console.log('Publishing JD with data:', publishingData);
      
      toast({
        title: "Success",
        description: "JD published successfully"
      });
    } catch (error) {
      console.error('Error publishing JD:', error);
      toast({
        title: "Error",
        description: "Failed to publish JD",
        variant: "destructive"
      });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading approval status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Approval Status Banner */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Publishing Status
              {approval && getStatusBadge(approval.status)}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {!isApproved && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This JD requires approval before it can be published. 
                {!approval && " Please submit for approval first."}
                {approval && approval.status === 'draft' && " Please submit for approval first."}
                {approval && approval.status === 'submitted' && " Approval is pending."}
                {approval && approval.status === 'rejected' && " This JD has been rejected."}
                {approval && approval.status === 'changes_requested' && " Changes have been requested."}
                {approval && approval.status === 'on_hold' && " This JD is on hold."}
              </AlertDescription>
            </Alert>
          )}
          
          {isApproved && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-700">
                This JD has been approved and is ready for publishing.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Publishing Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <Label htmlFor="internal">Internal Job Board</Label>
              </div>
              <Switch
                id="internal"
                checked={publishingData.channels.internal}
                onCheckedChange={(checked) => 
                  setPublishingData({
                    ...publishingData,
                    channels: { ...publishingData.channels, internal: checked }
                  })
                }
                disabled={!canPublish}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <Label htmlFor="external">External Job Board</Label>
              </div>
              <Switch
                id="external"
                checked={publishingData.channels.external}
                onCheckedChange={(checked) => 
                  setPublishingData({
                    ...publishingData,
                    channels: { ...publishingData.channels, external: checked }
                  })
                }
                disabled={!canPublish}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <Label htmlFor="vendor">Vendor Portal</Label>
              </div>
              <Switch
                id="vendor"
                checked={publishingData.channels.vendor}
                onCheckedChange={(checked) => 
                  setPublishingData({
                    ...publishingData,
                    channels: { ...publishingData.channels, vendor: checked }
                  })
                }
                disabled={!canPublish}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select
                value={publishingData.visibility}
                onValueChange={(value) => 
                  setPublishingData({ ...publishingData, visibility: value })
                }
                disabled={!canPublish}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="internal_only">Internal Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Primary Recruiter</Label>
              <Select
                value={publishingData.primary_recruiter}
                onValueChange={(value) => 
                  setPublishingData({ ...publishingData, primary_recruiter: value })
                }
                disabled={!canPublish}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select primary recruiter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recruiter1">John Doe</SelectItem>
                  <SelectItem value="recruiter2">Jane Smith</SelectItem>
                  <SelectItem value="recruiter3">Mike Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !publishingData.start_date && "text-muted-foreground"
                    )}
                    disabled={!canPublish}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {publishingData.start_date ? format(publishingData.start_date, "PPP") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={publishingData.start_date}
                    onSelect={(date) => setPublishingData({ ...publishingData, start_date: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Close Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !publishingData.close_date && "text-muted-foreground"
                    )}
                    disabled={!canPublish}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {publishingData.close_date ? format(publishingData.close_date, "PPP") : "Pick close date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={publishingData.close_date}
                    onSelect={(date) => setPublishingData({ ...publishingData, close_date: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-between items-center">
            {!isApproved && (
              <Button
                variant="outline"
                onClick={() => setShowOverrideDialog(!showOverrideDialog)}
                className="text-orange-600 border-orange-600 hover:bg-orange-50"
              >
                Manager Override
              </Button>
            )}
            
            <div className="flex gap-2 ml-auto">
              <Button
                onClick={handlePublish}
                disabled={!canPublish || publishing}
                className="flex items-center gap-2"
              >
                {publishing ? 'Publishing...' : 'Publish JD'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manager Override Section */}
      {showOverrideDialog && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800">Manager Override</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Publishing without approval requires manager override with justification. This action will be audited.
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 space-y-2">
              <Label htmlFor="override_reason">Override Reason *</Label>
              <textarea
                id="override_reason"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full p-2 border border-input rounded-md"
                rows={3}
                placeholder="Enter reason for override..."
                required
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}