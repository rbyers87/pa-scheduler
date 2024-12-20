import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { EditEmployeeDialog } from "@/components/employees/EditEmployeeDialog";

const Employees = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Employees: Checking session", session);
    if (!session) {
      console.log("Employees: No session, redirecting to login");
      navigate("/login");
    }
  }, [session, navigate]);

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting employee:", error);
        throw new Error("Failed to delete employee");
      }

      console.log("Employee deleted successfully");
    },
    onSuccess: () => {
      // Invalidate the query to refetch the list of employees after deletion
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error: any) => {
      console.error("Error deleting employee:", error);
      const errorMessage = error.message || "Failed to delete employee. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <EmployeeForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">Loading employees...</CardContent>
          </Card>
        ) : employees?.length === 0 ? (
          <Card>
            <CardContent className="p-6">No employees found.</CardContent>
          </Card>
        ) : (
          employees?.map((employee) => (
            <Card key={employee.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>
                  {employee.first_name} {employee.last_name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <EditEmployeeDialog employee={employee} />
                  {/* Conditionally show the delete button if the user is an admin */}
                  {session?.user?.role === "admin" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${employee.first_name}?`)) {
                          deleteEmployee.mutate(employee.id); // Delete the employee
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Email: {employee.email}</p>
                  <p className="text-sm text-gray-500">Role: {employee.role}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Employees;
