import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface TimeBlock {
  time: string;
  hasSchedule: boolean;
  scheduleId?: string;
  employeeName?: string;
}

interface Schedule {
  id: string;
  start_time: string;
  end_time: string;
  employee: {
    first_name: string;
    last_name: string;
  };
}

interface DailyScheduleProps {
  date: Date;
}

export function DailySchedule({ date }: DailyScheduleProps) {
  const { toast } = useToast();
  const { session } = useAuth();
  
  // Generate time blocks for the day (96 blocks of 15 minutes each)
  const timeBlocks: TimeBlock[] = Array.from({ length: 96 }, (_, index) => {
    const hours = Math.floor(index / 4);
    const minutes = (index % 4) * 15;
    const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return { time, hasSchedule: false };
  });

  const { data: schedules, refetch, isLoading, error } = useQuery({
    queryKey: ["schedules", date],
    queryFn: async () => {
      console.log("DailySchedule: Fetching schedules - Auth state:", { 
        isAuthenticated: !!session,
        userId: session?.user?.id 
      });

      if (!session?.user?.id) {
        console.error("DailySchedule: No authenticated user found");
        throw new Error("You must be logged in to view schedules");
      }

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

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
        .gte("start_time", startOfDay.toISOString())
        .lte("end_time", endOfDay.toISOString());

      if (error) {
        console.error("DailySchedule: Supabase query error:", error);
        throw error;
      }
      
      console.log("DailySchedule: Successfully fetched schedules:", data);
      return data as Schedule[];
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
    enabled: !!session?.user?.id // Only run query when user is authenticated
  });

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to delete schedules",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("schedules")
        .delete()
        .eq("id", scheduleId);

      if (error) throw error;

      toast({
        title: "Schedule deleted",
        description: "The schedule has been removed successfully.",
      });

      refetch();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast({
        title: "Error",
        description: "Failed to delete schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

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
      <div className="overflow-x-auto">
        <div className="flex min-w-[200%] md:min-w-full">
          {timeBlocks.map((block, index) => {
            const isStart = !timeBlocks[index - 1]?.hasSchedule && block.hasSchedule;
            
            return (
              <div
                key={block.time}
                className={`
                  flex-1 min-w-[30px] h-20 border-r border-gray-200 relative
                  ${block.hasSchedule ? 'bg-blue-100' : 'bg-gray-50'}
                `}
              >
                <div className="absolute -top-6 text-xs">
                  {block.time}
                </div>
                {isStart && block.employeeName && (
                  <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-1 bg-blue-200 text-xs">
                    <span>{block.employeeName}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => block.scheduleId && handleDeleteSchedule(block.scheduleId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}