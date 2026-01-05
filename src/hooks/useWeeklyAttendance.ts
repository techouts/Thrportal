import { useState, useEffect } from 'react'
import { format, addDays } from 'date-fns'
import { supabase } from '@/integrations/supabase/client'

interface AttendanceHours {
  daily: string[] // Array of 7 formatted strings (e.g., ["8:30", "0:00", ...])
  weekTotal: string
}

// Convert decimal hours to HH:MM format
const formatDecimalToTime = (decimal: number | null): string => {
  if (!decimal || decimal === 0) return '0:00'
  const hours = Math.floor(decimal)
  const minutes = Math.round((decimal - hours) * 60)
  return `${hours}:${minutes.toString().padStart(2, '0')}`
}

// Convert HH:MM string to decimal for summing
const timeToDecimal = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours + minutes / 60
}

// Sum an array of time strings and return formatted result
const sumTimeStrings = (times: string[]): string => {
  const totalDecimal = times.reduce((sum, time) => sum + timeToDecimal(time), 0)
  return formatDecimalToTime(totalDecimal)
}

export function useWeeklyAttendance(employeeId: string, weekStart: Date) {
  const [attendanceHours, setAttendanceHours] = useState<AttendanceHours>({
    daily: ['0:00', '0:00', '0:00', '0:00', '0:00', '0:00', '0:00'],
    weekTotal: '0:00'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!employeeId) return

      setLoading(true)
      try {
        // Calculate date range for the week (Mon-Sun)
        const startDate = format(weekStart, 'yyyy-MM-dd')
        const endDate = format(addDays(weekStart, 6), 'yyyy-MM-dd')

        const { data, error } = await supabase
          .from('attendance_records')
          .select('date, total_hours')
          .eq('employee_id', employeeId)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true })

        if (error) {
          console.error('Error fetching attendance:', error)
          return
        }

        // Create a map of date -> total_hours
        const attendanceMap = new Map<string, number>()
        data?.forEach(record => {
          attendanceMap.set(record.date, record.total_hours || 0)
        })

        // Build array for each day of the week (Mon-Sun)
        const daily: string[] = []
        for (let i = 0; i < 7; i++) {
          const dayDate = format(addDays(weekStart, i), 'yyyy-MM-dd')
          const hours = attendanceMap.get(dayDate) || 0
          daily.push(formatDecimalToTime(hours))
        }

        const weekTotal = sumTimeStrings(daily)

        setAttendanceHours({ daily, weekTotal })
      } catch (error) {
        console.error('Error fetching attendance:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [employeeId, weekStart])

  return { attendanceHours, loading }
}
