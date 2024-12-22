import { format } from "date-fns";
import { Card } from "@/components/ui/card";

interface ScheduleBlock {
  title: string;
  rows: {
    position: string;
    name: string;
  }[];
}

interface DailyBlocksViewProps {
  date: Date;
}

export function DailyBlocksView({ date }: DailyBlocksViewProps) {
  // Sample data structure - replace with actual data from your backend
  const blocks: ScheduleBlock[] = [
    {
      title: "Battalion 1",
      rows: [
        { position: "Battalion Chief", name: "Teresa Hardy" },
      ],
    },
    {
      title: "Engine 1",
      rows: [
        { position: "Captain", name: "Sue Heath" },
        { position: "Lieutenant", name: "Perry Barker" },
        { position: "Driver", name: "Jonathan Langston" },
        { position: "Firefighter", name: "Bob Dartsch" },
        { position: "Minimum Staffing", name: "" },
      ],
    },
    // Add more blocks as needed
  ];

  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 7); // 7:00 to 15:00

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Daily Blocks View</h2>
          <span className="text-muted-foreground">
            {format(date, "EEE, MMM d, yyyy")}
          </span>
        </div>

        {blocks.map((block, blockIndex) => (
          <div key={blockIndex} className="space-y-2">
            <h3 className="font-semibold text-lg">{block.title}</h3>
            <div className="border rounded-lg overflow-hidden">
              {/* Time header */}
              <div className="flex border-b bg-muted/50">
                <div className="w-40 border-r p-2 bg-background">Position</div>
                {timeSlots.map((hour) => (
                  <div
                    key={hour}
                    className="flex-1 p-2 text-center border-r last:border-r-0 min-w-[100px]"
                  >
                    {`${hour}:00`}
                  </div>
                ))}
              </div>

              {/* Schedule rows */}
              {block.rows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-40 border-r p-2 font-medium">
                    {row.position}
                  </div>
                  <div className="flex-1 p-2 bg-blue-50 dark:bg-blue-950/30">
                    {row.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}