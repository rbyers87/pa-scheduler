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
  const { handleDeleteSchedule, handleUpdateSchedule } = useScheduleOperations();

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

      if (regularError) throw regularError;

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

      if (recurringError) throw recurringError;

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
            isRecurring: true,
          };
        });

      const allSchedules = [...regularSchedules, ...generatedSchedules];
      console.log("DailySchedule: Successfully fetched all schedules:", allSchedules);
      return allSchedules;
    },
    meta: {
      onError: (error: Error) => {
        console.error("DailySchedule: Query error:", error);
        toast({
          title: "Error loading schedules",
          description: error.message,
          variant: "destructive",
        });
      },
    },
    enabled: !!session?.user?.id,
  });

  const handleScheduleResize = async (
    scheduleId: string,
    startBlock: number,
    endBlock: number
  ) => {
    const startTime = new Date(date);
    const endTime = new Date(date);

    const startHours = Math.floor(startBlock / 4);
    const startMinutes = (startBlock % 4) * 15;
    const endHours = Math.floor(endBlock / 4);
    const endMinutes = (endBlock % 4) * 15;

    startTime.setHours(startHours, startMinutes, 0, 0);
    endTime.setHours(endHours, endMinutes, 0, 0);

    if (!scheduleId.includes("-")) {
      await handleUpdateSchedule(scheduleId, startTime, endTime);
      refetch();
    } else {
      toast({
        title: "Cannot modify recurring schedule",
        description: "Recurring schedules must be modified through the recurring schedule form.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return <div className="p-4 text-red-500">Error loading schedules: {error.message}</div>;
  }

  if (isLoading) {
    return <div className="p-4">Loading schedules...</div>;
  }

  const timeBlocks: TimeBlock[] = Array.from({ length: 96 }, (_, index) => {
    const hours = Math.floor(index / 4);
    const minutes = (index % 4) * 15;
    const time = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
    return { time, hasSchedule: false };
  });

  if (schedules) {
    schedules.forEach((schedule) => {
      const startTime = new Date(schedule.start_time);
      const endTime = new Date(schedule.end_time);

      const startIndex =
        startTime.getHours() * 4 + Math.floor(startTime.getMinutes() / 15);
      const endIndex =
        endTime.getHours() * 4 + Math.floor(endTime.getMinutes() / 15);

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
    <Card className="p-4 h-[calc(100vh-100px)] overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-center sm:text-left">
          {format(date, "EEEE, MMMM d, yyyy")}
        </h3>
      </div>
      <div className="relative h-full overflow-auto">
        {/* Schedule Blocks */}
        <div className="grid grid-cols-96 gap-1">
          <ScheduleDisplay
            timeBlocks={timeBlocks}
            onDelete={handleDeleteSchedule}
            onScheduleUpdate={refetch}
            onScheduleResize={handleScheduleResize}
          />
        </div>
      </div>
    </Card>
  );
}
