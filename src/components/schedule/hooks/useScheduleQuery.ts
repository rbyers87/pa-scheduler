import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScheduleData } from "../types/TimeBlock";

export function useScheduleQuery(date: Date, userId: string | undefined) {
  const { toast } = useToast();

  return useQuery<ScheduleData[]>({
    queryKey: ["schedules", date],
    queryFn: async () => {
      if (!userId) {
        console.error("useScheduleQuery: No authenticated user found");
        throw new Error("You must be logged in to view schedules");
      }

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: regularSchedules, error: regularError } = await supabase
        .from("schedules")
        .select(`
          id,
          start_time,
          end_time,
          employee:profiles(
            first_name,
            last_name
          )
        `)
        .gte("start_time", startOfDay.toISOString())
        .lte("end_time", endOfDay.toISOString());

      if (regularError) {
        console.error("useScheduleQuery: Error fetching regular schedules:", regularError);
        throw regularError;
      }

      const { data: recurringSchedules, error: recurringError } = await supabase
        .from("recurring_schedules")
        .select(`
          id,
          days,
          employee:profiles(
            first_name,
            last_name
          ),
          shift:shifts(
            start_time,
            end_time
          )
        `)
        .lte("begin_date", endOfDay.toISOString())
        .or(`end_date.gt.${startOfDay.toISOString()},end_date.is.null`);

      if (recurringError) {
        console.error("useScheduleQuery: Error fetching recurring schedules:", recurringError);
        throw recurringError;
      }

      const dayOfWeek = date.getDay();
      const generatedSchedules = recurringSchedules
        .filter((recurring) => recurring.days.includes(dayOfWeek))
        .map((recurring) => {
          const startTime = new Date(date);
          const endTime = new Date(date);

          const [startHours, startMinutes] = recurring.shift.start_time.split(":");
          const [endHours, endMinutes] = recurring.shift.end_time.split(":");

          startTime.setHours(parseInt(startHours), parseInt(startMinutes), 0);
          endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0);

          return {
            id: `${recurring.id}-${date.toISOString()}`,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            employee: recurring.employee,
          };
        });

      const allSchedules = [...regularSchedules, ...generatedSchedules] as ScheduleData[];
      console.log("useScheduleQuery: Successfully fetched all schedules:", allSchedules);
      return allSchedules;
    },
    meta: {
      onError: (error: Error) => {
        console.error("useScheduleQuery: Query error:", error);
        toast({
          title: "Error loading schedules",
          description: error.message,
          variant: "destructive",
        });
      },
    },
    enabled: !!userId,
  });
}