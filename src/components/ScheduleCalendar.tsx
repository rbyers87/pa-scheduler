import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        .select(`*, employee:profiles(first_name, last_name)`)
        .gte("start_time", startOfMonth.toISOString())
        .lte("end_time", endOfMonth.toISOString());

      if (error) throw error;
      return data;
    },
    enabled: !!date,
  });

  // Map your schedule data to FullCalendar events format
  const events = schedules?.map((schedule) => ({
    title: `${schedule.employee.first_name} ${schedule.employee.last_name}`,
    start: schedule.start_time,
    end: schedule.end_time,
    extendedProps: {
      employeeId: schedule.employee.id,
    },
  })) || [];

  // Handle event drag-and-drop
  const handleEventDrop = (info: any) => {
    // Handle saving the new event time to the backend or updating the state
    console.log("Event moved to:", info.event.start, info.event.end);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Schedule</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          slotDuration="00:15:00"
          allDaySlot={false}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          events={events}
          editable={true}
          eventDrop={handleEventDrop}
          eventResize={handleEventDrop} // Optional: to handle resize events
          dateClick={(info) => setDate(info.date)} // Update selected date
        />
        {isLoading && <p>Loading schedules...</p>}
      </CardContent>
    </Card>
  );
}
