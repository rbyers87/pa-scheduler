import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ScheduleDisplay } from "./ScheduleDisplay";
import { useScheduleOperations } from "./hooks/useScheduleOperations";
import { useScheduleQuery } from "./hooks/useScheduleQuery";
import { generateTimeBlocks } from "./utils/scheduleUtils";
import { ScheduleData } from "./types/TimeBlock";

interface DailyScheduleProps {
  date: Date;
}

export function DailySchedule({ date }: DailyScheduleProps) {
  const { session } = useAuth();
  const { handleDeleteSchedule, handleUpdateSchedule } = useScheduleOperations();
  const { data: schedules, refetch, isLoading, error } = useScheduleQuery(date, session?.user?.id);

  const handleScheduleResize = (scheduleId: string, startBlock: number, endBlock: number) => {
    const startTime = new Date(date);
    startTime.setHours(Math.floor(startBlock / 4), (startBlock % 4) * 15, 0);

    const endTime = new Date(date);
    endTime.setHours(Math.floor(endBlock / 4), (endBlock % 4) * 15, 0);

    handleUpdateSchedule(scheduleId, startTime, endTime);
  };

  const handleRecurringUpdate = async (data: Partial<ScheduleData>) => {
    try {
      const { error } = await supabase
        .from("recurring_schedules")
        .update(data)
        .eq("id", data.id);

      if (error) throw error;

      refetch();
    } catch (error) {
      console.error("Error updating recurring schedule:", error);
    }
  };

  if (error) {
    return <div className="p-4 text-red-500">Error loading schedules: {error.message}</div>;
  }

  if (isLoading) {
    return <div className="p-4">Loading schedules...</div>;
  }

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