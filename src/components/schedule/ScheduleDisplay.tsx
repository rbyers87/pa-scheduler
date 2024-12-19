import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ScheduleDisplayProps {
  timeBlocks: Array<{
    time: string;
    hasSchedule: boolean;
    scheduleId?: string;
    employeeName?: string;
  }>;
  onDelete: (scheduleId: string) => void;
  onScheduleUpdate: () => void;
}

export function ScheduleDisplay({ timeBlocks, onDelete, onScheduleUpdate }: ScheduleDisplayProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[200%] md:min-w-full">
        {timeBlocks.map((block, index) => {
          const isStart = !timeBlocks[index - 1]?.hasSchedule && block.hasSchedule;
          
          return (
            <div
              key={block.time}
              className={`
                flex-1 min-w-[30px] h-20 border-r border-gray-200 relative
                ${block.hasSchedule ? 'bg-blue-100' : 'bg-gray-50'}
              `}
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