import { supabase } from '@/integrations/supabase/client'
import type { WorkExperience, EducationDetail, IdentityDocuments } from '@/types/employeeDocuments'

export async function uploadEmployeeDocument(
  userId: string,
  file: File,
  category: string,
  subPath?: string
): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = subPath 
    ? `${userId}/${category}/${subPath}/${fileName}`
    : `${userId}/${category}/${fileName}`

  const { error } = await supabase.storage
    .from('employee-documents')
    .upload(filePath, file)

  if (error) {
    console.error('Error uploading document:', error)
    return null
  }

  const { data } = supabase.storage
    .from('employee-documents')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function deleteEmployeeDocument(filePath: string): Promise<boolean> {
  // Extract the path from the full URL
  const url = new URL(filePath)
  const pathParts = url.pathname.split('/employee-documents/')
  if (pathParts.length < 2) return false

  const { error } = await supabase.storage
    .from('employee-documents')
    .remove([pathParts[1]])

  if (error) {
    console.error('Error deleting document:', error)
    return false
  }

  return true
}

export async function updateWorkExperience(
  userId: string,
  data: WorkExperience[]
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ 
      work_experience: data as any,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating work experience:', error)
    return false
  }
  return true
}

export async function updateEducationDetails(
  userId: string,
  data: EducationDetail[]
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ 
      education_details: data as any,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating education details:', error)
    return false
  }
  return true
}

export async function updateIdentityDocuments(
  userId: string,
  data: IdentityDocuments
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ 
      identity_documents: data as any,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating identity documents:', error)
    return false
  }
  return true
}

export async function updateOfferLetterUrl(
  userId: string,
  url: string | null
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ 
      offer_letter_url: url,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating offer letter URL:', error)
    return false
  }
  return true
}

export async function getEmployeeDocuments(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('work_experience, education_details, identity_documents, offer_letter_url')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching employee documents:', error)
    return null
  }

  return {
    work_experience: (data.work_experience as unknown as WorkExperience[] | null) || [],
    education_details: (data.education_details as unknown as EducationDetail[] | null) || [],
    identity_documents: (data.identity_documents as unknown as IdentityDocuments | null) || {},
    offer_letter_url: data.offer_letter_url
  }
}
