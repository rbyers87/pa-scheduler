import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ScheduleDisplayProps {
  timeBlocks: Array<{
    time: string;
    hasSchedule: boolean;
    scheduleId?: string;
    employeeName?: string;
  }>;
  onDelete: (scheduleId: string) => void;
  onScheduleUpdate: () => void;
  onScheduleResize?: (scheduleId: string, startBlock: number, endBlock: number) => void;
}

export function ScheduleDisplay({ 
  timeBlocks, 
  onDelete, 
  onScheduleUpdate,
  onScheduleResize 
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

  return (
    <div 
      className="overflow-x-auto"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex min-w-[200%] md:min-w-full">
        {timeBlocks.map((block, index) => {
          const isStart = !timeBlocks[index - 1]?.hasSchedule && block.hasSchedule;
          
          return (
            <div
              key={block.time}
              className={`
                flex-1 min-w-[30px] h-20 border-r border-gray-200 relative cursor-col-resize
                ${block.hasSchedule ? 'bg-blue-100' : 'bg-gray-50'}
                ${isDragging ? 'select-none' : ''}
              `}
              onMouseDown={() => handleMouseDown(index, block.scheduleId)}
              onMouseMove={() => handleMouseMove(index)}
            >
              <div className="absolute -top-6 text-xs">
                {block.time}
              </div>
              {isStart && block.employeeName && (
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-1 bg-blue-200 text-xs">
                  <span>{block.employeeName}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => block.scheduleId && onDelete(block.scheduleId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}