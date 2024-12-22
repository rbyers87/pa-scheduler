import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useScheduleOperations() {
  const { toast } = useToast();
  const { session } = useAuth();

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to delete schedules",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if this is a recurring schedule by looking for the pattern id-date
      const isRecurring = scheduleId.includes('-');
      
      if (isRecurring) {
        // Extract the recurring schedule ID from the composite ID (format: recurringId-date)
        const recurringId = scheduleId.split('-')[0];
        
        const { error } = await supabase
          .from("recurring_schedules")
          .delete()
          .eq("id", recurringId);

        if (error) throw error;

        toast({
          title: "Recurring schedule deleted",
          description: "The recurring schedule has been removed successfully.",
        });
      } else {
        const { error } = await supabase
          .from("schedules")
          .delete()
          .eq("id", scheduleId);

        if (error) throw error;

        toast({
          title: "Schedule deleted",
          description: "The schedule has been removed successfully.",
        });
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast({
        title: "Error",
        description: "Failed to delete schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSchedule = async (scheduleId: string, startTime: Date, endTime: Date) => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to update schedules",
        variant: "destructive",
      });
      return;
    }

    // Check if this is a recurring schedule
    const isRecurring = scheduleId.includes('-');
    
    if (isRecurring) {
      toast({
        title: "Cannot modify recurring schedule",
        description: "Recurring schedules must be modified through the recurring schedule form.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("schedules")
        .update({
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
        })
        .eq("id", scheduleId);

      if (error) throw error;

      toast({
        title: "Schedule updated",
        description: "The schedule has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to update schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    handleDeleteSchedule,
    handleUpdateSchedule
  };
}