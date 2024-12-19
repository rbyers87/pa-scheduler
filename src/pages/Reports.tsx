import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Reports = () => {
  const { session, access_token } = useAuth(); // Destructure to get access_token
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Reports: Checking session", session);
    if (!session) {
      console.log("Reports: No session, redirecting to login");
      navigate("/login");
    }
  }, [session, navigate]);

  // Example of using the access_token (if needed in future API calls)
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
      <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Reporting and analytics features coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
