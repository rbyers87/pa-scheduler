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
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export function TimeOffHistory() {
  const { session } = useAuth();

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ["time-off-requests", session?.user?.id],
    queryFn: async () => {
      console.log("TimeOffHistory: Fetching requests for user", session?.user?.id);
      
      if (!session?.user?.id) {
        console.error("TimeOffHistory: No authenticated user");
        throw new Error("Authentication required");
      }

      const { data, error } = await supabase
        .from("time_off_requests")
        .select("*")
        .eq("employee_id", session.user.id)
        .order("start_date", { ascending: false });

      if (error) {
        console.error("TimeOffHistory: Error fetching requests:", error);
        throw error;
      }

      console.log("TimeOffHistory: Successfully fetched requests", data);
      return data;
    },
    enabled: !!session?.user?.id,
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading time off requests: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!requests?.length) {
    return (
      <Alert>
        <AlertDescription>No time off requests found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                {format(new Date(request.start_date), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                {format(new Date(request.end_date), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="capitalize">{request.type}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    request.status === "approved"
                      ? "default"
                      : request.status === "rejected"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell>{request.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}