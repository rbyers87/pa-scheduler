import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { addDays, startOfDay } from "date-fns";
import { TimeOffRequestDialog } from "./TimeOffRequestDialog";
import { ScheduleTable } from "./ScheduleTable";
import { Schedule } from "./types/scheduleTypes";

export function FutureSchedule() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // Fetch regular schedules
  const { data: regularSchedules } = useQuery({
    queryKey: ["future-schedules", session?.user?.id],
    queryFn: async () => {
      console.log("FutureSchedule: Fetching regular schedules");
      const today = new Date();
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("employee_id", session?.user?.id)
        .gte("start_time", today.toISOString())
        .order("start_time", { ascending: true })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Fetch recurring schedules
  const { data: recurringSchedules } = useQuery({
    queryKey: ["recurring-schedules", session?.user?.id],
    queryFn: async () => {
      console.log("FutureSchedule: Fetching recurring schedules");
      const { data, error } = await supabase
        .from("recurring_schedules")
        .select(`
          *,
          shifts (
            name,
            start_time,
            end_time
          )
        `)
        .eq("employee_id", session?.user?.id)
        .order("begin_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Fetch benefit balances
  const { data: benefitBalances } = useQuery({
    queryKey: ["benefit-balances", session?.user?.id],
    queryFn: async () => {
      console.log("FutureSchedule: Fetching benefit balances");
      const { data, error } = await supabase
        .from("benefit_balances")
        .select("*")
        .eq("user_id", session?.user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const createTimeOffRequest = useMutation({
    mutationFn: async ({ startDate, endDate, type }: { startDate: Date; endDate: Date; type: string }) => {
      console.log("FutureSchedule: Creating time off request", { startDate, endDate, type });
      const { error } = await supabase
        .from("time_off_requests")
        .insert({
          employee_id: session?.user?.id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          type,
          notes: `Requested off for ${selectedSchedule?.isRecurring ? 'recurring' : 'regular'} shift`,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
      toast({
        title: "Time off request submitted",
        description: "Your request has been submitted for review.",
      });
      setSelectedSchedule(null);
    },
    onError: (error) => {
      console.error("Error submitting time off request:", error);
      toast({
        title: "Error",
        description: "Failed to submit time off request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Process recurring schedules to get next occurrences
  const getNextRecurringSchedules = () => {
    if (!recurringSchedules) return [];
    
    const today = startOfDay(new Date());
    const nextTwoWeeks = addDays(today, 14);
    const schedules: Schedule[] = [];

    recurringSchedules.forEach((recSchedule) => {
      let currentDate = new Date(recSchedule.begin_date);
      
      while (currentDate <= nextTwoWeeks) {
        if (recSchedule.days.includes(currentDate.getDay()) && 
            currentDate >= today &&
            (!recSchedule.end_date || currentDate <= new Date(recSchedule.end_date))) {
          
          const shift = recSchedule.shifts;
          if (shift) {
            const [startHours, startMinutes] = shift.start_time.split(':');
            const [endHours, endMinutes] = shift.end_time.split(':');
            
            const startTime = new Date(currentDate);
            startTime.setHours(parseInt(startHours), parseInt(startMinutes), 0);
            
            const endTime = new Date(currentDate);
            endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0);

            schedules.push({
              date: currentDate,
              startTime,
              endTime,
              isRecurring: true,
              shiftName: shift.name,
            });
          }
        }
        currentDate = addDays(currentDate, 1);
      }
    });

    return schedules;
  };

  // Combine and sort all schedules
  const getAllSchedules = () => {
    const regular: Schedule[] = (regularSchedules || []).map(schedule => ({
      date: new Date(schedule.start_time),
      startTime: new Date(schedule.start_time),
      endTime: new Date(schedule.end_time),
      isRecurring: false,
    }));

    const recurring = getNextRecurringSchedules();
    
    return [...regular, ...recurring].sort((a, b) => 
      a.startTime.getTime() - b.startTime.getTime()
    );
  };

  const handleRequestOff = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
  };

  const handleTimeOffSubmit = (type: string) => {
    if (!selectedSchedule) return;
    
    createTimeOffRequest.mutate({
      startDate: selectedSchedule.startTime,
      endDate: selectedSchedule.endTime,
      type,
    });
  };

  const combinedSchedules = getAllSchedules();

  return (
    <>
      <ScheduleTable
        schedules={combinedSchedules}
        onRequestOff={handleRequestOff}
      />

      <TimeOffRequestDialog
        schedule={selectedSchedule}
        open={!!selectedSchedule}
        onOpenChange={(open) => !open && setSelectedSchedule(null)}
        onSubmit={handleTimeOffSubmit}
        benefitBalances={benefitBalances}
      />
    </>
  );
}