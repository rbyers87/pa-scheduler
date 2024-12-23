import { format } from "date-fns";

interface ScheduleRowProps {
  position: string;
  name: string;
  timeSlots: number[];
  schedules?: Array<{
    start_time: string;
    end_time: string;
  }>;
}

export function ScheduleRow({ position, name, timeSlots, schedules }: ScheduleRowProps) {
  const isScheduled = schedules && schedules.length > 0;
  
  const getScheduleForHour = (hour: number) => {
    if (!schedules) return false;
    
    return schedules.some(schedule => {
      const startHour = new Date(schedule.start_time).getHours();
      const endHour = new Date(schedule.end_time).getHours();
      return hour >= startHour && hour <= endHour;
    });
  };

  return (
    <div className="flex border-b last:border-b-0">
      <div className="w-40 border-r p-2 font-medium flex items-center">
        <div className="space-y-1">
          <div className="text-sm font-medium">{position}</div>
          {name && <div className="text-sm text-muted-foreground">{name}</div>}
        </div>
      </div>
      <div className="flex flex-1">
        {timeSlots.map((hour) => (
          <div
            key={hour}
            className={`flex-1 p-2 border-r last:border-r-0 min-w-[80px] ${
              getScheduleForHour(hour) ? 'bg-blue-100 dark:bg-blue-900' : ''
            }`}
          />
        ))}
      </div>
    </div>
  );
}