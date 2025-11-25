import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import type { CrmAccount, CrmProject, CrmClient } from "@/types/crm";

const opportunitySchema = z.object({
  client_id: z.string().min(1, "Please select a client"),
  account_id: z.string().optional(),
  project_id: z.string().optional(),
  ft_count: z.number().min(0).default(0),
  contract_count: z.number().min(0).default(0),
  estimation_cost: z.number().min(0).optional(),
  currency: z.string().default("INR"),
  status: z.enum(["Open", "In Progress", "Closed", "Lost"]).default("Open"),
  notes: z.string().min(10, "Notes must be at least 10 characters"),
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

interface CreateOpportunityFormProps {
  clients: CrmClient[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateOpportunityForm({
  clients,
  onSuccess,
  onCancel,
}: CreateOpportunityFormProps) {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<CrmAccount[]>([]);
  const [projects, setProjects] = useState<CrmProject[]>([]);
  const [loadingRelatedData, setLoadingRelatedData] = useState(false);
  const { toast } = useToast();

  const form = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      client_id: "",
      account_id: "",
      project_id: "",
      ft_count: 0,
      contract_count: 0,
      estimation_cost: undefined,
      currency: "INR",
      status: "Open",
      notes: "",
    },
  });

  const selectedClientId = form.watch("client_id");

  useEffect(() => {
    if (!selectedClientId) {
      setAccounts([]);
      setProjects([]);
      return;
    }

    const fetchRelatedData = async () => {
      try {
        setLoadingRelatedData(true);

        const [accountsData, allProjects] = await Promise.all([
          CrmService.getAccountsByClient(selectedClientId),
          CrmService.getProjectsByClient(selectedClientId),
        ]);

        const clientProjects = allProjects.filter(
          (p) => p.client_id === selectedClientId
        );

        setAccounts(accountsData as CrmAccount[]);
        setProjects(allProjects as []);

        form.setValue("account_id", "");
        form.setValue("project_id", "");
      } catch (error) {
        console.error("Failed to fetch related data:", error);
        toast({
          title: "Warning",
          description: "Could not load accounts and projects for this client",
          variant: "destructive",
        });
      } finally {
        setLoadingRelatedData(false);
      }
    };

    fetchRelatedData();
  }, [selectedClientId, form, toast]);
  console.log(projects, "projects");
  const onSubmit = async (data: OpportunityFormData) => {
    try {
      setLoading(true);

      await CrmService.createOpportunity({
        client_id: data.client_id,
        account_id: data.account_id || undefined,
        project_id: data.project_id || undefined,
        ft_count: data.ft_count,
        contract_count: data.contract_count,
        estimation_cost: data.estimation_cost,
        currency: data.currency,
        status: data.status,
        notes: data.notes,
      });

      toast({
        title: "Success",
        description: "Opportunity created successfully.",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create opportunity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statuses = ["Open", "In Progress", "Closed", "Lost"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Client Selection - First Field */}
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="account_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                  disabled={!selectedClientId || loadingRelatedData}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !selectedClientId
                            ? "Select client first"
                            : loadingRelatedData
                            ? "Loading..."
                            : accounts.length === 0
                            ? "No accounts found"
                            : "Select account (optional)"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts.map((account) => (
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
                  value={field.value || undefined}
                  disabled={!selectedClientId || loadingRelatedData}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !selectedClientId
                            ? "Select client first"
                            : loadingRelatedData
                            ? "Loading..."
                            : projects.length === 0
                            ? "No projects found"
                            : "Select project (optional)"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ft_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full-Time Positions</FormLabel>
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
                <FormLabel>Contract Positions</FormLabel>
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="estimation_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Estimation Cost (Optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g., 500000"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
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
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Provide details about this opportunity (minimum 10 characters)..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Opportunity"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
