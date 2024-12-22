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
      // Check if this is a recurring schedule by looking for the date part
      const isRecurring = scheduleId.includes('-');
      
      if (isRecurring) {
        // Extract the recurring schedule ID from the composite ID (format: recurringId-YYYY-MM-DD)
        // We need to get everything before the last dash to preserve the full UUID
        const lastDashIndex = scheduleId.lastIndexOf('-');
        const recurringId = scheduleId.substring(0, lastDashIndex);
        
        console.log("Deleting recurring schedule with ID:", recurringId);
        
        const { error } = await supabase
          .from("recurring_schedules")
          .delete()
          .eq("id", recurringId);

        if (error) {
          console.error("Error deleting recurring schedule:", error);
          throw error;
        }

        toast({
          title: "Recurring schedule deleted",
          description: "The recurring schedule has been removed successfully.",
        });
      } else {
        console.log("Deleting regular schedule with ID:", scheduleId);
        
        const { error } = await supabase
          .from("schedules")
          .delete()
          .eq("id", scheduleId);

        if (error) {
          console.error("Error deleting regular schedule:", error);
          throw error;
        }

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