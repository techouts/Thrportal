import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CrmService } from '@/services/crmService';
import { CrmSpocLinkService } from '@/services/crmSpocLinkService';
import { useToast } from '@/hooks/use-toast';

const linkSpocSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  phone: z.string().optional(),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  spoc_role: z.enum(['finance', 'project', 'sales', 'escalation', 'primary'] as const, {
    required_error: 'Role is required'
  })
});

type LinkSpocFormData = z.infer<typeof linkSpocSchema>;

interface LinkSpocFormProps {
  clientId?: string;
  accountId?: string;
  projectId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LinkSpocForm({ clientId, accountId, projectId, onSuccess, onCancel }: LinkSpocFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LinkSpocFormData>({
    resolver: zodResolver(linkSpocSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      linkedin_url: '',
      spoc_role: 'primary'
    }
  });

  const onSubmit = async (data: LinkSpocFormData) => {
    try {
      setLoading(true);
      
      // Create the SPOC first
      const spocData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        linkedin_url: data.linkedin_url,
        is_primary: data.spoc_role === 'primary'
      };

      const newSpoc = await CrmService.createSpoc(spocData);
      
      // Then create the link
      const linkData: any = {
        spoc_id: newSpoc.id,
        role: data.spoc_role,
        entity_id: '',
        entity_type: ''
      };

      if (clientId) {
        linkData.entity_id = clientId;
        linkData.entity_type = 'client';
      } else if (accountId) {
        linkData.entity_id = accountId;
        linkData.entity_type = 'account';
      } else if (projectId) {
        linkData.entity_id = projectId;
        linkData.entity_type = 'project';
      }

      await CrmSpocLinkService.createSpocLink(linkData);
      
      toast({
        title: 'Success',
        description: 'SPOC linked successfully.'
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to link SPOC. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter SPOC name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="spoc_role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="escalation">Escalation</SelectItem>
                  <SelectItem value="primary">Primary</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="email@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} placeholder="+1 234 567 8900" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="linkedin_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://linkedin.com/in/..." />
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
            {loading ? 'Creating...' : 'Create SPOC'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
