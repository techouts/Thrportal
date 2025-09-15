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
import type { CrmClient } from '@/types/crm';

const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  industry: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Prospect']).default('Prospect'),
  billing_model: z.string().optional(),
  contract_type: z.string().optional(),
  sla_reference: z.string().optional(),
  domain: z.string().optional(),
  gst_vat: z.string().optional(),
  health_score: z.number().min(0).max(100).default(50)
});

type ClientFormData = z.infer<typeof clientSchema>;

interface CreateClientFormProps {
  onSuccess: () => void;
  initialData?: Partial<CrmClient>;
  mode?: 'create' | 'edit';
}

export function CreateClientForm({ onSuccess, initialData, mode = 'create' }: CreateClientFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: initialData?.name || '',
      industry: initialData?.industry || '',
      location: initialData?.location || '',
      status: initialData?.status || 'Prospect',
      billing_model: initialData?.billing_model || '',
      contract_type: initialData?.contract_type || '',
      sla_reference: initialData?.sla_reference || '',
      domain: initialData?.domain || '',
      gst_vat: initialData?.gst_vat || '',
      health_score: initialData?.health_score || 50
    }
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      setLoading(true);
      
      if (mode === 'create') {
        await CrmService.createClient(data as Omit<CrmClient, 'id' | 'created_at' | 'updated_at'>);
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
  const billingModelOptions = ['Fixed Price', 'Time & Material', 'Milestone Based', 'Retainer'];
  const contractTypeOptions = ['Direct', 'MSA', 'SOW', 'Purchase Order'];

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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="City, Country" />
                </FormControl>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            name="billing_model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Model</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing model" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {billingModelOptions.map(option => (
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
            name="contract_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            name="sla_reference"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>SLA Reference</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="SLA document reference or link" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="health_score"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initial Health Score (0-100)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    min="0" 
                    max="100"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : mode === 'create' ? 'Create Client' : 'Update Client'}
          </Button>
        </div>
      </form>
    </Form>
  );
}