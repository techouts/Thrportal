import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";
import NodeApiClient from "@/services/nodeApiClient";

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: string;
  is_optional: boolean;
  location: string;
  year: number;
}

export interface WeeklyHoliday {
  date: string;
  name: string;
  dayIndex: number;
}

const QUERY_KEYS = {
  holidays: "holidays",
  upcomingHolidays: "upcomingHolidays",
  weeklyHolidays: "weeklyHolidays",
};

export function useHolidays(year: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.holidays, year],
    queryFn: async (): Promise<Holiday[]> => {
      const response = await NodeApiClient.get("/holidays/filter", {
        params: { year },
      });

      // assuming API already returns sorted by date
      return response.data as Holiday[];
    },
  });
}

// export function useUpcomingHolidays(limit: number = 5) {
//   const today = new Date().toISOString().split("T")[0];

//   return useQuery({
//     queryKey: [QUERY_KEYS.upcomingHolidays, limit],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("holidays")
//         .select("*")
//         .gte("date", today)
//         .order("date", { ascending: true })
//         .limit(limit);

//       if (error) throw error;
//       return data as Holiday[];
//     },
//   });
// }

export function useWeeklyHolidays(weekStart: Date) {
  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weekEnd = addDays(weekStart, 6);
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");

  return useQuery({
    queryKey: [QUERY_KEYS.weeklyHolidays, weekStartStr],
    queryFn: async () => {
      // const { data, error } = await supabase
      //   .from("holidays")
      //   .select("*")
      //   .gte("date", weekStartStr)
      //   .lte("date", weekEndStr)
      //   .order("date", { ascending: true });

      // if (error) throw error;
      const response = await NodeApiClient.get("/holidays/filter", {
        params: {
          from_date: weekStartStr,
          to_date: weekEndStr,
        },
      });
      const data = response.data as Holiday[];

      // Map holidays to include day index
      const holidays: WeeklyHoliday[] = (data || []).map((holiday) => {
        const holidayDate = new Date(holiday.date);
        const dayIndex = Math.round(
          (holidayDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          date: holiday.date,
          name: holiday.name,
          dayIndex,
        };
      });

      return holidays;
    },
  });
}

export function useAllHolidaysForNavigation() {
  const today = new Date().toISOString().split("T")[0];
  const currentYear = new Date().getFullYear();

  return useQuery({
    queryKey: ["allHolidaysNav", currentYear, "v2"],
    queryFn: async () => {
      const years = `${currentYear - 1},${currentYear},${currentYear + 1}`;
      const { data } = await NodeApiClient.get("/holidays/filter", {
        params: {
          year: years, // matches: ?year=2024,2025,2026
        },
      });
      // const { data, error } = await supabase
      //   .from("holidays")
      //   .select("*")
      //   .in("year", [currentYear - 1, currentYear, currentYear + 1])
      //   .order("date", { ascending: true });

      // if (error) throw error;

      const holidays = data as Holiday[];
      console.log("[Holidays] Fetched count:", holidays.length, "Years:", [
        ...new Set(holidays.map((h) => h.year)),
      ]);

      const firstUpcomingIndex = holidays.findIndex((h) => h.date >= today);

      return {
        holidays,
        firstUpcomingIndex: firstUpcomingIndex >= 0 ? firstUpcomingIndex : 0,
      };
    },
    staleTime: 0,
  });
}
