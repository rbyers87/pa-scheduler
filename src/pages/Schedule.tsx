import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import { WeeklySchedule } from "@/components/schedule/WeeklySchedule";
import { DailySchedule } from "@/components/schedule/DailySchedule";
import { RecurringScheduleForm } from "@/components/schedule/RecurringScheduleForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ViewType = "daily" | "weekly" | "monthly";

const Schedule = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [viewType, setViewType] = useState<ViewType>("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    console.log("Schedule: Checking session", session);
    if (!session) {
      console.log("Schedule: No session, redirecting to login");
      navigate("/login");
    }
  }, [session, navigate]);

  if (!session) {
    return null;
  }

  const renderScheduleView = () => {
    switch (viewType) {
      case "daily":
        return <DailySchedule date={selectedDate} />;
      case "weekly":
        return <WeeklySchedule />;
      case "monthly":
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <ScheduleCalendar />
            <div className="space-y-6">
              <RecurringScheduleForm />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Schedule</h2>
        <Select value={viewType} onValueChange={(value: ViewType) => setViewType(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily View</SelectItem>
            <SelectItem value="weekly">Weekly View</SelectItem>
            <SelectItem value="monthly">Monthly View</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-6">
        {renderScheduleView()}
      </div>
    </div>
  );
};

export default Schedule;