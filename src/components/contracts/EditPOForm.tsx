import React, { useState } from "react";
import { format, parse } from "date-fns";
import { CalendarIcon, X, ExternalLink } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { CrmService } from "@/services/crmService";
import { supabase } from "@/integrations/supabase/client";

interface EditPOFormProps {
  po: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditPOForm({ po, onSuccess, onCancel }: EditPOFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    po_number: po.po_number || "",
    valid_from: po.valid_from
      ? parse(po.valid_from, "yyyy-MM-dd", new Date())
      : undefined,
    valid_to: po.valid_to
      ? parse(po.valid_to, "yyyy-MM-dd", new Date())
      : undefined,
    total_amount: po.total_amount || "",
    remaining_amount: po.remaining_amount || "",
    currency: po.currency || "INR",
    status: po.status || "Active",
    doc_link: po.doc_link || "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }

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
    const filePath = `purchase_orders/${fileName}`;

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

    if (
      !formData.po_number ||
      !formData.valid_from ||
      !formData.valid_to ||
      !formData.total_amount
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // let doc_link = formData.doc_link;

      // if (selectedFile) {
      //   setUploading(true);
      //   doc_link = await uploadDocument(selectedFile);
      //   setUploading(false);
      // }

      const updatePayload: any = {
        poNumber: formData.po_number,
        validFrom: format(formData.valid_from, "yyyy-MM-dd"),
        validTo: format(formData.valid_to, "yyyy-MM-dd"),
        totalAmount: parseFloat(formData.total_amount),
        remainingAmount: parseFloat(formData.remaining_amount),
        currency: formData.currency,
        status: formData.status,
        doc_link: selectedFile,
      };

      await CrmService.updatePO(po.id, updatePayload);

      toast({
        title: "Success",
        description: "Purchase Order updated successfully",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update Purchase Order",
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
        <Label htmlFor="po_number">PO Number*</Label>
        <Input
          id="po_number"
          value={formData.po_number}
          onChange={(e) =>
            setFormData({ ...formData, po_number: e.target.value })
          }
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
                disabled={(date) =>
                  formData.valid_from ? date < formData.valid_from : false
                }
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="total_amount">Total Amount*</Label>
          <Input
            id="total_amount"
            type="number"
            step="0.01"
            value={formData.total_amount}
            onChange={(e) =>
              setFormData({ ...formData, total_amount: e.target.value })
            }
            required
            placeholder="500000.00"
          />
        </div>
        <div>
          <Label htmlFor="remaining_amount">Remaining Amount</Label>
          <Input
            id="remaining_amount"
            type="number"
            step="0.01"
            value={formData.remaining_amount}
            onChange={(e) =>
              setFormData({ ...formData, remaining_amount: e.target.value })
            }
            placeholder="500000.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) =>
              setFormData({ ...formData, currency: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">INR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value })
            }
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
      </div>

      <div className="space-y-2">
        <Label>Add New Document</Label>
        {po.files?.length > 0 && !selectedFile && (
          <div className="space-y-2 mb-2">
            {po.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 p-2 bg-muted rounded"
              >
                <span className="text-sm flex-1">
                  Current Document: {file.file_name}
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

        {!selectedFile ? (
          <Input
            type="file"
            accept=".pdf,.docx,.xlsx,.xls,.png,.jpg,.jpeg"
            onChange={handleFileChange}
          />
        ) : (
          <div className="flex items-center gap-2 p-2 border rounded">
            <span className="flex-1 text-sm truncate">{selectedFile.name}</span>
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
          Accepted: PDF, DOCX, XLSX, PNG, JPG (max 10MB)
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
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
