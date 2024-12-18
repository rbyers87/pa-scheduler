import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShiftSelector } from "./ShiftSelector";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DAYS = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

export function RecurringScheduleForm() {
  const [selectedShift, setSelectedShift] = useState<string>();
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>();
  const { toast } = useToast();

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .order("first_name");
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShift || !selectedEmployee || selectedDays.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("recurring_schedules").insert({
        employee_id: selectedEmployee,
        shift_id: selectedShift,
        days: selectedDays,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recurring schedule created successfully",
      });

      // Reset form
      setSelectedShift(undefined);
      setSelectedDays([]);
      setSelectedEmployee(undefined);
    } catch (error) {
      console.error("Error creating recurring schedule:", error);
      toast({
        title: "Error",
        description: "Failed to create recurring schedule",
        variant: "destructive",
      });
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Recurring Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select
              value={selectedEmployee}
              onValueChange={setSelectedEmployee}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees?.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Shift</Label>
            <ShiftSelector
              value={selectedShift}
              onValueChange={setSelectedShift}
            />
          </div>

          <div className="space-y-2">
            <Label>Work Days</Label>
            <div className="grid grid-cols-2 gap-2">
              {DAYS.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                  <Label htmlFor={`day-${day.value}`}>{day.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit">Create Recurring Schedule</Button>
        </form>
      </CardContent>
    </Card>
  );
}