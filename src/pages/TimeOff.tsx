/**
 * Time Off Page
 * 
 * Manages employee time off requests and approvals.
 * Features:
 * - Submit time off requests
 * - View request status
 * - Approve/deny requests (for supervisors/admins)
 * - Track benefit balances
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BenefitBalances } from "@/components/timeoff/BenefitBalances";
import { TimeOffRequestForm } from "@/components/timeoff/TimeOffRequestForm";
import { TimeOffHistory } from "@/components/timeoff/TimeOffHistory";
import { FutureSchedule } from "@/components/timeoff/FutureSchedule";

const TimeOff = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate("/login");
    }
  }, [session, navigate]);

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Time Off Management</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Benefit Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <BenefitBalances />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Future Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <FutureSchedule />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Request Time Off</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeOffRequestForm />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Time Off History</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeOffHistory />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeOff;
