import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: string;
  is_optional: boolean;
  location: string;
  year: number;
}

const QUERY_KEYS = {
  holidays: 'holidays',
  upcomingHolidays: 'upcomingHolidays',
};

export function useHolidays(year: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.holidays, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .eq('year', year)
        .order('date', { ascending: true });

      if (error) throw error;
      return data as Holiday[];
    },
  });
}

export function useUpcomingHolidays(limit: number = 5) {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: [QUERY_KEYS.upcomingHolidays, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data as Holiday[];
    },
  });
}
