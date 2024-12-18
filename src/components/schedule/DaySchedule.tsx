import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Schedule {
  id: string;
  start_time: string;
  end_time: string;
  employee: {
    first_name: string;
    last_name: string;
  };
}

interface DayScheduleProps {
  date: Date;
  schedules?: Schedule[];
}

export function DaySchedule({ date, schedules = [] }: DayScheduleProps) {
  const formatTime = (timeString: string) => {
    return format(new Date(timeString), "h:mm a");
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {format(date, "EEEE")}
          <span className="block text-xs text-muted-foreground">
            {format(date, "MMM d")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {schedules.length === 0 ? (
          <p className="text-sm text-muted-foreground">No schedules</p>
        ) : (
          schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="text-sm border rounded-md p-2 space-y-1"
            >
              <div className="font-medium">
                {schedule.employee.first_name} {schedule.employee.last_name}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}