import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function TimeOffRequestForm() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createRequest = useMutation({
    mutationFn: async (data: {
      start_date: string;
      end_date: string;
      type: string;
      notes: string;
    }) => {
      const { error } = await supabase.from("time_off_requests").insert([
        {
          employee_id: session?.user?.id,
          start_date: data.start_date,
          end_date: data.end_date,
          type: data.type,
          notes: data.notes,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-off-requests"] });
      toast({
        title: "Time off request submitted successfully",
      });
      // Reset form
      setStartDate("");
      setEndDate("");
      setType("");
      setNotes("");
    },
    onError: (error) => {
      console.error("Error submitting time off request:", error);
      toast({
        title: "Error submitting request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    createRequest.mutate({
      start_date: startDate,
      end_date: endDate,
      type,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Time Off Type</Label>
        <Select value={type} onValueChange={setType} required>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vacation">Vacation</SelectItem>
            <SelectItem value="sick">Sick Leave</SelectItem>
            <SelectItem value="comp">Comp Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes..."
        />
      </div>
      <Button type="submit">Submit Request</Button>
    </form>
  );
}