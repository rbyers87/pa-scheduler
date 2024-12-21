import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log("Login: Checking session", session);
    
    // If user is already logged in, redirect to intended destination or home
    if (session?.user?.id) {
      const from = location.state?.from || "/";
      console.log("Login: User already authenticated, redirecting to", from);
      navigate(from, { replace: true });
    } else {
      setIsChecking(false);
    }
  }, [session, navigate, location]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500">
            Please sign in to your account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}