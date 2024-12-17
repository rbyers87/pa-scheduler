import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Schedule management features coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedule;