import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AdjustBalanceDialog } from "./AdjustBalanceDialog";

export function BenefitBalances() {
  const { session } = useAuth();
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const { data: userProfile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: balances } = useQuery({
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

  const isAdmin = userProfile?.role === "admin";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{balances?.vacation_hours || 0}</div>
            <div className="text-sm text-muted-foreground">Vacation Hours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{balances?.sick_hours || 0}</div>
            <div className="text-sm text-muted-foreground">Sick Hours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{balances?.comp_hours || 0}</div>
            <div className="text-sm text-muted-foreground">Comp Hours</div>
          </CardContent>
        </Card>
      </div>
      
      {isAdmin && (
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setSelectedEmployeeId(session?.user?.id || null);
              setIsAdjustDialogOpen(true);
            }}
          >
            Adjust Balances
          </Button>
        </div>
      )}

      {isAdmin && (
        <AdjustBalanceDialog
          open={isAdjustDialogOpen}
          onOpenChange={setIsAdjustDialogOpen}
          employeeId={selectedEmployeeId}
        />
      )}
    </div>
  );
}