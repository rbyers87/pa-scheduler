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

export function RidingListManager() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { session, accessToken } = useAuth();

  const { data: ridingList, refetch, error } = useQuery({
    queryKey: ["riding-list", selectedDate, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id || !accessToken) {
        console.log("RidingListManager: No valid session");
        throw new Error("Authentication required");
      }

      console.log("RidingListManager: Fetching riding list", {
        date: format(selectedDate, "yyyy-MM-dd"),
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
        .eq("date", format(selectedDate, "yyyy-MM-dd"))
        .order("position");

      if (error) {
        console.error("Error fetching riding list:", error);
        throw error;
      }

      console.log("RidingListManager: Fetched riding list data:", data);
      return data;
    },
    meta: {
      onError: (error: Error) => {
        console.error("Query error:", error);
        toast({
          title: "Error",
          description: "Failed to fetch riding list. Please try again.",
          variant: "destructive",
        });
      }
    },
    enabled: !!session?.user?.id && !!accessToken,
  });

  const handleListCreated = () => {
    setIsCreating(false);
    refetch();
    toast({
      title: "Success",
      description: "Riding list has been created.",
    });
  };

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