import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function ScheduleCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["schedules", date ? format(date, "yyyy-MM") : null],
    queryFn: async () => {
      if (!date) return [];
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from("schedules")
        .select(`
          *,
          employee:profiles(first_name, last_name)
        `)
        .gte("start_time", startOfMonth.toISOString())
        .lte("end_time", endOfMonth.toISOString());

      if (error) throw error;
      return data;
    },
    enabled: !!date
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Schedule</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
        {isLoading && <p>Loading schedules...</p>}
        {schedules && schedules.length > 0 && (
          <div className="mt-4">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="text-sm">
                {schedule.employee.first_name} {schedule.employee.last_name}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}