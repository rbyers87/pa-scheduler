import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import { ShiftSelector } from "@/components/schedule/ShiftSelector";
import { RecurringScheduleForm } from "@/components/schedule/RecurringScheduleForm";

const Schedule = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Schedule</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <ScheduleCalendar />
        <div className="space-y-6">
          <RecurringScheduleForm />
        </div>
      </div>
    </div>
  );
};

export default Schedule;