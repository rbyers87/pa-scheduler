import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CreateRidingListProps {
  date: Date;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateRidingList({ date, onSuccess, onCancel }: CreateRidingListProps) {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: schedules } = useQuery({
    queryKey: ["schedules", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedules")
        .select(`
          employee_id,
          employee:profiles(
            id,
            first_name,
            last_name
          )
        `)
        .eq("start_time::date", format(date, "yyyy-MM-dd"));

      if (error) throw error;
      return data;
    },
  });

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleCreate = async () => {
    try {
      const ridingListData = selectedEmployees.map((employeeId, index) => ({
        date: format(date, "yyyy-MM-dd"),
        employee_id: employeeId,
        position: index + 1,
        status: "active",
      }));

      const { error } = await supabase
        .from("riding_lists")
        .insert(ridingListData);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error("Error creating riding list:", error);
      toast({
        title: "Error",
        description: "Failed to create riding list",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Select</TableHead>
            <TableHead>Employee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules?.map((schedule) => (
            <TableRow key={schedule.employee_id}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(schedule.employee_id)}
                  onChange={() => handleEmployeeToggle(schedule.employee_id)}
                  className="h-4 w-4"
                />
              </TableCell>
              <TableCell>
                {schedule.employee.first_name} {schedule.employee.last_name}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          disabled={selectedEmployees.length === 0}
        >
          Create List
        </Button>
      </div>
    </div>
  );
}