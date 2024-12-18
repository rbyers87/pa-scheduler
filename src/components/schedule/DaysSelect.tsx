import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const DAYS = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

interface DaysSelectProps {
  selectedDays: number[];
  onDaysChange: (days: number[]) => void;
}

export function DaysSelect({ selectedDays, onDaysChange }: DaysSelectProps) {
  const toggleDay = (day: number) => {
    onDaysChange(
      selectedDays.includes(day)
        ? selectedDays.filter((d) => d !== day)
        : [...selectedDays, day]
    );
  };

  return (
    <div className="space-y-2">
      <Label>Work Days</Label>
      <div className="grid grid-cols-2 gap-2">
        {DAYS.map((day) => (
          <div key={day.value} className="flex items-center space-x-2">
            <Checkbox
              id={`day-${day.value}`}
              checked={selectedDays.includes(day.value)}
              onCheckedChange={() => toggleDay(day.value)}
            />
            <Label htmlFor={`day-${day.value}`}>{day.label}</Label>
          </div>
        ))}
      </div>
    </div>
  );
}