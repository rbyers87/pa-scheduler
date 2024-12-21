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

  // Calculate the block index for a given time
  const getBlockIndex = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 4 + Math.floor(minutes / 15);
  };

  // Handle mouse move during resize
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!resizing || !onScheduleResize) return;

    const timelineRect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - timelineRect.left;
    const blockWidth = 30; // Width of each time block
    const newBlock = Math.floor(relativeX / blockWidth);

    if (resizing.type === 'start') {
      onScheduleResize(resizing.scheduleId, newBlock, resizing.initialBlock);
    } else {
      onScheduleResize(resizing.scheduleId, resizing.initialBlock, newBlock);
    }
  };

  // Handle mouse up to end resizing
  const handleMouseUp = () => {
    if (resizing) {
      setResizing(null);
      onScheduleUpdate({}); // Call with an empty object or appropriate data
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
        <div className="sticky left-0 z-10 bg-white">
          {timeBlocks.map((block, index) => (
            index % 4 === 0 && (
              <div key={`label-${block.time}`} className="h-20 flex items-center pr-2 font-medium">
                {block.time}
              </div>
            )
          ))}
        </div>

        {/* Schedule grid */}
        <div className="flex flex-row flex-1">
          {timeBlocks.map((block, index) => (
            <div
              key={block.time}
              className="relative flex-shrink-0 w-[30px] h-20 border-r border-gray-200"
            >
              {block.schedules.map((schedule, scheduleIndex) => {
                const startBlock = getBlockIndex(new Date(schedule.start_time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
                const endBlock = getBlockIndex(new Date(schedule.end_time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
                const width = (endBlock - startBlock) * 30;
                
                if (index === startBlock) {
                  return (
                    <div
                      key={schedule.scheduleId}
                      className="absolute z-10"
                      style={{
                        width: `${width}px`,
                        top: `${scheduleIndex * 25}px`,
                      }}
                    >
                      <div className="bg-blue-200 p-1 rounded-md border border-blue-300 relative group">
                        {/* Resize handle - start */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-400"
                          onMouseDown={() => setResizing({ 
                            scheduleId: schedule.scheduleId, 
                            type: 'start',
                            initialBlock: endBlock 
                          })}
                        />
                        
                        <div className="flex justify-between items-center min-w-[100px]">
                          <span className="text-xs truncate">{schedule.employeeName}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={() => onDelete(schedule.scheduleId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Resize handle - end */}
                        <div
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-400"
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
