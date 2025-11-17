import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CrmService } from '@/services/crmService';
import { toast } from 'sonner';
import type { CrmClient, CrmAccount, CrmProject, CrmSpoc } from '@/types/crm';

const interactionSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  account_id: z.string().optional(),
  project_id: z.string().optional(),
  spoc_id: z.string().optional(),
  interaction_type: z.enum(['call', 'meeting', 'email', 'whatsapp', 'linkedin', 'onsite']),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  outcome: z.string().optional(),
  next_step: z.string().optional(),
  engagement_score: z.number().min(0).max(10).default(5),
});

type InteractionFormData = z.infer<typeof interactionSchema>;

interface CreateInteractionFormProps {
  clientId?: string;
  accountId?: string;
  projectId?: string;
  clients: CrmClient[];
  accounts?: CrmAccount[];
  projects?: CrmProject[];
  spocs?: CrmSpoc[];
  onSuccess: () => void;
}

export function CreateInteractionForm({ 
  clientId, 
  accountId,
  projectId,
  clients, 
  accounts = [],
  projects = [],
  spocs = [],
  onSuccess 
}: CreateInteractionFormProps) {
  const [loading, setLoading] = useState(false);
  
  const form = useForm<InteractionFormData>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      client_id: clientId || '',
      account_id: accountId || '',
      project_id: projectId || '',
      spoc_id: '',
      interaction_type: 'call',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      outcome: '',
      next_step: '',
      engagement_score: 5,
    },
  });

  const selectedClientId = form.watch('client_id');

  const onSubmit = async (data: InteractionFormData) => {
    try {
      setLoading(true);
      await CrmService.createInteraction({
        client_id: data.client_id,
        account_id: data.account_id || undefined,
        project_id: data.project_id || undefined,
        spoc_id: data.spoc_id || undefined,
        interaction_type: data.interaction_type,
        date: data.date,
        notes: data.notes || undefined,
        outcome: data.outcome || undefined,
        next_step: data.next_step || undefined,
        engagement_score: data.engagement_score,
        is_synced: false,
      });
      toast.success('Interaction logged successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to log interaction');
      console.error('Error creating interaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client *</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!!clientId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
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
          name="account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account (Optional)</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!selectedClientId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts
                    .filter(acc => acc.client_id === selectedClientId)
                    .map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
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
          name="project_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project (Optional)</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!selectedClientId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projects
                    .filter(proj => proj.client_id === selectedClientId)
                    .map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
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
          name="spoc_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SPOC (Optional)</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!selectedClientId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select SPOC" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {spocs
                    .filter(spoc => spoc.client_id === selectedClientId)
                    .map((spoc) => (
                      <SelectItem key={spoc.id} value={spoc.id}>
                        {spoc.name} {spoc.role ? `(${spoc.role})` : ''}
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
          name="interaction_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interaction Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="onsite">Onsite Visit</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="engagement_score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engagement Score (0-10)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  max="10" 
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
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
                <Textarea 
                  placeholder="Details about the interaction..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="outcome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Outcome</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What was the outcome?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="next_step"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next Step</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What's the next action?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Log Interaction'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
