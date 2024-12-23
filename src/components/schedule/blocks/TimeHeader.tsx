import React from 'react';

interface TimeHeaderProps {
  timeSlots: number[];
}

export function TimeHeader({ timeSlots }: TimeHeaderProps) {
  return (
    <div className="flex border-b bg-muted/50">
      <div className="w-40 border-r p-2 font-medium">Position</div>
      {timeSlots.map((hour) => (
        <div
          key={hour}
          className="flex-1 p-2 text-center border-r last:border-r-0 min-w-[80px]"
        >
          {`${hour.toString().padStart(2, '0')}:00`}
        </div>
      ))}
    </div>
  );
}