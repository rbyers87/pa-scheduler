import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, addDays, isSameDay, startOfDay } from "date-fns";

export function FutureSchedule() {
  const { session } = useAuth();

  // Fetch regular schedules
  const { data: regularSchedules } = useQuery({
    queryKey: ["future-schedules", session?.user?.id],
    queryFn: async () => {
      const today = new Date();
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("employee_id", session?.user?.id)
        .gte("start_time", today.toISOString())
        .order("start_time", { ascending: true })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Fetch recurring schedules
  const { data: recurringSchedules } = useQuery({
    queryKey: ["recurring-schedules", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recurring_schedules")
        .select(`
          *,
          shifts (
            name,
            start_time,
            end_time
          )
        `)
        .eq("employee_id", session?.user?.id)
        .order("begin_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Process recurring schedules to get next occurrences
  const getNextRecurringSchedules = () => {
    if (!recurringSchedules) return [];
    
    const today = startOfDay(new Date());
    const nextTwoWeeks = addDays(today, 14);
    const schedules = [];

    recurringSchedules.forEach((recSchedule) => {
      let currentDate = new Date(recSchedule.begin_date);
      
      while (currentDate <= nextTwoWeeks) {
        if (recSchedule.days.includes(currentDate.getDay()) && 
            currentDate >= today &&
            (!recSchedule.end_date || currentDate <= new Date(recSchedule.end_date))) {
          
          const shift = recSchedule.shifts;
          if (shift) {
            const [startHours, startMinutes] = shift.start_time.split(':');
            const [endHours, endMinutes] = shift.end_time.split(':');
            
            const startTime = new Date(currentDate);
            startTime.setHours(parseInt(startHours), parseInt(startMinutes), 0);
            
            const endTime = new Date(currentDate);
            endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0);

            schedules.push({
              date: currentDate,
              startTime,
              endTime,
              isRecurring: true,
              shiftName: shift.name,
            });
          }
        }
        currentDate = addDays(currentDate, 1);
      }
    });

    return schedules;
  };

  // Combine and sort all schedules
  const getAllSchedules = () => {
    const regular = (regularSchedules || []).map(schedule => ({
      date: new Date(schedule.start_time),
      startTime: new Date(schedule.start_time),
      endTime: new Date(schedule.end_time),
      isRecurring: false,
    }));

    const recurring = getNextRecurringSchedules();
    
    return [...regular, ...recurring].sort((a, b) => 
      a.startTime.getTime() - b.startTime.getTime()
    );
  };

  const combinedSchedules = getAllSchedules();

  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {combinedSchedules.map((schedule, index) => (
            <TableRow key={`${schedule.date.toISOString()}-${index}`}>
              <TableCell>
                {format(schedule.date, "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                {format(schedule.startTime, "h:mm a")}
              </TableCell>
              <TableCell>
                {format(schedule.endTime, "h:mm a")}
              </TableCell>
              <TableCell>
                {schedule.isRecurring ? (
                  <span className="text-blue-600">
                    Recurring {schedule.shiftName}
                  </span>
                ) : (
                  <span className="text-gray-600">Regular</span>
                )}
              </TableCell>
            </TableRow>
          ))}
          {combinedSchedules.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                No upcoming schedules found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}