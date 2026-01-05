import { useState, useRef } from "react";
import { format } from "date-fns";
import { Upload, X, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthContext";
import NodeApiClient from "@/services/nodeApiClient";

interface RegularizeAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendanceRecordId: string;
  attendanceDate: string;
  onSuccess: () => void;
}

export function RegularizeAttendanceDialog({
  open,
  onOpenChange,
  attendanceRecordId,
  attendanceDate,
  onSuccess,
}: RegularizeAttendanceDialogProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Limit file size to 5MB
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setReason("");
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Helper function to check if string is a valid UUID
  const isValidUUID = (id: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id
    );
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for regularization");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to submit a request");
      return;
    }

    setIsSubmitting(true);

    // Check if this is a synthetic absent record (not a real UUID)
    // const realRecordId = isValidUUID(attendanceRecordId) ? attendanceRecordId : null;
    try {
      const formData = new FormData();
      // JSON payload (same as curl `--form 'data="..."'`)
      formData.append(
        "data",
        JSON.stringify({
          employee_id: user.id,
          attendance_record_id: isValidUUID(attendanceRecordId)
            ? attendanceRecordId
            : null,
          attendance_date: attendanceDate,
          reason: reason.trim(),
          status: "pending",
        })
      );
      // Optional document upload
      if (file) {
        formData.append("document", file);
      }
      await NodeApiClient.post("/attendance/regularization/request", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // let documentUrl: string | null = null;

      // // Upload file if selected
      // if (file) {
      //   const fileExt = file.name.split('.').pop();
      //   const fileName = `${user.id}/${attendanceRecordId}_${Date.now()}.${fileExt}`;

      // const { data: uploadData, error: uploadError } = await supabase.storage
      //   .from('attendance-documents')
      //   .upload(fileName, file);

      // if (uploadError) {
      //   throw new Error('Failed to upload document');
      // }

      //   const { data: urlData } = supabase.storage
      //     .from('attendance-documents')
      //     .getPublicUrl(fileName);

      //   documentUrl = urlData.publicUrl;
      // }

      // Create regularization request (realRecordId can be null for synthetic absent records)
      // const { error } = await supabase
      //   .from('attendance_regularization_requests')
      //   .insert({
      //     employee_id: user.id,
      //     attendance_record_id: realRecordId,
      //     attendance_date: attendanceDate,
      //     reason: reason.trim(),
      //     document_url: documentUrl,
      //     status: 'pending',
      //   });

      // if (error) {
      //   throw error;
      // }

      toast.success("Regularization request submitted successfully");
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error submitting regularization request:", error);
      toast.error("Failed to submit regularization request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Regularize Attendance</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date (Read-only) */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              value={format(new Date(attendanceDate), "dd MMM yyyy")}
              disabled
              className="bg-muted"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Attach Document (optional)</Label>
            <div className="space-y-2">
              {file ? (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[250px]">
                      {file.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max file size: 5MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason *</Label>
            <Textarea
              placeholder="Please provide a reason for regularization..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
