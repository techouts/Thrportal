import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrmService } from "@/services/crmService";
import { useToast } from "@/hooks/use-toast";
import type { CrmClient, CrmAccount, CrmProject } from "@/types/crm";
import { ExternalLink } from "lucide-react";

interface EntityDetailsFormProps {
  entity: CrmClient | CrmAccount | CrmProject;
  entityType: "client" | "account" | "project";
  onSave: () => void;
  readOnly?: boolean;
}

export function EntityDetailsForm({
  entity,
  entityType,
  onSave,
  readOnly = false,
}: EntityDetailsFormProps) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFormData({ ...entity });
  }, [entity]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };
  console.log(formData, "formdata");
  const handleSave = async () => {
    try {
      setLoading(true);

      if (entityType === "client") {
        await CrmService.updateClient(
          entity.id,
          formData as Partial<CrmClient>
        );
      } else if (entityType === "account") {
        await CrmService.updateAccount(
          entity.id,
          formData as Partial<CrmAccount>
        );
      } else if (entityType === "project") {
        await CrmService.updateProject(
          entity.id,
          formData as Partial<CrmProject>
        );
      }

      toast({ title: "Success", description: "Changes saved successfully" });
      onSave();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entity Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Name *</Label>
            <Input
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="mt-1"
              disabled = {readOnly}
            />
          </div>

          {entityType !== "project" && (
            <div>
              <Label>Status</Label>
              <Select
                value={formData.status || "Active"}
                onValueChange={(value) => handleChange("status", value)}
                disabled = {readOnly}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  {entityType === "client" && (
                    <SelectItem value="Prospect">Prospect</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {entityType === "project" && (
            <>
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status || "Planned"}
                  onValueChange={(value) => handleChange("status", value)}
                  disabled = {readOnly}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planned">Planned</SelectItem>
                    <SelectItem value="In-flight">In-flight</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="On-hold">On-hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={formData.priority || "Medium"}
                  onValueChange={(value) => handleChange("priority", value)}
                  disabled = {readOnly}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {entityType === "client" && (
            <>
              <div>
                <Label>Industry</Label>
                <Input
                  value={formData.industry || ""}
                  onChange={(e) => handleChange("industry", e.target.value)}
                  className="mt-1"
                  disabled = {readOnly}
                />
              </div>
              <div>
                <Label>Region</Label>
                <Input
                  value={formData.region || ""}
                  onChange={(e) => handleChange("region", e.target.value)}
                  className="mt-1"
              disabled = {readOnly}

                />
              </div>
              <div>
                <Label>Domain</Label>
                <Input
                  value={formData.domain || ""}
                  onChange={(e) => handleChange("domain", e.target.value)}
                  className="mt-1"
              disabled = {readOnly}

                />
              </div>
              <div>
                <Label>GST/VAT Number</Label>
                <Input
                  value={formData.gst_vat || ""}
                  onChange={(e) => handleChange("gst_vat", e.target.value)}
                  className="mt-1"
              disabled = {readOnly}

                />
              </div>
              <div>
                <Label>Contract Type</Label>
                <Input
                  value={formData.contract_type || ""}
                  onChange={(e) =>
                    handleChange("contract_type", e.target.value)
                  }
                  className="mt-1"
              disabled = {readOnly}

                />
              </div>
              {formData.files?.length > 0 && (
                <div className="space-y-2 mb-2">
                  {formData.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 p-2 bg-muted rounded"
                    >
                      <span className="text-sm flex-1">
                        Uploaded Document: {file.file_name}
                      </span>

                      <a
                        href={`https://hrportal.coventic.com:7783${file.file_download_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {entityType === "account" && (
            <>
              <div>
                <Label>Account Type</Label>
                <Input
                  value={formData.type || ""}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="mt-1"
              disabled = {readOnly}

                />
              </div>
              <div>
                <Label>SLA Override</Label>
                <Input
                  value={formData.sla_override || ""}
                  onChange={(e) => handleChange("sla_override", e.target.value)}
                  className="mt-1"
              disabled = {readOnly}

                />
              </div>
            </>
          )}
         {!readOnly && (
          <Button onClick={handleSave} disabled={loading || !formData.name}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
