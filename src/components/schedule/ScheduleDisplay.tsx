import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ScheduleDisplayProps {
  schedules: Array<{
    scheduleId: string;
    employeeName: string;
    timeBlocks: Array<{
      time: string;
      hasSchedule: boolean;
      scheduleId?: string;
    }>;
  }>;
  onDelete: (scheduleId: string) => void;
  onScheduleUpdate: () => void;
  onScheduleResize?: (scheduleId: string, startBlock: number, endBlock: number) => void;
}

export function ScheduleDisplay({
  schedules,
  onDelete,
  onScheduleUpdate,
  onScheduleResize,
}: ScheduleDisplayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartBlock, setDragStartBlock] = useState<number | null>(null);
  const currentScheduleRef = useRef<string | null>(null);
  const { toast } = useToast();

  const handleMouseDown = (index: number, scheduleId?: string) => {
    if (!scheduleId) return;
    setIsDragging(true);
    setDragStartBlock(index);
    currentScheduleRef.current = scheduleId;
  };

  const handleMouseMove = (index: number) => {
    if (!isDragging || !dragStartBlock || !currentScheduleRef.current) return;

    // Find the schedule's current boundaries
    let startBlock = dragStartBlock;
    let endBlock = index;

    // Ensure start is before end
    if (startBlock > endBlock) {
      [startBlock, endBlock] = [endBlock, startBlock];
    }

    // Minimum 1-hour duration (4 blocks)
    if (endBlock - startBlock < 4) {
      endBlock = startBlock + 4;
    }

    onScheduleResize?.(currentScheduleRef.current, startBlock, endBlock);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragStartBlock(null);
      currentScheduleRef.current = null;
      onScheduleUpdate();
    }
  };

  // Ensure the schedules and timeBlocks are valid
  if (!Array.isArray(schedules) || schedules.length === 0) {
    return <div>No schedules available</div>;
  }

  return (
    <div className="overflow-auto">
      {/* Render each schedule in its own row */}
      {schedules.map((schedule) => {
        // Ensure timeBlocks is an array
        if (!Array.isArray(schedule.timeBlocks) || schedule.timeBlocks.length === 0) {
          return (
            <div key={schedule.scheduleId} className="mb-4">
              <h3 className="text-sm font-semibold text-center">{schedule.employeeName}</h3>
              <div>No time blocks available for this schedule</div>
            </div>
          );
        }

        return (
          <div key={schedule.scheduleId} className="mb-4">
            <h3 className="text-sm font-semibold text-center">{schedule.employeeName}</h3>

            <div className="flex flex-row space-x-2">
              {schedule.timeBlocks.map((block, index) => {
                const isStart = !schedule.timeBlocks[index - 1]?.hasSchedule && block.hasSchedule;
                const isWholeHour = index % 4 === 0; // Check if block represents the start of an hour

                return (
                  <div
                    key={block.time}
                    className={`relative flex flex-col min-w-[30px] h-20 border-r border-gray-200 cursor-col-resize
                      ${block.hasSchedule ? 'bg-blue-100' : 'bg-gray-50'}
                      ${isDragging ? 'select-none' : ''} 
                      ${block.hasSchedule && isStart ? 'flex-col' : ''}
                    `}
                    onMouseDown={() => handleMouseDown(index, block.scheduleId)}
                    onMouseMove={() => handleMouseMove(index)}
                  >
                    {isWholeHour && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 font-semibold">
                        {block.time}
                      </div>
                    )}

                    {/* Schedule block */}
                    {block.hasSchedule && block.scheduleId && (
                      <div className="absolute top-0 left-0 right-0 bg-blue-200 p-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span>{schedule.employeeName}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => block.scheduleId && onDelete(block.scheduleId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
