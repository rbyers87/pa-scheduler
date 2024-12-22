import { format, startOfDay, endOfDay } from "date-fns";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ScheduleBlock {
  title: string;
  rows: {
    position: string;
    name: string;
    schedules?: Array<{
      start_time: string;
      end_time: string;
    }>;
  }[];
}

interface DailyBlocksViewProps {
  date: Date;
}

export function DailyBlocksView({ date }: DailyBlocksViewProps) {
  const { session } = useAuth();
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const { data: schedules } = useQuery({
    queryKey: ["daily-schedules", date],
    queryFn: async () => {
      console.log("DailyBlocksView: Fetching schedules for date:", date);

      if (!session?.user?.id) {
        console.error("DailyBlocksView: No authenticated user found");
        throw new Error("You must be logged in to view schedules");
      }

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
        .gte("start_time", dayStart.toISOString())
        .lte("end_time", dayEnd.toISOString());

      if (regularError) {
        console.error("DailyBlocksView: Error fetching regular schedules:", regularError);
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
        .lte("begin_date", dayEnd.toISOString())
        .or(`end_date.gt.${dayStart.toISOString()},end_date.is.null`);

      if (recurringError) {
        console.error("DailyBlocksView: Error fetching recurring schedules:", recurringError);
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

      return [...regularSchedules, ...generatedSchedules];
    },
    enabled: !!session?.user?.id,
  });

  // Sample data structure - replace with actual data from your backend
  const blocks: ScheduleBlock[] = [
    {
      title: "Battalion 1",
      rows: [
        { 
          position: "Battalion Chief", 
          name: "Teresa Hardy",
          schedules: schedules?.filter(s => 
            s.employee.first_name === "Teresa" && 
            s.employee.last_name === "Hardy"
          )
        },
      ],
    },
    {
      title: "Engine 1",
      rows: [
        { 
          position: "Captain", 
          name: "Sue Heath",
          schedules: schedules?.filter(s => 
            s.employee.first_name === "Sue" && 
            s.employee.last_name === "Heath"
          )
        },
        { 
          position: "Lieutenant", 
          name: "Perry Barker",
          schedules: schedules?.filter(s => 
            s.employee.first_name === "Perry" && 
            s.employee.last_name === "Barker"
          )
        },
        { 
          position: "Driver", 
          name: "Jonathan Langston",
          schedules: schedules?.filter(s => 
            s.employee.first_name === "Jonathan" && 
            s.employee.last_name === "Langston"
          )
        },
        { 
          position: "Firefighter", 
          name: "Bob Dartsch",
          schedules: schedules?.filter(s => 
            s.employee.first_name === "Bob" && 
            s.employee.last_name === "Dartsch"
          )
        },
        { position: "Minimum Staffing", name: "" },
      ],
    },
  ];

  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 7); // 7:00 to 15:00

  const getScheduleStyle = (startHour: number, schedules?: Array<{ start_time: string; end_time: string }>) => {
    if (!schedules || schedules.length === 0) return "";
    
    const schedule = schedules[0]; // For now, just handle the first schedule
    const start = new Date(schedule.start_time);
    const end = new Date(schedule.end_time);
    
    if (start.getHours() <= startHour && end.getHours() > startHour) {
      return "bg-blue-500 text-white";
    }
    
    return "";
  };

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Daily Blocks View</h2>
          <span className="text-muted-foreground">
            {format(date, "EEE, MMM d, yyyy")}
          </span>
        </div>

        {blocks.map((block, blockIndex) => (
          <div key={blockIndex} className="space-y-2">
            <h3 className="font-semibold text-lg">{block.title}</h3>
            <div className="border rounded-lg overflow-hidden">
              {/* Time header */}
              <div className="flex border-b bg-muted/50">
                <div className="w-40 border-r p-2 bg-background">Position</div>
                {timeSlots.map((hour) => (
                  <div
                    key={hour}
                    className="flex-1 p-2 text-center border-r last:border-r-0 min-w-[100px]"
                  >
                    {`${hour}:00`}
                  </div>
                ))}
              </div>

              {/* Schedule rows */}
              {block.rows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-40 border-r p-2 font-medium">
                    {row.position}
                  </div>
                  <div className="flex flex-1">
                    {timeSlots.map((hour) => (
                      <div
                        key={hour}
                        className={`flex-1 p-2 border-r last:border-r-0 ${getScheduleStyle(hour, row.schedules)}`}
                      >
                        {hour === timeSlots[0] && row.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}