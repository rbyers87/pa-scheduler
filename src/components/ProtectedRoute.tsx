import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ProtectedRoute: Checking session state", { session });
    
    if (session === null) {
      console.log("ProtectedRoute: No session, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [session, navigate]);

  // Show loading state while session is undefined
  if (session === undefined) {
    console.log("ProtectedRoute: Session loading");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  // Only render children if we have a valid session
  if (!session) {
    console.log("ProtectedRoute: No session, returning null");
    return null;
  }

  console.log("ProtectedRoute: Valid session, rendering content");
  return <>{children}</>;
};