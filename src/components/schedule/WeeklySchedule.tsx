import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, addDays, format } from "date-fns";
import { DaySchedule } from "./DaySchedule";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function WeeklySchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["weekly-schedules", weekStart.toISOString()],
    queryFn: async () => {
      console.log("Fetching schedules for week:", weekStart);
      const { data, error } = await supabase
        .from("schedules")
        .select(`
          *,
          employee:profiles(first_name, last_name)
        `)
        .gte("start_time", weekStart.toISOString())
        .lte("end_time", weekEnd.toISOString())
        .order("start_time");

      if (error) {
        console.error("Error fetching schedules:", error);
        throw error;
      }
      return data;
    },
  });

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const days = direction === "prev" ? -7 : 7;
      return addDays(prev, days);
    });
  };

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Weekly Schedule</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateWeek("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateWeek("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading schedules...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {days.map((day) => (
              <DaySchedule
                key={day.toISOString()}
                date={day}
                schedules={schedules?.filter(schedule => 
                  new Date(schedule.start_time).toDateString() === day.toDateString()
                )}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}