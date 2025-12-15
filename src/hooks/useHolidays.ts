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

export function useAllHolidaysForNavigation() {
  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();
  
  return useQuery({
    queryKey: ['allHolidaysNav', currentYear, 'v2'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .in('year', [currentYear - 1, currentYear, currentYear + 1])
        .order('date', { ascending: true });

      if (error) throw error;
      
      const holidays = data as Holiday[];
      console.log('[Holidays] Fetched count:', holidays.length, 'Years:', [...new Set(holidays.map(h => h.year))]);
      
      const firstUpcomingIndex = holidays.findIndex(h => h.date >= today);
      
      return { 
        holidays, 
        firstUpcomingIndex: firstUpcomingIndex >= 0 ? firstUpcomingIndex : 0 
      };
    },
    staleTime: 0,
  });
}
