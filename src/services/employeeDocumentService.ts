import { supabase } from "@/integrations/supabase/client";
import type {
  WorkExperience,
  EducationDetail,
  IdentityDocuments,
} from "@/types/employeeDocuments";
import NodeApiClient from "@/services/nodeApiClient";

export async function uploadEmployeeDocument(
  userId: string,
  file: File,
  category: string
  // subPath?: string
): Promise<string | null> {
  try {
    const formData = new FormData();

    // document metadata (same as curl --form 'data=...')
    formData.append(
      "data",
      JSON.stringify({
        identity_documents: {
          [category]: {
            uploaded: true,
          },
        },
      })
    );

    // actual file
    formData.append("file", file);
    const response = await NodeApiClient.patch(`/profile/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    /**
     * Backend should return updated profile
     * Adjust path if backend response differs
     */
    return response.data?.identity_documents?.[category]?.url ?? null;
  } catch (error) {
    console.error("[UPLOAD] Employee document upload failed", error);
    return null;
  }
  // const fileExt = file.name.split(".").pop();
  // const fileName = `${Date.now()}.${fileExt}`;
  // const filePath = subPath
  //   ? `${userId}/${category}/${subPath}/${fileName}`
  //   : `${userId}/${category}/${fileName}`;

  // const { error } = await supabase.storage
  //   .from("employee-documents")
  //   .upload(filePath, file);

  // if (error) {
  //   console.error("Error uploading document:", error);
  //   return null;
  // }

  // const { data } = supabase.storage
  //   .from("employee-documents")
  //   .getPublicUrl(filePath);

  // return data.publicUrl;
}

export async function deleteEmployeeDocument(
  filePath: string
): Promise<boolean> {
  // Extract the path from the full URL
  const url = new URL(filePath);
  const pathParts = url.pathname.split("/employee-documents/");
  if (pathParts.length < 2) return false;

  const { error } = await supabase.storage
    .from("employee-documents")
    .remove([pathParts[1]]);

  if (error) {
    console.error("Error deleting document:", error);
    return false;
  }

  return true;
}

export async function updateWorkExperience(
  userId: string,
  data: WorkExperience[],
  file?: File,
  experienceId?: string
): Promise<boolean> {
  try {
    const formData = new FormData();

    formData.append(
      "data",
      JSON.stringify({
        work_experience: data,
      })
    );

    if (experienceId) {
      formData.append("experience_id", experienceId);
    }

    if (file) {
      formData.append("file", file);
    }
    await NodeApiClient.patch(`/profile/${userId}`, formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": undefined,
      },
    });

    return true;
  } catch (error) {
    console.error("[PROFILE] Error updating work experience", error);
    return false;
  }
  // const { error } = await supabase
  //   .from('profiles')
  //   .update({
  //     work_experience: data as any,
  //     updated_at: new Date().toISOString()
  //   })
  //   .eq('id', userId)

  // if (error) {
  //   console.error('Error updating work experience:', error)
  //   return false
  // }
  // return true
}

export async function updateEducationDetails(
  userId: string,
  data: EducationDetail[],
  file?: File,
  educationId?: string
): Promise<boolean> {
  try {
    const formData = new FormData();

    // EXACT match with curl: --form 'data="..."'
    formData.append(
      "data",
      JSON.stringify({
        education_details: data,
      })
    );

    if (educationId) {
      formData.append("education_id", educationId);
    }
    if (file) {
      formData.append("file", file);
    }
    await NodeApiClient.patch(`/profile/${userId}`, formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": undefined,
      },
    });

    return true;
  } catch (error) {
    console.error("[PROFILE] Error updating education details", error);
    return false;
  }
  // const { error } = await supabase
  //   .from("profiles")
  //   .update({
  //     education_details: data as any,
  //     updated_at: new Date().toISOString(),
  //   })
  //   .eq("id", userId);

  // if (error) {
  //   console.error("Error updating education details:", error);
  //   return false;
  // }
  // return true;
}

export async function updateIdentityDocuments(
  userId: string,
  data: IdentityDocuments,
  file?: File | null
): Promise<boolean> {
  try {
    if (!file) {
      await NodeApiClient.patch(`/profile/${userId}`, {
        identity_documents: data,
        updated_at: new Date().toISOString(),
      });
      return true;
    }
    const formData = new FormData();

    // EXACT match with curl --form 'data="..."'
    formData.append(
      "data",
      JSON.stringify({
        identity_documents: data,
      })
    );
    formData.append("file", file);
    await NodeApiClient.patch(`/profile/${userId}`, formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": undefined,
      },
    });

    return true;
  } catch (error) {
    console.error("[PROFILE] Error updating identity documents", error);
    return false;
  }
  // const { error } = await supabase
  //   .from("profiles")
  //   .update({
  //     identity_documents: data as any,
  //     updated_at: new Date().toISOString(),
  //   })
  //   .eq("id", userId);

  // if (error) {
  //   console.error("Error updating identity documents:", error);
  //   return false;
  // }
  // return true;
}

export async function updateOfferLetterUrl(
  userId: string,
  // url: string | null
  file?: File
): Promise<boolean> {
  try {
    if (!file) {
      await NodeApiClient.patch(`/profile/${userId}`, {
        offer_letter_url: null,
        updated_at: new Date().toISOString(),
      });
      return true;
    }
    const formData = new FormData();

    formData.append("file", file);
    await NodeApiClient.patch(`/profile/${userId}`, formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": undefined,
      },
    });

    return true;
  } catch (error) {
    console.error("[PROFILE] Error updating offer letter URL", error);
    return false;
  }
  // const { error } = await supabase
  //   .from("profiles")
  //   .update({
  //     offer_letter_url: url,
  //     updated_at: new Date().toISOString(),
  //   })
  //   .eq("id", userId);

  // if (error) {
  //   console.error("Error updating offer letter URL:", error);
  //   return false;
  // }
  // return true;
}

export async function getEmployeeDocuments(userId: string) {
  try {
    const response = await NodeApiClient.get(
      `/profile/${userId}/documents/all`
    );

    const data = response.data;

    return {
      work_experience: data?.work_experience ?? [],
      education_details: data?.education_details ?? [],
      identity_documents: data?.identity_documents ?? {},
      offer_letter_url: data?.offer_letter_url ?? null,
    };
  } catch (error) {
    console.error("[PROFILE] Error fetching employee documents:", error);
    return null;
  }
  // const { data, error } = await supabase
  //   .from("profiles")
  //   .select(
  //     "work_experience, education_details, identity_documents, offer_letter_url"
  //   )
  //   .eq("id", userId)
  //   .single();

  // if (error) {
  //   console.error("Error fetching employee documents:", error);
  //   return null;
  // }

  // return {
  //   work_experience:
  //     (data.work_experience as unknown as WorkExperience[] | null) || [],
  //   education_details:
  //     (data.education_details as unknown as EducationDetail[] | null) || [],
  //   identity_documents:
  //     (data.identity_documents as unknown as IdentityDocuments | null) || {},
  //   offer_letter_url: data.offer_letter_url,
  // };
}
