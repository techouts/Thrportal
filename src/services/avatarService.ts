import { supabase } from "@/integrations/supabase/client";
import NodeApiClient from "@/services/nodeApiClient";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Invalid file type. Please upload a JPG, PNG, WebP, or GIF image."
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large. Maximum size is 5MB.");
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // Delete old avatar files first
  const { data: existingFiles } = await supabase.storage
    .from("profile-avatars")
    .list(userId);

  if (existingFiles && existingFiles.length > 0) {
    await supabase.storage
      .from("profile-avatars")
      .remove(existingFiles.map((f) => `${userId}/${f.name}`));
  }

  // Upload new avatar
  const { error } = await supabase.storage
    .from("profile-avatars")
    .upload(filePath, file);

  if (error) {
    console.error("Error uploading avatar:", error);
    throw new Error("Failed to upload image. Please try again.");
  }

  const { data } = supabase.storage
    .from("profile-avatars")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function updateAvatarUrl(
  userId: string,
  file: File | null
): Promise<string | null> {
  // const { error } = await supabase
  //   .from('profiles')
  //   .update({
  //     avatar_url: url,
  //     updated_at: new Date().toISOString()
  //   })
  //   .eq('id', userId)

  // if (error) {
  //   console.error('Error updating avatar URL:', error)
  //   return false
  // }
  // return true
  try {
    const formData = new FormData();

    if (file) {
      formData.append("avatar_url", file);
    } else {
      // 👇 this is what deletes the avatar
      formData.append("avatar_url", null);
    }

    const { data } = await NodeApiClient.patch(`/profile/${userId}`, formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": undefined, // IMPORTANT
      },
    });
    const avatar = data?.avatar_url;
    // Backend should return updated avatar URL
    // return data?.avatar_url ?? null;
    if (avatar === "null" || avatar === undefined) {
      return null;
    }

    return avatar;
  } catch (error) {
    console.error("Error updating avatar:", error);
    return null;
  }
}

export async function deleteAvatar(userId: string): Promise<boolean> {
  // Delete from storage
  // const { data: existingFiles } = await supabase.storage
  //   .from("profile-avatars")
  //   .list(userId);

  // if (existingFiles && existingFiles.length > 0) {
  //   await supabase.storage
  //     .from("profile-avatars")
  //     .remove(existingFiles.map((f) => `${userId}/${f.name}`));
  // }

  // Update profile
  // return updateAvatarUrl(userId, null);
  // const result = await updateAvatarUrl(userId, null);
  // return result === null ? true : false;
  await updateAvatarUrl(userId, null);
  return true;
}
