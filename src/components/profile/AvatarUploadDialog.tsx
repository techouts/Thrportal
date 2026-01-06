import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Trash2, Loader2, ImageIcon } from "lucide-react";
import {
  uploadAvatar,
  updateAvatarUrl,
  deleteAvatar,
} from "@/services/avatarService";
import { useToast } from "@/hooks/use-toast";

interface AvatarUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatarUrl?: string | null;
  userId: string;
  userName?: string;
  onSuccess: (newUrl: string | null) => void;
}

export default function AvatarUploadDialog({
  open,
  onOpenChange,
  currentAvatarUrl,
  userId,
  userName = "User",
  onSuccess,
}: AvatarUploadDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const NODE_API_BASE_URL = import.meta.env.VITE_API_BASE_NODE_URL;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, WebP, or GIF image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // const publicUrl = await uploadAvatar(userId, selectedFile)
      const updated = await updateAvatarUrl(userId, selectedFile);

      if (updated) {
        toast({
          title: "Photo updated",
          description: "Your profile photo has been updated successfully.",
        });
        onSuccess(updated);
        handleClose();
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setDeleting(true);
    try {
      const deleted = await deleteAvatar(userId);
      if (deleted) {
        toast({
          title: "Photo removed",
          description: "Your profile photo has been removed.",
        });
        onSuccess(null);
        handleClose();
      } else {
        throw new Error("Failed to remove photo");
      }
    } catch (error) {
      toast({
        title: "Remove failed",
        description: "Failed to remove photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onOpenChange(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Profile Photo</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* Preview Avatar */}
          <Avatar className="h-32 w-32">
            <AvatarImage
              src={
                previewUrl
                  ? previewUrl
                  : currentAvatarUrl
                  ? `${NODE_API_BASE_URL}${currentAvatarUrl}`
                  : undefined
              }
              alt="Profile preview"
            />
            <AvatarFallback className="text-2xl">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Select Image Button */}
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || deleting}
            className="w-full"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            {selectedFile ? "Choose Different Image" : "Select Image"}
          </Button>

          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {selectedFile.name}
            </p>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Supported formats: JPG, PNG, WebP, GIF. Max size: 5MB.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {currentAvatarUrl && !selectedFile && (
            <Button
              variant="destructive"
              onClick={handleRemovePhoto}
              disabled={uploading || deleting}
              className="w-full sm:w-auto"
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Remove Photo
            </Button>
          )}

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploading || deleting}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>

            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={uploading || deleting}
                className="flex-1 sm:flex-none"
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
