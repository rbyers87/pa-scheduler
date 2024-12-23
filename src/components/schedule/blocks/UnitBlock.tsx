import { ScheduleRow } from "./ScheduleRow";
import { TimeHeader } from "./TimeHeader";

interface UnitBlockProps {
  title: string;
  date: string;
  rows: {
    position: string;
    name: string;
    schedules?: Array<{
      start_time: string;
      end_time: string;
    }>;
  }[];
  timeSlots: number[];
}

export function UnitBlock({ title, date, rows, timeSlots }: UnitBlockProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">{title}</h3>
        <span className="text-sm text-muted-foreground">{date}</span>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <TimeHeader timeSlots={timeSlots} />
        {rows.map((row, index) => (
          <ScheduleRow
            key={index}
            position={row.position}
            name={row.name}
            timeSlots={timeSlots}
            schedules={row.schedules}
          />
        ))}
      </div>
    </div>
  );
}