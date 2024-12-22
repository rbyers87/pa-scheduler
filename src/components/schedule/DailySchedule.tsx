import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ScheduleDisplay } from "./ScheduleDisplay";
import { useScheduleOperations } from "./hooks/useScheduleOperations";
import { useScheduleQuery } from "./hooks/useScheduleQuery";
import { generateTimeBlocks } from "./utils/scheduleUtils";
import { ScheduleData } from "./types/TimeBlock";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DailyScheduleProps {
  date: Date;
}

export function DailySchedule({ date: initialDate }: DailyScheduleProps) {
  const { session } = useAuth();
  const [date, setDate] = React.useState<Date>(initialDate);
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

  const handlePreviousDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);
    setDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    setDate(newDate);
  };

  if (error) {
    return <div className="p-4 text-red-500">Error loading schedules: {error.message}</div>;
  }

  if (isLoading) {
    return <div className="p-4">Loading schedules...</div>;
  }

  return (
    <Card className="p-4 h-[calc(100vh-100px)] overflow-hidden">
      <div className="mb-4 space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={handlePreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold text-center">
            {format(date, "EEEE, MMMM d, yyyy")}
          </h3>
          <Button variant="outline" size="icon" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            className="rounded-md border"
          />
        </div>
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