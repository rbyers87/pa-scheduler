import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, accessToken } = useAuth(); // Destructure accessToken from context
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ProtectedRoute: Checking session state", { session, accessToken });

    // If no session or accessToken, redirect to login
    if (!session || !accessToken) {
      console.log("ProtectedRoute: No session or accessToken, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [session, accessToken, navigate]);

  // Show loading state while session is undefined
  if (session === undefined) {
    console.log("ProtectedRoute: Session loading");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  // If no session or accessToken, return null (do not render children)
  if (!session || !accessToken) {
    console.log("ProtectedRoute: No session or accessToken, returning null");
    return null;
  }

  console.log("ProtectedRoute: Valid session and accessToken, rendering content");
  return <>{children}</>;
};
