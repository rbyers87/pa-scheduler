import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeSelect } from "./EmployeeSelect";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Schedule {
  id: string;
  start_time: string;
  end_time: string;
  employee: {
    first_name: string;
    last_name: string;
  };
}

interface DayScheduleProps {
  date: Date;
  schedules?: Schedule[];
  onScheduleUpdate?: () => void;
}

export function DaySchedule({ date, schedules = [], onScheduleUpdate }: DayScheduleProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>();
  const { toast } = useToast();

  const formatTime = (timeString: string) => {
    return format(new Date(timeString), "h:mm a");
  };

  // Convert time string to minutes since midnight
  const timeToMinutes = (timeString: string) => {
    const date = new Date(timeString);
    return date.getHours() * 60 + date.getMinutes();
  };

  // Convert minutes since midnight to Date
  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const newDate = new Date(date);
    newDate.setHours(hours, mins, 0, 0);
    return newDate.toISOString();
  };

  const handleAddSchedule = async () => {
    if (!selectedEmployee) return;

    try {
      // Default to 8-hour shift starting at 9 AM
      const defaultStartTime = new Date(date);
      defaultStartTime.setHours(9, 0, 0, 0);
      
      const defaultEndTime = new Date(date);
      defaultEndTime.setHours(17, 0, 0, 0);

      const { error } = await supabase
        .from("schedules")
        .insert({
          employee_id: selectedEmployee,
          start_time: defaultStartTime.toISOString(),
          end_time: defaultEndTime.toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Schedule added",
        description: "The schedule has been added successfully.",
      });

      onScheduleUpdate?.();
      setSelectedEmployee(undefined);
    } catch (error) {
      console.error("Error adding schedule:", error);
      toast({
        title: "Error",
        description: "Failed to add schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateScheduleTime = async (
    scheduleId: string,
    startMinutes: number,
    endMinutes: number
  ) => {
    try {
      const { error } = await supabase
        .from("schedules")
        .update({
          start_time: minutesToTime(startMinutes),
          end_time: minutesToTime(endMinutes),
        })
        .eq("id", scheduleId);

      if (error) throw error;

      toast({
        title: "Schedule updated",
        description: "The schedule has been updated successfully.",
      });

      onScheduleUpdate?.();
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to update schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium">
          {format(date, "EEEE")}
          <span className="block text-sm text-muted-foreground">
            {format(date, "MMM d")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {schedules.map((schedule) => {
            const startMinutes = timeToMinutes(schedule.start_time);
            const endMinutes = timeToMinutes(schedule.end_time);
            const duration = endMinutes - startMinutes;

            return (
              <div
                key={schedule.id}
                className="p-3 border rounded-lg space-y-2 bg-secondary/10"
              >
                <div className="font-medium">
                  {schedule.employee.first_name} {schedule.employee.last_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                </div>
                <div className="pt-2">
                  <Slider
                    defaultValue={[startMinutes, endMinutes]}
                    max={1440}
                    step={15}
                    minStepsBetweenThumbs={60}
                    onValueCommit={(value) => {
                      if (value[0] !== undefined && value[1] !== undefined) {
                        updateScheduleTime(schedule.id, value[0], value[1]);
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t space-y-4">
          <EmployeeSelect
            value={selectedEmployee}
            onValueChange={setSelectedEmployee}
          />
          <Button 
            onClick={handleAddSchedule}
            disabled={!selectedEmployee}
            className="w-full"
          >
            Add Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}