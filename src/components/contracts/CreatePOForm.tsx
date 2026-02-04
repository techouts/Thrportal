import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CrmService } from '@/services/crmService';
import { supabase } from '@/integrations/supabase/client';

const poSchema = z.object({
  po_number: z.string().min(1, 'PO number is required'),
  client_id: z.string().min(1, 'Client is required'),
  valid_from: z.date({ required_error: 'Valid from date is required' }),
  valid_to: z.date({ required_error: 'Valid to date is required' }),
  total_amount: z.number().min(0.01, 'Total amount must be greater than 0'),
  currency: z.string().default('INR'),
  status: z.enum(['Draft', 'Active', 'Expired', 'Terminated']).default('Draft'),
  document: z.instanceof(File).optional()
}).refine(data => data.valid_to > data.valid_from, {
  message: 'Valid to must be after valid from',
  path: ['valid_to']
});

type POFormData = z.infer<typeof poSchema>;

interface CreatePOFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreatePOForm({ onSuccess, onCancel }: CreatePOFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clients, setClients] = useState<any[]>([]);

  const form = useForm<POFormData>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      po_number: '',
      client_id: '',
      currency: 'INR',
      status: 'Draft'
    }
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await CrmService.getClients();
      setClients(data);
    } catch (error) {
      console.error('Failed to load clients', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'File size must be less than 10MB',
          variant: 'destructive'
        });
        return;
      }
      
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/png', 'image/jpeg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Error',
          description: 'Invalid file type. Allowed: PDF, DOCX, XLSX, PNG, JPG',
          variant: 'destructive'
        });
        return;
      }
      
      setSelectedFile(file);
      form.setValue('document', file);
    }
  };

  const uploadDocument = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `pos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (data: POFormData) => {
    try {
      setLoading(true);
      
      // let doc_link: string | undefined = undefined;
      
      // if (selectedFile) {
      //   setUploading(true);
      //   doc_link = await uploadDocument(selectedFile);
      //   setUploading(false);
      // }

      await CrmService.createPO({
        poNumber: data.po_number,
        clientId: data.client_id,
        validFrom: format(data.valid_from, 'yyyy-MM-dd'),
        validTo: format(data.valid_to, 'yyyy-MM-dd'),
        totalAmount: data.total_amount,
        remainingAmount: data.total_amount,
        currency: data.currency,
        status: data.status,
      },
      selectedFile
    );
      
      toast({
        title: "Success",
        description: "Purchase Order created successfully",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create Purchase Order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const isFormValid = form.formState.isValid && !uploading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="po_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PO Number *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="PO-2025-001" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="valid_from"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Valid From *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      captionLayout="dropdown"
                      fromYear={1990}
                      toYear={new Date().getFullYear() + 10}
                      selected={field.value} 
                      onSelect={field.onChange} 
                      initialFocus 
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="valid_to"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Valid To *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      captionLayout="dropdown"
                      fromYear={1990}
                      toYear={new Date().getFullYear() + 10}
                      selected={field.value} 
                      onSelect={field.onChange} 
                      initialFocus
                      disabled={(date) => {
                        const validFrom = form.getValues('valid_from');
                        return validFrom ? date < validFrom : false;
                      }}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="total_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Amount *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ''}
                    placeholder="100000.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="document"
          render={() => (
            <FormItem>
              <FormLabel>Document Upload</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {!selectedFile ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.docx,.xlsx,.xls,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                        className="flex-1"
                      />
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <span className="flex-1 text-sm truncate">{selectedFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          form.setValue('document', undefined);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Accepted: PDF, DOCX, XLSX, PNG, JPG (max 10MB)
                  </p>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isFormValid || loading}>
            {loading ? (uploading ? 'Uploading...' : 'Creating...') : 'Create Purchase Order'}
          </Button>
        </div>
      </form>
    </Form>
  );
}