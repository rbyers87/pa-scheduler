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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export function ScheduleList() {
  const { toast } = useToast();
  const { session, accessToken } = useAuth();

  const { data: employees, isLoading, error } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.log("ScheduleList: No user ID in session");
        throw new Error("Authentication required");
      }

      if (!accessToken) {
        console.log("ScheduleList: No access token");
        throw new Error("Access token required for API requests");
      }

      console.log("ScheduleList: Fetching employees with session", {
        userId: session.user.id,
        role: session.user.user_metadata?.role
      });

      const { data, error: employeesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (employeesError) {
        console.error("Error fetching employees:", employeesError);
        throw employeesError;
      }

      console.log("ScheduleList: Successfully fetched employees", data);
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
    enabled: !!session?.user?.id && !!accessToken,
  });

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>
          Error loading employees: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!employees?.length) {
    return (
      <Alert className="my-4">
        <AlertDescription>No employees found.</AlertDescription>
      </Alert>
    );
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