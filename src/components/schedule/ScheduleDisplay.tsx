import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ScheduleDisplayProps {
  timeBlocks: Array<{
    time: string;
    schedules: Array<{
      scheduleId: string;
      employeeName: string;
      start_time: string;
      end_time: string;
    }>;
  }>;
  onDelete: (scheduleId: string) => void;
  onScheduleUpdate: () => void;
  onScheduleResize?: (scheduleId: string, startBlock: number, endBlock: number) => void;
}

export function ScheduleDisplay({
  timeBlocks,
  onDelete,
  onScheduleUpdate,
  onScheduleResize,
}: ScheduleDisplayProps) {
  const { toast } = useToast();

  // Ensure the time blocks are not empty and the component renders
  if (!timeBlocks || timeBlocks.length === 0) {
    return <div>No schedules available for this day</div>;
  }

  return (
    <div className="overflow-auto">
      <div className="flex flex-row space-x-2">
        {timeBlocks.map((block, index) => {
          const isWholeHour = index % 4 === 0; // Check if block represents the start of an hour

          return (
            <div
              key={block.time}
              className="relative flex flex-col min-w-[30px] h-20 border-r border-gray-200"
            >
              {/* Time Label */}
              {isWholeHour && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 font-semibold">
                  {block.time}
                </div>
              )}

              {/* Schedule Blocks */}
              {block.schedules.length > 0 &&
                block.schedules.map((schedule, scheduleIndex) => {
                  const scheduleDuration =
                    (new Date(schedule.end_time).getTime() -
                      new Date(schedule.start_time).getTime()) /
                    60000; // Calculate duration in minutes

                  const scheduleHeight = `${scheduleDuration / 15}rem`; // Set height in rem based on 15-min intervals
                  const scheduleTop = `${((new Date(schedule.start_time).getMinutes() % 60) / 15) * 2}rem`;

                  return (
                    <div
                      key={schedule.scheduleId}
                      className="absolute flex flex-col space-y-1"
                      style={{
                        top: scheduleTop,
                        height: scheduleHeight,
                        left: `${scheduleIndex * 35}px`, // Offset schedules next to each other
                      }}
                    >
                      <div className="bg-blue-200 p-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span>{schedule.employeeName}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onDelete(schedule.scheduleId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
