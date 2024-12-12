import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session === null) {
      navigate("/login");
    }
  }, [session, navigate]);

  // Show a loading state while we're checking the session
  if (session === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  // Only render children if we have a valid session
  if (!session) {
    return null;
  }

  return <>{children}</>;
};