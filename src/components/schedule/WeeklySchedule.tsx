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
      
      if (!session?.user?.id) {
        console.error("WeeklySchedule: No authenticated user found");
        throw new Error("You must be logged in to view schedules");
      }

      const weekEnd = addDays(weekStart, 7);
      
      const { data, error } = await supabase
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
        .lt("start_time", weekEnd.toISOString());

      if (error) {
        console.error("WeeklySchedule: Error fetching schedules:", error);
        throw error;
      }

      console.log("WeeklySchedule: Successfully fetched schedules:", data);
      return data;
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
    enabled: !!session?.user?.id
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