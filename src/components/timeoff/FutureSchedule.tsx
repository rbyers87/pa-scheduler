import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, startOfDay } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function FutureSchedule() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [selectedBenefitType, setSelectedBenefitType] = useState<string>("");

  // Fetch regular schedules
  const { data: regularSchedules } = useQuery({
    queryKey: ["future-schedules", session?.user?.id],
    queryFn: async () => {
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

  const handleRequestTimeOff = async () => {
    if (!selectedSchedule || !selectedBenefitType || !session?.user?.id) return;

    try {
      const { error } = await supabase
        .from("time_off_requests")
        .insert({
          employee_id: session.user.id,
          start_date: new Date(selectedSchedule.startTime).toISOString(),
          end_date: new Date(selectedSchedule.endTime).toISOString(),
          type: selectedBenefitType,
          notes: `Requested off for ${selectedSchedule.isRecurring ? 'recurring' : 'regular'} shift`,
        });

      if (error) throw error;

      toast({
        title: "Time off request submitted",
        description: "Your request has been submitted for review.",
      });

      setSelectedSchedule(null);
      setSelectedBenefitType("");
    } catch (error) {
      console.error("Error submitting time off request:", error);
      toast({
        title: "Error",
        description: "Failed to submit time off request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Process recurring schedules to get next occurrences
  const getNextRecurringSchedules = () => {
    if (!recurringSchedules) return [];
    
    const today = startOfDay(new Date());
    const nextTwoWeeks = addDays(today, 14);
    const schedules = [];

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
    const regular = (regularSchedules || []).map(schedule => ({
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

  const combinedSchedules = getAllSchedules();

  return (
    <>
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combinedSchedules.map((schedule, index) => (
              <TableRow key={`${schedule.date.toISOString()}-${index}`}>
                <TableCell>
                  {format(schedule.date, "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {format(schedule.startTime, "h:mm a")}
                </TableCell>
                <TableCell>
                  {format(schedule.endTime, "h:mm a")}
                </TableCell>
                <TableCell>
                  {schedule.isRecurring ? (
                    <span className="text-blue-600">
                      Recurring {schedule.shiftName}
                    </span>
                  ) : (
                    <span className="text-gray-600">Regular</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedSchedule(schedule)}
                  >
                    Request Off
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {combinedSchedules.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No upcoming schedules found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedSchedule} onOpenChange={(open) => !open && setSelectedSchedule(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Time Off</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {selectedSchedule && format(selectedSchedule.date, "MMMM d, yyyy")}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedSchedule && `${format(selectedSchedule.startTime, "h:mm a")} - ${format(selectedSchedule.endTime, "h:mm a")}`}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefitType">Select Benefit Type</Label>
              <Select value={selectedBenefitType} onValueChange={setSelectedBenefitType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select benefit type" />
                </SelectTrigger>
                <SelectContent>
                  {benefitBalances?.vacation_hours > 0 && (
                    <SelectItem value="vacation">
                      Vacation ({benefitBalances.vacation_hours} hours)
                    </SelectItem>
                  )}
                  {benefitBalances?.sick_hours > 0 && (
                    <SelectItem value="sick">
                      Sick Leave ({benefitBalances.sick_hours} hours)
                    </SelectItem>
                  )}
                  {benefitBalances?.comp_hours > 0 && (
                    <SelectItem value="comp">
                      Comp Time ({benefitBalances.comp_hours} hours)
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedSchedule(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestTimeOff}
                disabled={!selectedBenefitType}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}