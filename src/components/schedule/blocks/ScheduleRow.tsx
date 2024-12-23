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
  
  return (
    <div className="flex border-b last:border-b-0">
      <div className="w-40 border-r p-2 font-medium flex items-center">
        <span className="truncate">{position}</span>
      </div>
      <div className={`flex flex-1 ${isScheduled ? 'bg-blue-100 dark:bg-blue-900' : ''}`}>
        {timeSlots.map((hour) => (
          <div
            key={hour}
            className="flex-1 p-2 border-r last:border-r-0 min-w-[80px]"
          >
            {hour === timeSlots[0] && name}
          </div>
        ))}
      </div>
    </div>
  );
}