import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Schedule } from "./types/scheduleTypes";

interface ScheduleTableProps {
  schedules: Schedule[];
  onRequestOff: (schedule: Schedule) => void;
}

export function ScheduleTable({ schedules, onRequestOff }: ScheduleTableProps) {
  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule, index) => (
            <TableRow key={`${schedule.date.toISOString()}-${index}`}>
              <TableCell>
                {format(schedule.date, "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                {format(schedule.startTime, "h:mm a")}
              </TableCell>
              <TableCell>
                {format(schedule.endTime, "h:mm a")}
              </TableCell>
              <TableCell>
                {schedule.isRecurring ? (
                  <span className="text-blue-600">
                    Recurring {schedule.shiftName}
                  </span>
                ) : (
                  <span className="text-gray-600">Regular</span>
                )}
              </TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onRequestOff(schedule)}
                >
                  Request Off
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {schedules.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No upcoming schedules found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}