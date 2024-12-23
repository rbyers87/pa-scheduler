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
  const getScheduleStyle = (startHour: number) => {
    if (!schedules || schedules.length === 0) return "";
    
    const schedule = schedules[0]; // For now, just handle the first schedule
    const start = new Date(schedule.start_time);
    const end = new Date(schedule.end_time);
    
    if (start.getHours() <= startHour && end.getHours() > startHour) {
      return "bg-blue-100 dark:bg-blue-900";
    }
    
    return "";
  };

  return (
    <div className="flex border-b last:border-b-0 hover:bg-muted/50 transition-colors">
      <div className="w-40 border-r p-2 font-medium flex items-center">
        <span className="truncate">{position}</span>
      </div>
      <div className="flex flex-1">
        {timeSlots.map((hour) => (
          <div
            key={hour}
            className={`flex-1 p-2 border-r last:border-r-0 min-w-[100px] ${getScheduleStyle(hour)}`}
          >
            {hour === timeSlots[0] && name}
          </div>
        ))}
      </div>
    </div>
  );
}