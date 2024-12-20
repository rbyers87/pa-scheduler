import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ScheduleDisplay } from "./ScheduleDisplay";
import { useScheduleOperations } from "./hooks/useScheduleOperations";
import { TimeBlock } from "./types/TimeBlock";  // Importing the TimeBlock type

interface DailyScheduleProps {
  date: Date;
}

export function DailySchedule({ date }: DailyScheduleProps) {
  const { toast } = useToast();
  const { session } = useAuth();
  const { handleDeleteSchedule, handleUpdateSchedule } = useScheduleOperations();

  const { data: schedules, refetch, isLoading, error } = useQuery<TimeBlock[]>({
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

      const allSchedules: TimeBlock[] = [...regularSchedules, ...generatedSchedules];
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

  if (error) {
    return <div className="p-4 text-red-500">Error loading schedules: {error.message}</div>;
  }

  if (isLoading) {
    return <div className="p-4">Loading schedules...</div>;
  }

  // Function to generate time blocks for the day
  function generateTimeBlocks(schedules: any[], date: Date) {
    const blocks: any[] = [];
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Create a list of all time blocks for the given day
    for (let time = startOfDay.getTime(); time <= endOfDay.getTime(); time += 900000) { // 900000 ms = 15 minutes
      const blockTime = new Date(time);
      blocks.push({
        time: format(blockTime, "HH:mm"),
        hasSchedule: false,
        scheduleId: "",
        employeeName: "",
      });
    }

    // Now, map the schedules to the time blocks
    schedules.forEach((schedule) => {
      const startTime = new Date(schedule.start_time);
      const endTime = new Date(schedule.end_time);
      const employeeName = `${schedule.employee.first_name} ${schedule.employee.last_name}`;

      // Mark time blocks as having a schedule within the schedule's time range
      blocks.forEach((block) => {
        const blockTime = new Date(`${date.toISOString().split("T")[0]}T${block.time}:00`);
        if (blockTime >= startTime && blockTime < endTime) {
          block.hasSchedule = true;
          block.scheduleId = schedule.id;
          block.employeeName = employeeName;
        }
      });
    });

    return blocks;
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
        <ScheduleDisplay
          timeBlocks={generateTimeBlocks(schedules, date)}
          onDelete={handleDeleteSchedule}
          onScheduleUpdate={refetch}
          onScheduleResize={handleUpdateSchedule}
        />
      </div>
    </Card>
  );
}
