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
      // Check if this is a recurring schedule by looking for the UUID-date pattern
      // Format should be: "uuid-YYYY-MM-DD"
      const isRecurring = scheduleId.includes('-');
      
      if (isRecurring) {
        // The recurring ID is the full UUID part before the date
        // Example: "123e4567-e89b-12d3-a456-426614174000-2024-01-01"
        const matches = scheduleId.match(/^([0-9a-f-]+)-\d{4}-\d{2}-\d{2}$/i);
        
        if (!matches || !matches[1]) {
          console.error("Invalid recurring schedule ID format:", scheduleId);
          throw new Error("Invalid recurring schedule ID format");
        }

        const recurringId = matches[1];
        console.log("Attempting to delete recurring schedule with ID:", recurringId);
        
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
        console.log("Attempting to delete regular schedule with ID:", scheduleId);
        
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