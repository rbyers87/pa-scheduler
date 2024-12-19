import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, accessToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("ProtectedRoute: Checking session state", { session, accessToken });

    if (!session || !accessToken) {
      console.log("ProtectedRoute: No session or accessToken, redirecting to login");
      navigate("/login", {
        replace: true,
        state: { from: location.pathname }, // Save intended path for redirection after login
      });
    }
  }, [session, accessToken, navigate, location]);

  // Show loading state while session or accessToken is being determined
  if (session === undefined || accessToken === undefined) {
    console.log("ProtectedRoute: Session or accessToken loading");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  // If session or accessToken is invalid, return null (navigation will handle redirect)
  if (!session || !accessToken) {
    console.log("ProtectedRoute: No valid session or accessToken, returning null");
    return null;
  }

  console.log("ProtectedRoute: Valid session and accessToken, rendering content");
  return <>{children}</>;
};
