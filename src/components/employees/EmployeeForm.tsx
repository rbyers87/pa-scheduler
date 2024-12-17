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

type EmployeeFormData = {
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "supervisor" | "employee";
};

export function EmployeeForm({ onSuccess }: { onSuccess?: () => void }) {
  const form = useForm<EmployeeFormData>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEmployee = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      console.log("Creating employee:", data);
      
      // Generate a random password for the initial signup
      const password = Math.random().toString(36).slice(-12);
      
      // Create the auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: password,
        options: {
          data: {
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
      
      // Wait for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Now update the profile with additional data
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          role: data.role,
          first_name: data.first_name,
          last_name: data.last_name
        })
        .eq("id", authData.user.id);
        
      if (updateError) {
        console.error("Profile update error:", updateError);
        throw updateError;
      }
      
      // TODO: In production, you would want to send an email to the user
      // with their temporary password
      console.log("Temporary password for", data.email, ":", password);
      
      return { user: authData.user, password };
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
    onError: (error) => {
      console.error("Error creating employee:", error);
      toast({
        title: "Error",
        description: "Failed to create employee",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmployeeFormData) => {
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