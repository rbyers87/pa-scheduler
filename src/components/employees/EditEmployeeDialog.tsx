import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";

type Employee = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "admin" | "supervisor" | "employee";
};

export function EditEmployeeDialog({ employee }: { employee: Employee }) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState(employee.first_name || "");
  const [lastName, setLastName] = useState(employee.last_name || "");
  const [role, setRole] = useState(employee.role);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateEmployee = useMutation({
    mutationFn: async (data: {
      id: string;
      first_name: string;
      last_name: string;
      role: "admin" | "supervisor" | "employee";
    }) => {
      console.log("Updating employee:", data);
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
        })
        .eq("id", data.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      console.error("Error updating employee:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployee.mutate({
      id: employee.id,
      first_name: firstName,
      last_name: lastName,
      role,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value: "admin" | "supervisor" | "employee") => setRole(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Update Employee
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}