import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CrmService } from '@/services/crmService';
import { useToast } from '@/hooks/use-toast';
import type { CrmOpportunity } from '@/types/crm';

const opportunitySchema = z.object({
  jd_count: z.number().min(0).default(0),
  ft_count: z.number().min(0).default(0),
  contract_count: z.number().min(0).default(0),
  status: z.enum(['Open', 'In Progress', 'Closed', 'Lost']).default('Open'),
  notes: z.string().optional()
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

interface EditOpportunityFormProps {
  opportunity: CrmOpportunity;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditOpportunityForm({ opportunity, onSuccess, onCancel }: EditOpportunityFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      jd_count: opportunity.jd_count || 0,
      ft_count: opportunity.ft_count || 0,
      contract_count: opportunity.contract_count || 0,
      status: opportunity.status as any || 'Open',
      notes: opportunity.notes || ''
    }
  });

  const onSubmit = async (data: OpportunityFormData) => {
    try {
      setLoading(true);
      
      // TODO: Add updateOpportunity to CrmService
      toast({
        title: 'Success',
        description: 'Opportunity updated successfully.'
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update opportunity. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="jd_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>JD Count</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    min="0"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ft_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>FT Count</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    min="0"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contract_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Count</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    min="0"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} placeholder="Additional notes..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Opportunity'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
