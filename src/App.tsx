import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import Schedule from "./pages/Schedule";
import TimeOff from "./pages/TimeOff";
import Employees from "./pages/Employees";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Index from "./pages/Index";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<IndexWithAccessToken />} />
              <Route path="schedule" element={<ScheduleWithAccessToken />} />
              <Route path="time-off" element={<TimeOffWithAccessToken />} />
              <Route path="employees" element={<EmployeesWithAccessToken />} />
              <Route path="reports" element={<ReportsWithAccessToken />} />
              <Route path="settings" element={<SettingsWithAccessToken />} />
            </Route>
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function withAccessToken(Component: React.ComponentType<{ accessToken: string }>) {
  return function WrappedComponent() {
    const { session } = useAuth();
    const accessToken = session?.access_token || "";

    if (!accessToken) {
      console.warn("withAccessToken: No access token available.");
    }

    return <Component accessToken={accessToken} />;
  };
}

// Wrapping components to pass accessToken
const IndexWithAccessToken = withAccessToken(Index);
const ScheduleWithAccessToken = withAccessToken(Schedule);
const TimeOffWithAccessToken = withAccessToken(TimeOff);
const EmployeesWithAccessToken = withAccessToken(Employees);
const ReportsWithAccessToken = withAccessToken(Reports);
const SettingsWithAccessToken = withAccessToken(Settings);

export default App;
