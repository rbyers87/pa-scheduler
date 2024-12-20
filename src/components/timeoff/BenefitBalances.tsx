import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AdjustBalanceDialog } from "./AdjustBalanceDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { EmployeeSelect } from "../schedule/EmployeeSelect";

export function BenefitBalances() {
  const { session } = useAuth();
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const { data: userProfile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      console.log("BenefitBalances: Fetching user profile", session?.user?.id);
      
      if (!session?.user?.id) {
        console.error("BenefitBalances: No authenticated user");
        throw new Error("Authentication required");
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("BenefitBalances: Error fetching profile:", error);
        throw error;
      }

      console.log("BenefitBalances: Successfully fetched profile", data);
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const isAdmin = userProfile?.role === "admin";
  const effectiveEmployeeId = isAdmin ? (selectedEmployeeId || session?.user?.id) : session?.user?.id;

  const { data: balances, isLoading, error } = useQuery({
    queryKey: ["benefit-balances", effectiveEmployeeId],
    queryFn: async () => {
      console.log("BenefitBalances: Fetching balances for user", effectiveEmployeeId);
      
      if (!effectiveEmployeeId) {
        console.error("BenefitBalances: No employee ID");
        throw new Error("Employee ID required");
      }

      const { data, error } = await supabase
        .from("benefit_balances")
        .select("*")
        .eq("user_id", effectiveEmployeeId)
        .single();

      if (error) {
        console.error("BenefitBalances: Error fetching balances:", error);
        throw error;
      }

      console.log("BenefitBalances: Successfully fetched balances", data);
      return data;
    },
    enabled: !!effectiveEmployeeId,
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading benefit balances: {error.message}
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
    <div className="space-y-4">
      {isAdmin && (
        <div className="mb-6">
          <EmployeeSelect
            value={selectedEmployeeId || session?.user?.id || ''}
            onValueChange={setSelectedEmployeeId}
          />
        </div>
      )}
      
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
              setSelectedEmployeeId(effectiveEmployeeId);
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