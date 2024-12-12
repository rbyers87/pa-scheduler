import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("ProtectedRoute: Mounting component");
    const checkSession = async () => {
      console.log("ProtectedRoute: Checking session state:", session);
      
      if (session === null) {
        console.log("ProtectedRoute: No session found, redirecting to login");
        navigate("/login");
      } else if (session) {
        console.log("ProtectedRoute: Valid session found", session);
        setIsLoading(false);
      }
    };

    checkSession();
  }, [session, navigate]);

  // Show loading state while checking session or loading
  if (isLoading || session === undefined) {
    console.log("ProtectedRoute: Loading state", { isLoading, session });
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

  console.log("ProtectedRoute: Rendering protected content");
  return <>{children}</>;
};