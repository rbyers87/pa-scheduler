import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ScheduleDisplay } from "./ScheduleDisplay";
import { useScheduleOperations } from "./hooks/useScheduleOperations";
import { TimeBlock, ScheduleData } from "./types/TimeBlock";

interface DailyScheduleProps {
  date: Date;
}

export function DailySchedule({ date }: DailyScheduleProps) {
  const { toast } = useToast();
  const { session } = useAuth();
  const { handleDeleteSchedule, handleUpdateSchedule } = useScheduleOperations();

  const { data: schedules, refetch, isLoading, error } = useQuery<ScheduleData[]>({
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

      if (regularError) {
        console.error("DailySchedule: Error fetching regular schedules:", regularError);
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
        console.error("DailySchedule: Error fetching recurring schedules:", recurringError);
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

  const handleRecurringUpdate = async (data: Partial<ScheduleData>) => {
    try {
      const { error } = await supabase
        .from("recurring_schedules")
        .update(data)
        .eq("id", data.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recurring schedule updated successfully",
      });

      refetch(); // Refresh schedules after update
    } catch (error) {
      console.error("Error updating recurring schedule:", error);
      toast({
        title: "Error",
        description: "Failed to update recurring schedule",
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

  const generateTimeBlocks = (schedules: ScheduleData[], date: Date): TimeBlock[] => {
    const blocks: TimeBlock[] = [];
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    for (let time = startOfDay.getTime(); time <= endOfDay.getTime(); time += 900000) {
      const blockTime = new Date(time);
      blocks.push({
        time: format(blockTime, "HH:mm"),
        schedules: [],
      });
    }

    schedules.forEach((schedule) => {
      if (!schedule.start_time || !schedule.end_time || !schedule.employee) return;

      const startTime = new Date(schedule.start_time);
      const endTime = new Date(schedule.end_time);
      const employeeName = `${schedule.employee.first_name} ${schedule.employee.last_name}`;

      blocks.forEach((block) => {
        if (!block.time) return;
        const blockTime = new Date(`${date.toISOString().split("T")[0]}T${block.time}:00`);
        if (blockTime >= startTime && blockTime < endTime) {
          block.schedules.push({
            scheduleId: schedule.id,
            employeeName: employeeName,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
          });
        }
      });
    });

    return blocks;
  };

  const handleScheduleResize = (scheduleId: string, startBlock: number, endBlock: number) => {
    const startTime = new Date(date);
    startTime.setHours(Math.floor(startBlock / 4), (startBlock % 4) * 15, 0);

    const endTime = new Date(date);
    endTime.setHours(Math.floor(endBlock / 4), (endBlock % 4) * 15, 0);

    handleUpdateSchedule(scheduleId, startTime, endTime);
  };

  return (
    <Card className="p-4 h-[calc(100vh-100px)] overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-center sm:text-left">
          {format(date, "EEEE, MMMM d, yyyy")}
        </h3>
      </div>
      <div className="relative h-full overflow-auto">
        <ScheduleDisplay
          timeBlocks={generateTimeBlocks(schedules || [], date)}
          onDelete={handleDeleteSchedule}
          onScheduleUpdate={handleRecurringUpdate}
          onScheduleResize={handleScheduleResize}
        />
      </div>
    </Card>
  );
}