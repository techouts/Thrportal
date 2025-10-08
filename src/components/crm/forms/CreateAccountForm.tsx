import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CrmService } from '@/services/crmService';
import { useToast } from '@/hooks/use-toast';
import type { CrmSpoc } from '@/types/crm';

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  type: z.string().optional(),
  sla_override: z.string().optional(),
  primary_spoc_id: z.string().optional()
});

type AccountFormData = z.infer<typeof accountSchema>;

interface CreateAccountFormProps {
  clientId: string;
  spocs: CrmSpoc[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateAccountForm({ clientId, spocs, onSuccess, onCancel }: CreateAccountFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: '',
      sla_override: '',
      primary_spoc_id: ''
    }
  });

  const onSubmit = async (data: AccountFormData) => {
    try {
      setLoading(true);
      
      await CrmService.createAccount({
        name: data.name,
        type: data.type,
        sla_override: data.sla_override,
        client_id: clientId,
        primary_spoc_id: data.primary_spoc_id || undefined
      });
      
      toast({
        title: 'Success',
        description: 'Account created successfully.'
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create account. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const accountTypes = ['Department', 'Business Unit', 'Geography', 'Division', 'Subsidiary'];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. IT Department, US Operations" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accountTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="primary_spoc_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary SPOC</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary SPOC" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No primary SPOC</SelectItem>
                  {spocs.map(spoc => (
                    <SelectItem key={spoc.id} value={spoc.id}>
                      {spoc.name} {spoc.role && `- ${spoc.role}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sla_override"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SLA Override</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Custom SLA for this account" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !form.formState.isValid}>
            {loading ? 'Creating...' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Form>
  );
}