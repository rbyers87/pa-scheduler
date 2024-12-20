import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export function FutureSchedule() {
  const { session } = useAuth();

  const { data: schedules } = useQuery({
    queryKey: ["future-schedules", session?.user?.id],
    queryFn: async () => {
      const today = new Date();
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("employee_id", session?.user?.id)
        .gte("start_time", today.toISOString())
        .order("start_time", { ascending: true })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules?.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell>
                {format(new Date(schedule.start_time), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                {format(new Date(schedule.start_time), "h:mm a")}
              </TableCell>
              <TableCell>
                {format(new Date(schedule.end_time), "h:mm a")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}