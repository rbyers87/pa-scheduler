import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

type EmployeeFormData = {
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "supervisor" | "employee";
};

export function EmployeeForm({ onSuccess }: { onSuccess?: () => void }) {
  const form = useForm<EmployeeFormData>();
  const { toast, accessToken } = useAuth();  // Destructure accessToken from context
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const createEmployee = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      console.log("Creating employee with data:", data);
      
      if (!session?.user?.id) {
        console.error("No authenticated user found");
        throw new Error("You must be logged in to create employees");
      }

      // Ensure accessToken is available before making requests
      if (!accessToken) {
        throw new Error("Access token required for API requests");
      }

      // First verify the current user is an admin
      const { data: currentUserProfile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw new Error("Failed to verify user permissions");
      }

      if (currentUserProfile?.role !== 'admin') {
        throw new Error("Only admins can create employee profiles");
      }
      
      // Generate a random password for the initial signup
      const password = Math.random().toString(36).slice(-12);
      
      try {
        // Create the auth user with metadata including email
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: password,
          options: {
            data: {
              email: data.email,
              first_name: data.first_name,
              last_name: data.last_name,
              role: data.role
            }
          }
        });
        
        if (authError) {
          console.error("Auth error:", authError);
          throw authError;
        }
        
        if (!authData.user) {
          console.error("No user created");
          throw new Error("No user created");
        }
        
        console.log("User created successfully:", authData.user);
        
        // Set authorization header with access token
        const headers = {
          Authorization: `Bearer ${accessToken}`,
        };

        // You can now use headers for any further API requests
        // Example: Update the employee's profile or database with the user details

        // Return the temporary password for display
        return { user: authData.user, password };
      } catch (error) {
        console.error("Error in createEmployee:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({
        title: "Success",
        description: `Employee created successfully. Temporary password: ${data.password}`,
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Error creating employee:", error);
      const errorMessage = error.message || "Failed to create employee. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmployeeFormData) => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to create employees",
        variant: "destructive",
      });
      return;
    }
    
    createEmployee.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Create Employee
        </Button>
      </form>
    </Form>
  );
}
