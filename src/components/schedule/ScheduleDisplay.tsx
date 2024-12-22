import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScheduleData } from "./types/TimeBlock";

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
  onScheduleUpdate: (data: Partial<ScheduleData>) => Promise<void>;
  onScheduleResize?: (scheduleId: string, startBlock: number, endBlock: number) => void;
}

export function ScheduleDisplay({
  timeBlocks,
  onDelete,
  onScheduleUpdate,
  onScheduleResize,
}: ScheduleDisplayProps) {
  const { toast } = useToast();
  const [resizing, setResizing] = useState<{
    scheduleId: string;
    type: 'start' | 'end';
    initialBlock: number;
  } | null>(null);

  const getBlockIndex = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 4 + Math.floor(minutes / 15);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!resizing || !onScheduleResize) return;

    const timelineRect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - timelineRect.left;
    const blockWidth = 60; // Increased block width
    const newBlock = Math.floor(relativeX / blockWidth);

    if (resizing.type === 'start') {
      onScheduleResize(resizing.scheduleId, newBlock, resizing.initialBlock);
    } else {
      onScheduleResize(resizing.scheduleId, resizing.initialBlock, newBlock);
    }
  };

  const handleMouseUp = () => {
    if (resizing) {
      setResizing(null);
      onScheduleUpdate({});
    }
  };

  if (!timeBlocks || timeBlocks.length === 0) {
    return <div>No schedules available for this day</div>;
  }

  return (
    <div 
      className="overflow-auto relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex flex-row">
        {/* Time labels column */}
        <div className="sticky left-0 z-10 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 w-20">
          {timeBlocks.map((block, index) => (
            index % 4 === 0 && (
              <div 
                key={`label-${block.time}`} 
                className="h-20 flex items-center justify-end pr-4 font-medium text-sm text-gray-600 dark:text-gray-300"
              >
                {block.time}
              </div>
            )
          ))}
        </div>

        {/* Schedule grid */}
        <div className="flex flex-row flex-1 relative">
          {timeBlocks.map((block, index) => (
            <div
              key={block.time}
              className="relative flex-shrink-0 w-[60px] h-20 border-r border-gray-200 dark:border-gray-700"
            >
              {block.schedules.map((schedule, scheduleIndex) => {
                const startBlock = getBlockIndex(new Date(schedule.start_time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
                const endBlock = getBlockIndex(new Date(schedule.end_time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
                const width = (endBlock - startBlock) * 60;
                
                if (index === startBlock) {
                  return (
                    <div
                      key={schedule.scheduleId}
                      className="absolute z-10"
                      style={{
                        width: `${width}px`,
                        top: `${scheduleIndex * 30}px`, // Increased spacing between schedules
                      }}
                    >
                      <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-md border border-blue-300 dark:border-blue-700 relative group min-h-[28px] hover:shadow-md transition-shadow">
                        {/* Resize handle - start */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-400 dark:hover:bg-blue-600"
                          onMouseDown={() => setResizing({ 
                            scheduleId: schedule.scheduleId, 
                            type: 'start',
                            initialBlock: endBlock 
                          })}
                        />
                        
                        <div className="flex justify-between items-center gap-2 px-2">
                          <span className="text-sm font-medium truncate text-gray-700 dark:text-gray-200">
                            {schedule.employeeName}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onDelete(schedule.scheduleId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Resize handle - end */}
                        <div
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-400 dark:hover:bg-blue-600"
                          onMouseDown={() => setResizing({ 
                            scheduleId: schedule.scheduleId, 
                            type: 'end',
                            initialBlock: startBlock 
                          })}
                        />
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}