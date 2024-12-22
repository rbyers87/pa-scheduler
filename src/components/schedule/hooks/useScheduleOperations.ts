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
      const isRecurring = scheduleId.includes('-');
      
      if (isRecurring) {
        // Extract just the UUID part (everything before the date)
        // The format is: UUID-DATE where UUID is already hyphenated
        const uuidPart = scheduleId.split('-2024-')[0]; // Split on the year part
        
        if (!uuidPart || uuidPart.length !== 36) { // UUID should be exactly 36 characters
          console.error("Invalid recurring schedule ID format:", scheduleId);
          throw new Error("Invalid recurring schedule ID format");
        }

        console.log("Attempting to delete recurring schedule with ID:", uuidPart);
        
        const { error } = await supabase
          .from("recurring_schedules")
          .delete()
          .eq("id", uuidPart);

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