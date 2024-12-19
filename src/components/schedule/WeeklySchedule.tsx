import { addDays, startOfWeek } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DaySchedule } from "./DaySchedule";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function WeeklySchedule() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: schedules, refetch } = useQuery({
    queryKey: ["schedules", weekStart],
    queryFn: async () => {
      console.log("WeeklySchedule: Fetching schedules for week:", weekStart);

      if (!session?.user?.id || !session?.access_token) {
        console.error("WeeklySchedule: No authenticated user or access token found");
        throw new Error("You must be logged in to view schedules");
      }

      const weekEnd = addDays(weekStart, 7);

      // First get regular schedules
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
        .gte("start_time", weekStart.toISOString())
        .lt("start_time", weekEnd.toISOString())
        .set("Authorization", `Bearer ${session.access_token}`);

      if (regularError) {
        console.error("WeeklySchedule: Error fetching regular schedules:", regularError);
        throw regularError;
      }

      // Then get recurring schedules
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
        .lte("begin_date", weekEnd.toISOString())
        .or(`end_date.gt.${weekStart.toISOString()},end_date.is.null`)
        .set("Authorization", `Bearer ${session.access_token}`);

      if (recurringError) {
        console.error("WeeklySchedule: Error fetching recurring schedules:", recurringError);
        throw recurringError;
      }

      // Convert recurring schedules to regular schedule format
      const generatedSchedules = recurringSchedules.flatMap(recurring => {
        const schedules = [];
        let currentDate = new Date(weekStart);

        while (currentDate < weekEnd) {
          // Check if the current day is in the recurring schedule's days array
          if (recurring.days.includes(currentDate.getDay())) {
            // Create a new Date object for start and end times
            const startTime = new Date(currentDate);
            const endTime = new Date(currentDate);

            // Parse shift times (assuming they're in HH:MM:SS format)
            const [startHours, startMinutes] = recurring.shift.start_time.split(':');
            const [endHours, endMinutes] = recurring.shift.end_time.split(':');

            startTime.setHours(parseInt(startHours), parseInt(startMinutes), 0);
            endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0);

            schedules.push({
              id: `${recurring.id}-${currentDate.toISOString()}`,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              employee: recurring.employee,
              isRecurring: true
            });
          }
          currentDate = addDays(currentDate, 1);
        }
        return schedules;
      });

      const allSchedules = [...regularSchedules, ...generatedSchedules];
      console.log("WeeklySchedule: Successfully fetched all schedules:", allSchedules);
      return allSchedules;
    },
    meta: {
      onError: (error: Error) => {
        console.error("WeeklySchedule: Query error:", error);
        toast({
          title: "Error loading schedules",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    enabled: !!session?.user?.id && !!session?.access_token
  });

  const navigateWeek = (direction: "prev" | "next") => {
    setWeekStart(current => {
      const days = direction === "prev" ? -7 : 7;
      return addDays(current, days);
    });
  };

  const getDaySchedules = (date: Date) => {
    if (!schedules) return [];
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.start_time);
      return (
        scheduleDate.getFullYear() === date.getFullYear() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getDate() === date.getDate()
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateWeek("prev")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateWeek("next")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {Array.from({ length: 7 }, (_, i) => {
          const date = addDays(weekStart, i);
          return (
            <DaySchedule
              key={date.toISOString()}
              date={date}
              schedules={getDaySchedules(date)}
              onScheduleUpdate={refetch}
            />
          );
        })}
      </div>
    </div>
  );
}
