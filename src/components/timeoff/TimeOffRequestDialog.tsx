import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Schedule, BenefitBalance } from "./types/scheduleTypes";

interface TimeOffRequestDialogProps {
  schedule: Schedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (type: string) => void;
  benefitBalances?: BenefitBalance;
}

export function TimeOffRequestDialog({
  schedule,
  open,
  onOpenChange,
  onSubmit,
  benefitBalances,
}: TimeOffRequestDialogProps) {
  if (!schedule || !benefitBalances) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Time Off</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {format(schedule.date, "MMMM d, yyyy")}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(schedule.startTime, "h:mm a")} - {format(schedule.endTime, "h:mm a")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefitType">Select Benefit Type</Label>
            <Select onValueChange={onSubmit}>
              <SelectTrigger>
                <SelectValue placeholder="Select benefit type" />
              </SelectTrigger>
              <SelectContent>
                {benefitBalances.vacation_hours > 0 && (
                  <SelectItem value="vacation">
                    Vacation ({benefitBalances.vacation_hours} hours)
                  </SelectItem>
                )}
                {benefitBalances.sick_hours > 0 && (
                  <SelectItem value="sick">
                    Sick Leave ({benefitBalances.sick_hours} hours)
                  </SelectItem>
                )}
                {benefitBalances.comp_hours > 0 && (
                  <SelectItem value="comp">
                    Comp Time ({benefitBalances.comp_hours} hours)
                  </SelectItem>
                )}
                {benefitBalances.holiday_hours > 0 && (
                  <SelectItem value="holiday">
                    Holiday ({benefitBalances.holiday_hours} hours)
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}