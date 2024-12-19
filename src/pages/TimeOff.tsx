import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const TimeOff = () => {
  const { session, access_token } = useAuth(); // Destructure to get access_token
  const navigate = useNavigate();

  useEffect(() => {
    console.log("TimeOff: Checking session", session);
    if (!session) {
      console.log("TimeOff: No session, redirecting to login");
      navigate("/login");
    }
  }, [session, navigate]);

  // Example of using the access_token (if needed for future API calls)
  useEffect(() => {
    if (access_token) {
      console.log("Access token available:", access_token);
      // You can add API calls here that require the access_token
    }
  }, [access_token]);

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Time Off Requests</h2>
      <Card>
        <CardHeader>
          <CardTitle>Time Off Management</CardTitle>
        </CardContent>
        <CardContent>
          <p>Time off request features coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeOff;
