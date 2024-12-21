import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RidingListView } from "./RidingListView";
import { CreateRidingList } from "./CreateRidingList";

export function RidingListManager() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const { data: ridingList, refetch } = useQuery({
    queryKey: ["riding-list", selectedDate],
    queryFn: async () => {
      console.log("Fetching riding list for date:", selectedDate);
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

      return data;
    },
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