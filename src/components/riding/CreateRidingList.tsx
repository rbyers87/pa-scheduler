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
import { Loader2 } from "lucide-react";

interface CreateRidingListProps {
  date: Date;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateRidingList({ date, onSuccess, onCancel }: CreateRidingListProps) {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const { data: schedules, isLoading, error } = useQuery({
    queryKey: ["schedules", date],
    queryFn: async () => {
      console.log("CreateRidingList: Fetching schedules for date:", format(date, "yyyy-MM-dd"));
      const { data, error } = await supabase
        .from("schedules")
        .select(`
          employee_id,
          employee:profiles(
            id,
            first_name,
            last_name,
            rank,
            division
          )
        `)
        .eq("start_time::date", format(date, "yyyy-MM-dd"));

      if (error) {
        console.error("CreateRidingList: Error fetching schedules:", error);
        throw error;
      }

      console.log("CreateRidingList: Retrieved schedules:", data);
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
      setIsCreating(true);
      console.log("CreateRidingList: Starting list creation for date:", format(date, "yyyy-MM-dd"));
      
      const formattedDate = format(date, "yyyy-MM-dd");
      const ridingListData = selectedEmployees.map((employeeId, index) => ({
        date: formattedDate,
        employee_id: employeeId,
        position: index + 1,
        status: "active" as const,
      }));

      console.log("CreateRidingList: Inserting riding list data:", ridingListData);

      const { error: insertError } = await supabase
        .from("riding_lists")
        .insert(ridingListData);

      if (insertError) {
        console.error("CreateRidingList: Error creating riding list:", insertError);
        throw insertError;
      }

      console.log("CreateRidingList: Successfully created riding list");
      onSuccess();
      toast({
        title: "Success",
        description: "Riding list has been created.",
      });
    } catch (error) {
      console.error("CreateRidingList: Error in handleCreate:", error);
      toast({
        title: "Error",
        description: "Failed to create riding list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading schedules. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Select</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Rank</TableHead>
            <TableHead>Division</TableHead>
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
              <TableCell>{schedule.employee.rank}</TableCell>
              <TableCell>{schedule.employee.division}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} disabled={isCreating}>
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          disabled={selectedEmployees.length === 0 || isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create List'
          )}
        </Button>
      </div>
    </div>
  );
}