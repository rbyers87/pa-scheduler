import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { TimeBlock } from "./types/TimeBlock";
import { ScheduleDisplay } from "./ScheduleDisplay";
import { useScheduleOperations } from "./hooks/useScheduleOperations";

interface DailyScheduleProps {
  date: Date;
}

export function DailySchedule({ date }: DailyScheduleProps) {
  const { toast } = useToast();
  const { session } = useAuth();
  const { handleDeleteSchedule } = useScheduleOperations();
  
  const { data: schedules, refetch, isLoading, error } = useQuery({
    queryKey: ["schedules", date],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.error("DailySchedule: No authenticated user found");
        throw new Error("You must be logged in to view schedules");
      }

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      console.log("DailySchedule: Querying schedules with params:", {
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString(),
        userId: session.user.id
      });

      const { data, error } = await supabase
        .from("schedules")
        .select(`
          id,
          start_time,
          end_time,
          employee:profiles (
            first_name,
            last_name
          )
        `)
        .gte("start_time", startOfDay.toISOString())
        .lte("end_time", endOfDay.toISOString());

      if (error) {
        console.error("DailySchedule: Supabase query error:", error);
        throw error;
      }
      
      console.log("DailySchedule: Successfully fetched schedules:", data);
      return data;
    },
    meta: {
      onError: (error: Error) => {
        console.error("DailySchedule: Query error:", error);
        toast({
          title: "Error loading schedules",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    enabled: !!session?.user?.id
  });

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading schedules: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4">Loading schedules...</div>;
  }

  // Generate time blocks for the day (96 blocks of 15 minutes each)
  const timeBlocks: TimeBlock[] = Array.from({ length: 96 }, (_, index) => {
    const hours = Math.floor(index / 4);
    const minutes = (index % 4) * 15;
    const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return { time, hasSchedule: false };
  });

  // Map schedules to time blocks
  if (schedules) {
    schedules.forEach((schedule) => {
      const startTime = new Date(schedule.start_time);
      const endTime = new Date(schedule.end_time);
      
      const startIndex = (startTime.getHours() * 4) + Math.floor(startTime.getMinutes() / 15);
      const endIndex = (endTime.getHours() * 4) + Math.floor(endTime.getMinutes() / 15);
      
      for (let i = startIndex; i < endIndex; i++) {
        if (timeBlocks[i]) {
          timeBlocks[i].hasSchedule = true;
          timeBlocks[i].scheduleId = schedule.id;
          timeBlocks[i].employeeName = `${schedule.employee.first_name} ${schedule.employee.last_name}`;
        }
      }
    });
  }

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          {format(date, "EEEE, MMMM d, yyyy")}
        </h3>
      </div>
      <ScheduleDisplay 
        timeBlocks={timeBlocks}
        onDelete={handleDeleteSchedule}
        onScheduleUpdate={refetch}
      />
    </Card>
  );
}