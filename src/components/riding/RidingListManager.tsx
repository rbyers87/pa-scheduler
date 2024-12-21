import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RidingListView } from "./RidingListView";
import { CreateRidingList } from "./CreateRidingList";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export function RidingListManager() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const { data: ridingList, refetch, error, isLoading } = useQuery({
    queryKey: ["riding-list", selectedDate, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.log("RidingListManager: No valid session");
        throw new Error("Authentication required");
      }

      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      console.log("RidingListManager: Fetching riding list", {
        date: formattedDate,
        userId: session.user.id,
        role: session.user.user_metadata?.role
      });
      
      const { data, error } = await supabase
        .from("riding_lists")
        .select(`
          id,
          position,
          status,
          employee:profiles(
            id,
            first_name,
            last_name
          )
        `)
        .eq("date", formattedDate)
        .order("position");

      if (error) {
        console.error("Error fetching riding list:", error);
        throw error;
      }

      console.log("RidingListManager: Fetched riding list data:", data);
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const handleListCreated = () => {
    setIsCreating(false);
    refetch();
    toast({
      title: "Success",
      description: "Riding list has been created.",
    });
  };

  if (!session) {
    return (
      <Alert>
        <AlertDescription>
          Please log in to view the riding list.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading riding list: {error.message}
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Riding List - {format(selectedDate, "MMMM d, yyyy")}</span>
          {!isCreating && !ridingList?.length && (
            <Button onClick={() => setIsCreating(true)}>Create List</Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isCreating ? (
          <CreateRidingList
            date={selectedDate}
            onSuccess={handleListCreated}
            onCancel={() => setIsCreating(false)}
          />
        ) : (
          <RidingListView
            ridingList={ridingList || []}
            onUpdate={refetch}
            date={selectedDate}
          />
        )}
      </CardContent>
    </Card>
  );
}