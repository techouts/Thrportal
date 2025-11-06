import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ClientSpocMappingService } from '@/services/clientSpocMappingService';
import { ClientSpocMapping } from '@/types/ownership';

const schema = z.object({
  primarySpocId: z.string().min(1, 'Primary SPOC is required'),
  secondarySpocId: z.string().optional(),
  assignedRecruiterIds: z.array(z.string()).default([]),
}).refine((data) => {
  // Validation: Primary and Secondary SPOC cannot be the same (ignore "NONE")
  if (data.secondarySpocId && data.secondarySpocId !== 'NONE' && data.primarySpocId === data.secondarySpocId) {
    return false;
  }
  return true;
}, {
  message: "Primary SPOC and Secondary SPOC cannot be the same person",
  path: ["secondarySpocId"],
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  mapping: ClientSpocMapping;
}

export function EditClientSpocMappingDialog({ open, onOpenChange, onSuccess, mapping }: Props) {
  const [loading, setLoading] = useState(false);
  const [spocs, setSpocs] = useState<any[]>([]);
  const [recruiters, setRecruiters] = useState<any[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      primarySpocId: '',
      secondarySpocId: '',
      assignedRecruiterIds: [],
    },
  });

  useEffect(() => {
    if (open && mapping) {
      form.reset({
        primarySpocId: mapping.primarySpocId,
        secondarySpocId: mapping.secondarySpocId || 'NONE',
        assignedRecruiterIds: mapping.assignedRecruiterIds || [],
      });
      loadData();
    }
  }, [open, mapping]);

  const loadData = async () => {
    try {
      // Load SPOCs (users with RECRUITER, HIRING_MANAGER, STAFFING_MANAGER roles)
      const spocsData = await ClientSpocMappingService.getUsersByRoles([
        'RECRUITER',
        'HIRING_MANAGER',
        'STAFFING_MANAGER',
      ]);
      setSpocs(spocsData);

      // Load all recruiters
      const recruitersData = await ClientSpocMappingService.getAllRecruiters();
      setRecruiters(recruitersData);

      // Show warnings if no data found
      if (spocsData.length === 0) {
        toast.warning('No SPOCs found. Make sure users have proper roles assigned.');
      }
      if (recruitersData.length === 0) {
        toast.warning('No recruiters found. Make sure users have proper roles assigned.');
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error(`Failed to load form data: ${error.message || 'Unknown error'}`);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await ClientSpocMappingService.updateMapping(mapping.id, {
        primarySpocId: data.primarySpocId,
        secondarySpocId: data.secondarySpocId === 'NONE' ? undefined : data.secondarySpocId,
        assignedRecruiterIds: data.assignedRecruiterIds,
      });
      toast.success('Client SPOC mapping updated successfully');
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Failed to update mapping:', error);
      toast.error('Failed to update mapping');
    } finally {
      setLoading(false);
    }
  };

  const formatUserName = (user: any) => {
    return user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Client SPOC Mapping</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Client Name - Display Only */}
            <div>
              <label className="text-sm font-medium">Client</label>
              <div className="mt-1 p-2 bg-muted rounded-md text-sm">
                {mapping.clientName}
              </div>
            </div>

            {/* Primary SPOC */}
            <FormField
              control={form.control}
              name="primarySpocId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary SPOC *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary SPOC" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {spocs.map((spoc) => (
                        <SelectItem key={spoc.id} value={spoc.id}>
                          {formatUserName(spoc)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Secondary SPOC */}
            <FormField
              control={form.control}
              name="secondarySpocId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary SPOC (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select secondary SPOC (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NONE">None</SelectItem>
                      {spocs.map((spoc) => (
                        <SelectItem key={spoc.id} value={spoc.id}>
                          {formatUserName(spoc)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assigned Recruiters - Multi-select */}
            <FormField
              control={form.control}
              name="assignedRecruiterIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Recruiters</FormLabel>
                  <FormControl>
                    <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                      {recruiters.map((recruiter) => (
                        <label key={recruiter.id} className="flex items-center gap-2 p-1 hover:bg-muted rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.value?.includes(recruiter.id)}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...(field.value || []), recruiter.id]
                                : (field.value || []).filter(id => id !== recruiter.id);
                              field.onChange(updated);
                            }}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">{formatUserName(recruiter)}</span>
                        </label>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Mapping'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
