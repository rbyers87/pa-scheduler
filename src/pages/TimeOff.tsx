import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { DateRange } from "react-day-picker";

type TimeOffRequest = {
  type: "vacation" | "sick" | "comp";
  startDate: Date;
  endDate: Date;
  notes?: string;
};

const TimeOff = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<TimeOffRequest>();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["timeOffRequests"],
    queryFn: async () => {
      console.log("Fetching time-off requests");
      const { data, error } = await supabase
        .from("time_off_requests")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error fetching time-off requests:", error);
        throw error;
      }

      console.log("Fetched time-off requests:", data);
      return data;
    },
  });

  const createRequest = useMutation({
    mutationFn: async (data: TimeOffRequest) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase.from("time_off_requests").insert([{
        employee_id: user.id,
        type: data.type,
        start_date: data.startDate.toISOString(),
        end_date: data.endDate.toISOString(),
        notes: data.notes,
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeOffRequests"] });
      toast({
        title: "Success",
        description: "Time-off request submitted successfully",
      });
      form.reset();
      setDateRange(undefined);
    },
    onError: (error) => {
      console.error("Error creating time-off request:", error);
      toast({
        title: "Error",
        description: "Failed to submit time-off request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TimeOffRequest) => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    createRequest.mutate({
      ...data,
      startDate: dateRange.from,
      endDate: dateRange.to,
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Time Off Requests</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Request Time Off</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type of Leave</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select leave type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vacation">Vacation</SelectItem>
                          <SelectItem value="sick">Sick Leave</SelectItem>
                          <SelectItem value="comp">Comp Time</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Date Range</FormLabel>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="rounded-md border"
                  />
                </FormItem>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional notes..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Submit Request</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading requests...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests?.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="capitalize">{request.type}</TableCell>
                      <TableCell>
                        {format(new Date(request.start_date), "MMM d, yyyy")} -{" "}
                        {format(new Date(request.end_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="capitalize">
                        {request.status}
                      </TableCell>
                    </TableRow>
                  ))}
                  {requests?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No requests found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeOff;