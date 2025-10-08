import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CrmService } from '@/services/crmService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { CrmClient } from '@/types/crm';

const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  industry: z.string().optional(),
  region: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Prospect']).default('Active'),
  contract_type: z.string().optional(),
  sla_reference_url: z.string().optional(),
  domain: z.string().optional(),
  gst_vat: z.string().optional()
});

type ClientFormData = z.infer<typeof clientSchema>;

interface CreateClientFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Partial<CrmClient>;
  mode?: 'create' | 'edit';
}

export function CreateClientForm({ onSuccess, onCancel, initialData, mode = 'create' }: CreateClientFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: initialData?.name || '',
      industry: initialData?.industry || '',
      region: initialData?.region || '',
      status: initialData?.status || 'Prospect',
      contract_type: initialData?.contract_type || '',
      sla_reference_url: initialData?.sla_reference_url || '',
      domain: initialData?.domain || '',
      gst_vat: initialData?.gst_vat || ''
    }
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      setLoading(true);
      
      // Get user ID from auth context (works with dev mode)
      const storedDevUser = localStorage.getItem("dev_user");
      let userId: string;
      
      if (storedDevUser) {
        const devUser = JSON.parse(storedDevUser);
        userId = devUser.id;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Authentication required');
        userId = user.id;
      }
      
      if (mode === 'create') {
        await CrmService.createClient({
          ...data,
          created_by: userId
        } as Omit<CrmClient, 'id' | 'created_at' | 'updated_at'>);
        toast({
          title: 'Success',
          description: 'Client created successfully.'
        });
      } else if (initialData?.id) {
        await CrmService.updateClient(initialData.id, data);
        toast({
          title: 'Success',
          description: 'Client updated successfully.'
        });
      }
      
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${mode} client. Please try again.`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = ['Active', 'Inactive', 'Prospect'];
  const industryOptions = ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Consulting'];
  const regionOptions = ['North America', 'Europe', 'Asia Pacific', 'Middle East', 'Latin America', 'Africa'];
  const contractTypeOptions = ['MSA'];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter client name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domain</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="example.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {industryOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {regionOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gst_vat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GST/VAT Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Tax identification number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="contract_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contract type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {contractTypeOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sla_reference_url"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>SLA Reference (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // TODO: Upload to Supabase Storage and set URL
                        field.onChange(file.name);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !form.formState.isValid}>
            {loading ? 'Saving...' : mode === 'create' ? 'Create Client' : 'Update Client'}
          </Button>
        </div>
      </form>
    </Form>
  );
}