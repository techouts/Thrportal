import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { CrmService } from '@/services/crmService';
import { useToast } from '@/hooks/use-toast';
import type { CrmInteraction } from '@/types/crm';

const interactionSchema = z.object({
  interaction_type: z.enum(['call', 'meeting', 'email', 'whatsapp', 'linkedin', 'onsite']),
  date: z.string(),
  notes: z.string().optional(),
  outcome: z.string().optional(),
  next_step: z.string().optional(),
  engagement_score: z.number().min(0).max(10).default(5)
});

type InteractionFormData = z.infer<typeof interactionSchema>;

interface EditInteractionFormProps {
  interaction: CrmInteraction;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditInteractionForm({ interaction, onSuccess, onCancel }: EditInteractionFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<InteractionFormData>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      interaction_type: interaction.interaction_type as any,
      date: interaction.date.split('T')[0],
      notes: interaction.notes || '',
      outcome: interaction.outcome || '',
      next_step: interaction.next_step || '',
      engagement_score: interaction.engagement_score || 5
    }
  });

  const onSubmit = async (data: InteractionFormData) => {
    try {
      setLoading(true);
      
      await CrmService.updateInteraction(interaction.id, {
        interaction_type: data.interaction_type,
        date: data.date,
        notes: data.notes || undefined,
        outcome: data.outcome || undefined,
        next_step: data.next_step || undefined,
        engagement_score: data.engagement_score,
      });
      
      toast({
        title: 'Success',
        description: 'Interaction updated successfully.'
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update interaction. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="interaction_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interaction Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
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
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="engagement_score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engagement Score (0-10)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  min="0" 
                  max="10"
                  onChange={(e) => field.onChange(Number(e.target.value))}
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
                <Textarea {...field} rows={3} placeholder="Discussion notes..." />
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
                <Input {...field} placeholder="Summary of outcome" />
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
                <Input {...field} placeholder="Action items or next steps" />
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
            {loading ? 'Updating...' : 'Update Interaction'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
