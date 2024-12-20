import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShiftSelector } from "./ShiftSelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { EmployeeSelect } from "./EmployeeSelect";
import { DaysSelect } from "./DaysSelect";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RecurringScheduleFormProps {
  existingSchedule?: {
    id: string;
    employee_id: string;
    shift_id: string;
    days: number[];
    begin_date: string;
    end_date: string | null;
  };
  onSuccess?: () => void;
}

export function RecurringScheduleForm({
  existingSchedule,
  onSuccess,
}: RecurringScheduleFormProps) {
  const [selectedShift, setSelectedShift] = useState<string>();
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>();
  const [beginDate, setBeginDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState<string>();
  const { toast } = useToast();
  const { user, session } = useAuth();

  // Load existing schedule data into the form
  useEffect(() => {
    if (existingSchedule) {
      setSelectedShift(existingSchedule.shift_id);
      setSelectedDays(existingSchedule.days);
      setSelectedEmployee(existingSchedule.employee_id);
      setBeginDate(existingSchedule.begin_date);
      setEndDate(existingSchedule.end_date || "");
    }
  }, [existingSchedule]);

  // Fetching user profile
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure permission check for admin/supervisor roles
    if (!userProfile || !["admin", "supervisor"].includes(userProfile.role)) {
      toast({
        title: "Permission Denied",
        description: "Only administrators and supervisors can manage recurring schedules",
        variant: "destructive",
      });
      return;
    }

    // Validation check for required fields
    if (!selectedShift || !selectedEmployee || selectedDays.length === 0 || !beginDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (existingSchedule) {
        // Update existing schedule
        const { error } = await supabase
          .from("recurring_schedules")
          .update({
            employee_id: selectedEmployee,
            shift_id: selectedShift,
            days: selectedDays,
            begin_date: beginDate,
            end_date: endDate || null,
          })
          .eq("id", existingSchedule.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Recurring schedule updated successfully",
        });
      } else {
        // Create new schedule
        const { error } = await supabase
          .from("recurring_schedules")
          .insert({
            employee_id: selectedEmployee,
            shift_id: selectedShift,
            days: selectedDays,
            begin_date: beginDate,
            end_date: endDate || null,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Recurring schedule created successfully",
        });
      }

      // Reset form if creating a new schedule
      if (!existingSchedule) {
        setSelectedShift(undefined);
        setSelectedDays([]);
        setSelectedEmployee(undefined);
        setBeginDate(new Date().toISOString().split("T")[0]);
        setEndDate(undefined);
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error managing recurring schedule:", error);
      toast({
        title: "Error",
        description: "Failed to manage recurring schedule",
        variant: "destructive",
      });
    }
  };

  // If user is not admin/supervisor, show message
  if (userProfile && !["admin", "supervisor"].includes(userProfile.role)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set Recurring Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You do not have permission to manage recurring schedules. Please contact an administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existingSchedule ? "Edit Recurring Schedule" : "Set Recurring Schedule"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <EmployeeSelect
            value={selectedEmployee}
            onValueChange={setSelectedEmployee}
          />

          <div className="space-y-2">
            <Label>Shift</Label>
            <ShiftSelector
              value={selectedShift}
              onValueChange={setSelectedShift}
            />
          </div>

          <DaysSelect
            selectedDays={selectedDays}
            onDaysChange={setSelectedDays}
          />

          <div className="space-y-2">
            <Label>Begin Date</Label>
            <Input
              type="date"
              value={beginDate}
              onChange={(e) => setBeginDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="space-y-2">
            <Label>End Date (Optional)</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={beginDate}
            />
          </div>

          <Button type="submit">
            {existingSchedule ? "Update Recurring Schedule" : "Create Recurring Schedule"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
