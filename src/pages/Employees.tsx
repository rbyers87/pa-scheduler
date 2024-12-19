import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const Employees = () => {
  const { session, accessToken } = useAuth();
  const { toast } = useToast();

  const { data: employees, isLoading, error } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error("Authentication required");
      }

      if (!accessToken) {
        throw new Error("Access token required for API requests");
      }

      const { data, error: employeesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (employeesError) {
        console.error("Error fetching employees:", employeesError);
        throw employeesError;
      }

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

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

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
    <div>
      <h2 className="text-2xl font-bold">Employees</h2>
      <ul>
        {employees.map((employee) => (
          <li key={employee.id}>
            {employee.first_name} {employee.last_name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Employees;
