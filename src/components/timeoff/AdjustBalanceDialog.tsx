import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdjustBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string | null;
}

export function AdjustBalanceDialog({
  open,
  onOpenChange,
  employeeId,
}: AdjustBalanceDialogProps) {
  const [vacationHours, setVacationHours] = useState("");
  const [sickHours, setSickHours] = useState("");
  const [compHours, setCompHours] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateBalances = useMutation({
    mutationFn: async (data: {
      vacation_hours: number;
      sick_hours: number;
      comp_hours: number;
    }) => {
      const { error } = await supabase
        .from("benefit_balances")
        .update({
          vacation_hours: data.vacation_hours,
          sick_hours: data.sick_hours,
          comp_hours: data.comp_hours,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", employeeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["benefit-balances"] });
      toast({
        title: "Balances updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error updating balances:", error);
      toast({
        title: "Error updating balances",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;

    updateBalances.mutate({
      vacation_hours: Number(vacationHours),
      sick_hours: Number(sickHours),
      comp_hours: Number(compHours),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Benefit Balances</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vacationHours">Vacation Hours</Label>
            <Input
              id="vacationHours"
              type="number"
              value={vacationHours}
              onChange={(e) => setVacationHours(e.target.value)}
              min="0"
              step="0.5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sickHours">Sick Hours</Label>
            <Input
              id="sickHours"
              type="number"
              value={sickHours}
              onChange={(e) => setSickHours(e.target.value)}
              min="0"
              step="0.5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="compHours">Comp Hours</Label>
            <Input
              id="compHours"
              type="number"
              value={compHours}
              onChange={(e) => setCompHours(e.target.value)}
              min="0"
              step="0.5"
            />
          </div>
          <Button type="submit" className="w-full">
            Update Balances
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}