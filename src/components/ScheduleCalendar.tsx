import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RRule } from "rrule"; // Import the recurrence library

// Define the types for schedule and employee
interface Employee {
  first_name: string;
  last_name: string;
  id: string;
}

interface Schedule {
  id: string;
  start_time: string;
  end_time: string;
  recurrence: string | null; // Store recurrence pattern here, if any
  employee: Employee;
}

export function ScheduleCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: schedules, isLoading, error } = useQuery<Schedule[]>({
    queryKey: ["schedules", date ? format(date, "yyyy-MM") : null],
    queryFn: async () => {
      if (!date) return [];
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from("schedules")
        .select(`*, employee:profiles(first_name, last_name, id)`)
        .gte("start_time", startOfMonth.toISOString())
        .lte("end_time", endOfMonth.toISOString());

      if (error) throw error;
      return data || [];
    },
    enabled: !!date,
  });

  // Check for error loading data
  if (error) {
    return <div>Error loading schedule data!</div>;
  }

  // Helper function to generate recurring events
  const getRecurringEvents = (schedule: Schedule) => {
    if (!schedule.recurrence) return [schedule]; // If no recurrence, just return the original event.

    const rrule = new RRule({
      freq: RRule.WEEKLY, // Assume weekly recurrence for simplicity
      dtstart: new Date(schedule.start_time),
      until: new Date(schedule.end_time), // or set a custom end date for the recurrence
      count: 10, // Optional: specify how many occurrences
    });

    // Generate all dates for the recurring event
    const recurringDates = rrule.all();

    // Create events for all generated dates
    return recurringDates.map((date) => ({
      title: `${schedule.employee.first_name} ${schedule.employee.last_name}`,
      start: date.toISOString(),
      end: new Date(date.getTime() + (new Date(schedule.end_time).getTime() - new Date(schedule.start_time).getTime())).toISOString(),
      extendedProps: {
        employeeId: schedule.employee.id,
      },
    }));
  };

  // Map your schedule data to FullCalendar events format
  const events = schedules?.reduce((acc: any[], schedule) => {
    const recurringEvents = getRecurringEvents(schedule); // Get recurring events
    return [...acc, ...recurringEvents]; // Add them to the events array
  }, []) || [];

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
