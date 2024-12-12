import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ProtectedRoute: Current session state:", session);
    
    if (session === null) {
      console.log("ProtectedRoute: No session, redirecting to login");
      navigate("/login");
    } else if (session) {
      console.log("ProtectedRoute: Valid session found");
    }
  }, [session, navigate]);

  // Show a loading state while we're checking the session
  if (session === undefined) {
    console.log("ProtectedRoute: Session is undefined, showing loading state");
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