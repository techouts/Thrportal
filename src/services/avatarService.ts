import { supabase } from '@/integrations/supabase/client'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPG, PNG, WebP, or GIF image.')
  }
  
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 5MB.')
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  // Delete old avatar files first
  const { data: existingFiles } = await supabase.storage
    .from('profile-avatars')
    .list(userId)
  
  if (existingFiles && existingFiles.length > 0) {
    await supabase.storage
      .from('profile-avatars')
      .remove(existingFiles.map(f => `${userId}/${f.name}`))
  }

  // Upload new avatar
  const { error } = await supabase.storage
    .from('profile-avatars')
    .upload(filePath, file)

  if (error) {
    console.error('Error uploading avatar:', error)
    throw new Error('Failed to upload image. Please try again.')
  }

  const { data } = supabase.storage
    .from('profile-avatars')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function updateAvatarUrl(userId: string, url: string | null): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ 
      avatar_url: url,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating avatar URL:', error)
    return false
  }
  return true
}

export async function deleteAvatar(userId: string): Promise<boolean> {
  // Delete from storage
  const { data: existingFiles } = await supabase.storage
    .from('profile-avatars')
    .list(userId)
  
  if (existingFiles && existingFiles.length > 0) {
    await supabase.storage
      .from('profile-avatars')
      .remove(existingFiles.map(f => `${userId}/${f.name}`))
  }

  // Update profile
  return updateAvatarUrl(userId, null)
}
