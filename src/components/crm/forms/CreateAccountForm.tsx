import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CrmService } from "@/services/crmService";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUserId } from "@/utils/authHelpers";
import type { CrmSpoc } from "@/types/crm";

const accountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.string().optional(),
  sla_override: z.string().optional(),
  primary_spoc_id: z.string().optional(),
  billing_currency: z.string().min(1, "Billing currency is required"),
  status: z.string().min(1, "Status is required"),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface CreateAccountFormProps {
  clientId: string;
  spocs: CrmSpoc[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateAccountForm({
  clientId,
  spocs,
  onSuccess,
  onCancel,
}: CreateAccountFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "",
      sla_override: "",
      primary_spoc_id: "",
      billing_currency: "USD",
      status: "Active",
    },
  });

  const onSubmit = async (data: AccountFormData) => {
    try {
      setLoading(true);

      // Get user ID using unified auth helper
      // const userId = await getCurrentUserId();
      const userId = localStorage.getItem("auth_user_id");

      await CrmService.createAccount({
        name: data.name,
        type: data.type,
        sla_override: data.sla_override,
        client_id: clientId,
        primary_spoc_id:
          data.primary_spoc_id === "none" ? undefined : data.primary_spoc_id,
        billing_currency: data.billing_currency,
        status: data.status,
        created_by: userId,
      });

      toast({
        title: "Success",
        description: "Account created successfully.",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const accountTypes = [
    "Department",
    "Business Unit",
    "Geography",
    "Division",
    "Subsidiary",
  ];

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
                <Input
                  {...field}
                  placeholder="e.g. IT Department, US Operations"
                />
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
                  {accountTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
                  {spocs.map((spoc) => (
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

        <FormField
          control={form.control}
          name="billing_currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Currency *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
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

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !form.formState.isValid}>
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
