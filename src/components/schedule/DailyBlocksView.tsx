import { format, startOfDay, endOfDay } from "date-fns";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UnitBlock } from "./blocks/UnitBlock";

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

  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 7); // 7:00 to 15:00

  const blocks = [
    {
      title: "Administration",
      rows: [
        { 
          position: "Deputy Chief", 
          name: "Ryan Byers",
          schedules: schedules?.filter(s => 
            s.employee.first_name === "Ryan" && 
            s.employee.last_name === "Byers"
          )
        },
      ],
    },
    {
      title: "Day Shift",
      rows: [
        { 
          position: "Lieutenant", 
          name: "Sue Heath",
          schedules: schedules?.filter(s => 
            s.employee.first_name === "Sue" && 
            s.employee.last_name === "Heath"
          )
        },
        { 
          position: "Sergeant", 
          name: "Perry Barker",
          schedules: schedules?.filter(s => 
            s.employee.first_name === "Perry" && 
            s.employee.last_name === "Barker"
          )
        },
        { 
          position: "FTO", 
          name: "Jonathan Langston",
          schedules: schedules?.filter(s => 
            s.employee.first_name === "Jonathan" && 
            s.employee.last_name === "Langston"
          )
        },
        { 
          position: "Officer", 
          name: "Bob Dartsch",
          schedules: schedules?.filter(s => 
            s.employee.first_name === "Bob" && 
            s.employee.last_name === "Dartsch"
          )
        },
        { position: "Minimum Staffing", name: "" },
      ],
    },
    {
      title: "Engine 2",
      rows: [
        { 
          position: "Captain", 
          name: "Kay Hess",
          schedules: schedules?.filter(s => 
            s.employee.first_name === "Kay" && 
            s.employee.last_name === "Hess"
          )
        },
        { 
          position: "Lieutenant", 
          name: "Tami Paul",
          schedules: schedules?.filter(s => 
            s.employee.first_name === "Tami" && 
            s.employee.last_name === "Paul"
          )
        },
        { 
          position: "Driver", 
          name: "Tracy Mills",
          schedules: schedules?.filter(s => 
            s.employee.first_name === "Tracy" && 
            s.employee.last_name === "Mills"
          )
        },
        { position: "Minimum Staffing", name: "" },
      ],
    },
  ];

  return (
    <Card className="p-4">
      <div className="space-y-6">
        {blocks.map((block, blockIndex) => (
          <UnitBlock
            key={blockIndex}
            title={block.title}
            date={format(date, "EEE, MMM d, yyyy")}
            rows={block.rows}
            timeSlots={timeSlots}
          />
        ))}
      </div>
    </Card>
  );
}
