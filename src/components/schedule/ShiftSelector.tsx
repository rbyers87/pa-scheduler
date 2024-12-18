import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShiftSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function ShiftSelector({ value, onValueChange }: ShiftSelectorProps) {
  const { data: shifts, isLoading } = useQuery({
    queryKey: ["shifts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .order("start_time");
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading shifts...</div>;

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a shift" />
      </SelectTrigger>
      <SelectContent>
        {shifts?.map((shift) => (
          <SelectItem key={shift.id} value={shift.id}>
            {shift.name} ({shift.start_time} - {shift.end_time})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}