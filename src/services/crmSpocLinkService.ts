import { supabase } from '@/integrations/supabase/client';
import type { CrmSpocLink } from '@/types/crm';
import axios,{AxiosInstance} from 'axios';
const VITE_API_BASE_NODE_URL = import.meta.env.VITE_API_BASE_NODE_URL;
const CRM_API_TIMEOUT = 30000
// Create axios instance
const CrmApiClient: AxiosInstance = axios.create({
  baseURL: VITE_API_BASE_NODE_URL,
  timeout: CRM_API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})
export class CrmSpocLinkService {
  static async createSpocLink(link: Omit<CrmSpocLink, 'id' | 'created_at'>) {
     try {
      const response = await CrmApiClient.post<CrmSpocLink>(
        "/crm/spoc-links",
        link
      );
      return response.data as CrmSpocLink;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Failed to create SPOCLink: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  static async getAllSpocLinks() {
     try {
      const response = await CrmApiClient.get<CrmSpocLink[]>(
        "/crm/spoc-links"
      );
      return response.data as CrmSpocLink[];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          `Unable to SPOC Links: ${error.message}`;
        throw new Error(msg);
      }
      throw error;
    }
  }

  static async getSpocLinksByEntity(entityType: 'client' | 'account' | 'project', entityId: string) {
    const { data, error } = await supabase
      .from('crm_spoc_links')
      .select(`
        *,
        spoc:crm_spocs(*)
      `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    if (error) throw error;
    return data as (CrmSpocLink & { spoc: any })[];
  }

  static async deleteSpocLink(id: string) {
    const { error } = await supabase
      .from('crm_spoc_links')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
