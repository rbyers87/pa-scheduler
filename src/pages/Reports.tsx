import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Reports = () => {
  const { session, accessToken } = useAuth();
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
      <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6">
            <p>Reports functionality coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;