import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Clock, FileText } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Index: Checking session", session);
    if (!session) {
      console.log("Index: No session, redirecting to login");
      navigate("/login");
    }
  }, [session, navigate]);

  const stats = [
    {
      title: "Employees",
      value: "12",
      icon: Users,
      description: "Active team members",
    },
    {
      title: "Schedules",
      value: "28",
      icon: Calendar,
      description: "This week",
    },
    {
      title: "Time Off",
      value: "3",
      icon: Clock,
      description: "Pending requests",
    },
    {
      title: "Reports",
      value: "4",
      icon: FileText,
      description: "Generated this month",
    },
  ];

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;