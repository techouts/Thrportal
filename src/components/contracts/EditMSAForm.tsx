import React, { useState } from "react";
import { format, parse } from "date-fns";
import { CalendarIcon, Upload, X, ExternalLink } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CrmService } from "@/services/crmService";
import { cn } from "@/lib/utils";

interface EditMSAFormProps {
  msa: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditMSAForm({ msa, onSuccess, onCancel }: EditMSAFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: msa.title || "",
    client_id: msa.client_id || "",
    valid_from: msa.valid_from
      ? parse(msa.valid_from, "yyyy-MM-dd", new Date())
      : (undefined as Date | undefined),
    valid_to: msa.valid_to
      ? parse(msa.valid_to, "yyyy-MM-dd", new Date())
      : (undefined as Date | undefined),
    status: msa.status || "Active",
    doc_link: msa.doc_link || "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/png",
        "image/jpeg",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Invalid file type. Allowed: PDF, DOCX, XLSX, PNG, JPG",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const uploadDocument = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `msas/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("contracts")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("contracts").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // let doc_link = formData.doc_link; // Keep existing doc_link by default

      // // Upload new document if one is selected
      // if (selectedFile) {
      //   setUploading(true);
      //   doc_link = await uploadDocument(selectedFile);
      //   setUploading(false);
      // }

      // Prepare update payload
      const updatePayload: any = {
        title: formData.title,
        valid_from: formData.valid_from
          ? format(formData.valid_from, "yyyy-MM-dd")
          : "",
        valid_to: formData.valid_to
          ? format(formData.valid_to, "yyyy-MM-dd")
          : "",
        status: formData.status as
          | "Draft"
          | "Active"
          | "Expired"
          | "Terminated",
        doc_link: selectedFile,
      };

      // if (selectedFile) {
      //   updatePayload.doc_link = selectedFile;
      // }

      // Call CrmService.updateMSA
      await CrmService.updateMSA(msa.id, updatePayload);

      toast({
        title: "Success",
        description: "MSA updated successfully",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update MSA",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title*</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <Label>Valid From*</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !formData.valid_from && "text-muted-foreground"
                )}
              >
                {formData.valid_from ? (
                  format(formData.valid_from, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                fromYear={1990}
                toYear={new Date().getFullYear() + 10}
                selected={formData.valid_from}
                onSelect={(date) =>
                  setFormData({ ...formData, valid_from: date })
                }
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col space-y-2">
          <Label>Valid To*</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !formData.valid_to && "text-muted-foreground"
                )}
              >
                {formData.valid_to ? (
                  format(formData.valid_to, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                fromYear={1990}
                toYear={new Date().getFullYear() + 10}
                selected={formData.valid_to}
                onSelect={(date) =>
                  setFormData({ ...formData, valid_to: date })
                }
                initialFocus
                disabled={(date) => {
                  return formData.valid_from
                    ? date < formData.valid_from
                    : false;
                }}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
            <SelectItem value="Terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="doc_link">Add New Document</Label>

        {/* Show existing document link if it exists */}
        {msa.files?.length > 0 && !selectedFile && (
          <div className="space-y-2 mb-2">
            {msa.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 p-2 bg-muted rounded"
              >
                <span className="text-sm flex-1">
                  Current Document: {file.file_name}
                </span>
                <a
                  href={`https://hrportal.coventic.com:7783${file.file_view_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  View
                </a>
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

        {/* File upload section */}
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
              <span className="flex-1 text-sm truncate">
                {selectedFile.name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {selectedFile
              ? "New document will be uploaded (existing document will be kept)"
              : "Accepted: PDF, DOCX, XLSX, PNG, JPG (max 10MB) - Optional"}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? uploading
              ? "Uploading..."
              : "Saving..."
            : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
