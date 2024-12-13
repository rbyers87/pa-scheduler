import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";

type Schedule = Database["public"]["Tables"]["schedules"]["Row"] & {
  profiles: {
    first_name: string | null;
    last_name: string | null;
  };
};

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["schedules", selectedDate],
    queryFn: async () => {
      console.log("Fetching schedules for date:", selectedDate);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("schedules")
        .select(`
          *,
          profiles:employee_id (
            first_name,
            last_name
          )
        `)
        .gte("start_time", startOfDay.toISOString())
        .lte("start_time", endOfDay.toISOString())
        .order("start_time");

      if (error) {
        console.error("Error fetching schedules:", error);
        throw error;
      }

      return data as Schedule[];
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Schedule Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Daily Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading schedules...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules?.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        {schedule.profiles.first_name} {schedule.profiles.last_name}
                      </TableCell>
                      <TableCell>
                        {format(new Date(schedule.start_time), "h:mm a")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(schedule.end_time), "h:mm a")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {schedules?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No schedules found for this date
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Schedule;