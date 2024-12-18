import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EmployeeSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function EmployeeSelect({ value, onValueChange }: EmployeeSelectProps) {
  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .order("first_name");
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-2">
      <Label>Employee</Label>
      <Select
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select an employee" />
        </SelectTrigger>
        <SelectContent>
          {employees?.map((employee) => (
            <SelectItem key={employee.id} value={employee.id}>
              {employee.first_name} {employee.last_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}