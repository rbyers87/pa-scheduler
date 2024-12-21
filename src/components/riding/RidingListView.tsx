import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";

type RiderStatus = 'active' | 'standby' | 'off';

interface RidingListViewProps {
  ridingList: Array<{
    id: string;
    position: number;
    status: RiderStatus;
    employee: {
      id: string;
      first_name: string;
      last_name: string;
    };
  }>;
  onUpdate: () => void;
  date: Date;
}

export function RidingListView({ ridingList, onUpdate, date }: RidingListViewProps) {
  const { toast } = useToast();

  const handleMovePosition = async (currentPosition: number, direction: "up" | "down") => {
    const newPosition = direction === "up" ? currentPosition - 1 : currentPosition + 1;
    const currentEmployee = ridingList.find(item => item.position === currentPosition);
    const swapEmployee = ridingList.find(item => item.position === newPosition);

    if (!currentEmployee || !swapEmployee) return;

    try {
      const formattedDate = date.toISOString().split('T')[0];
      const updates = [
        {
          id: currentEmployee.id,
          position: newPosition,
          date: formattedDate,
          employee_id: currentEmployee.employee.id,
          status: currentEmployee.status,
        },
        {
          id: swapEmployee.id,
          position: currentPosition,
          date: formattedDate,
          employee_id: swapEmployee.employee.id,
          status: swapEmployee.status,
        },
      ];

      const { error } = await supabase
        .from("riding_lists")
        .upsert(updates);

      if (error) throw error;

      onUpdate();
    } catch (error) {
      console.error("Error updating positions:", error);
      toast({
        title: "Error",
        description: "Failed to update positions",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: RiderStatus) => {
    try {
      const { error } = await supabase
        .from("riding_lists")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      onUpdate();
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  if (ridingList.length === 0) {
    return <div className="text-center py-4">No riding list available for this date.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Position</TableHead>
          <TableHead>Employee</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ridingList.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.position}</TableCell>
            <TableCell>
              {item.employee.first_name} {item.employee.last_name}
            </TableCell>
            <TableCell>
              <select
                value={item.status}
                onChange={(e) => handleUpdateStatus(item.id, e.target.value as RiderStatus)}
                className="border rounded p-1"
              >
                <option value="active">Active</option>
                <option value="standby">Standby</option>
                <option value="off">Off</option>
              </select>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                {item.position > 1 && (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleMovePosition(item.position, "up")}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                )}
                {item.position < ridingList.length && (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleMovePosition(item.position, "down")}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}