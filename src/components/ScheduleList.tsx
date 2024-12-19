import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function ScheduleList() {
  const { toast } = useToast();
  const { session } = useAuth();
  
  const { data: employees, isLoading, error } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      console.log("Checking auth session:", session?.user?.id);
      if (!session) {
        throw new Error("No authenticated session");
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("first_name");
      
      if (error) {
        console.error("Error fetching employees:", error);
        throw error;
      }
      
      console.log("Fetched employees:", data);
      return data;
    },
    meta: {
      onError: (error: Error) => {
        console.error("Query error:", error);
        toast({
          title: "Error loading employees",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    enabled: !!session // Only run query when session exists
  });

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading employees: {error.message}
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4">Loading employees...</div>;
  }

  if (!employees?.length) {
    return <div className="p-4">No employees found.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                {employee.first_name} {employee.last_name}
              </TableCell>
              <TableCell>{employee.role}</TableCell>
              <TableCell>Available</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {/* Add action buttons here in the next iteration */}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}