import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, accessToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("ProtectedRoute: Session state", { 
      session: session?.user?.id, 
      accessToken,
      role: session?.user?.user_metadata?.role 
    });

    if (!session?.user?.id || !accessToken) {
      console.log("ProtectedRoute: No valid session, redirecting to login");
      navigate("/login", {
        replace: true,
        state: { from: location.pathname },
      });
      return;
    }
  }, [session, accessToken, navigate, location]);

  if (!session?.user?.id || !accessToken) {
    console.log("ProtectedRoute: Loading or no session");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  console.log("ProtectedRoute: Rendering protected content");
  return <>{children}</>;
};