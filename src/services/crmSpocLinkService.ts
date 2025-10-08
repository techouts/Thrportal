import { supabase } from '@/integrations/supabase/client';
import type { CrmSpocLink } from '@/types/crm';

export class CrmSpocLinkService {
  static async createSpocLink(link: Omit<CrmSpocLink, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('crm_spoc_links')
      .insert(link)
      .select()
      .single();

    if (error) throw error;
    return data as CrmSpocLink;
  }

  static async getAllSpocLinks() {
    const { data, error } = await supabase
      .from('crm_spoc_links')
      .select('*');

    if (error) throw error;
    return data as CrmSpocLink[];
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
